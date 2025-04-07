const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Contact = require('../models/Contact');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all contacts
// @route     GET /api/v1/contacts
// @access    Private
exports.getContacts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single contact
// @route     GET /api/v1/contacts/:id
// @access    Private
exports.getContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'interactions.staff',
      select: 'firstName lastName'
    })
    .populate({
      path: 'campaigns',
      select: 'name type status'
    })
    .populate({
      path: 'tasks',
      select: 'title type status dueDate'
    });

  if (!contact) {
    return next(
      new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CRM',
    resourceId: contact._id,
    description: `Accessed contact: ${contact.firstName} ${contact.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc      Create new contact
// @route     POST /api/v1/contacts
// @access    Private
exports.createContact = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  // Check if assigned staff exists
  if (req.body.assignedTo) {
    const staff = await Staff.findById(req.body.assignedTo);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff not found with id of ${req.body.assignedTo}`, 404)
      );
    }
  }

  const contact = await Contact.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CRM',
    resourceId: contact._id,
    description: `Created contact: ${contact.firstName} ${contact.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: contact
  });
});

// @desc      Update contact
// @route     PUT /api/v1/contacts/:id
// @access    Private
exports.updateContact = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  // Check if assigned staff exists
  if (req.body.assignedTo) {
    const staff = await Staff.findById(req.body.assignedTo);
    if (!staff) {
      return next(
        new ErrorResponse(`Staff not found with id of ${req.body.assignedTo}`, 404)
      );
    }
  }

  contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: contact._id,
    description: `Updated contact: ${contact.firstName} ${contact.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc      Delete contact
// @route     DELETE /api/v1/contacts/:id
// @access    Private
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
    );
  }

  await contact.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CRM',
    resourceId: contact._id,
    description: `Deleted contact: ${contact.firstName} ${contact.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add interaction to contact
// @route     POST /api/v1/contacts/:id/interactions
// @access    Private
exports.addContactInteraction = asyncHandler(async (req, res, next) => {
  let contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(
      new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404)
    );
  }

  // Add staff to interaction
  req.body.staff = req.user.id;

  // Add interaction to contact
  contact.interactions.push(req.body);
  contact.updatedBy = req.user.id;
  contact.updatedAt = Date.now();

  await contact.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: contact._id,
    description: `Added interaction to contact: ${contact.firstName} ${contact.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc      Get contact statistics
// @route     GET /api/v1/contacts/stats
// @access    Private
exports.getContactStats = asyncHandler(async (req, res, next) => {
  // Get counts by type
  const typeCounts = await Contact.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by category
  const categoryCounts = await Contact.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by status
  const statusCounts = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get referral sources
  const referralSources = await Contact.aggregate([
    {
      $match: {
        'referralRelationship.isReferrer': true
      }
    },
    {
      $group: {
        _id: '$organization',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get contacts by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const contactsByMonth = await Contact.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: await Contact.countDocuments(),
      typeCounts,
      categoryCounts,
      statusCounts,
      referralSources,
      contactsByMonth
    }
  });
});
