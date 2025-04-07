const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all leads
// @route     GET /api/v1/leads
// @access    Private
exports.getLeads = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single lead
// @route     GET /api/v1/leads/:id
// @access    Private
exports.getLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id)
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'preferredProvider',
      select: 'firstName lastName'
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

  if (!lead) {
    return next(
      new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Accessed lead: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: lead
  });
});

// @desc      Create new lead
// @route     POST /api/v1/leads
// @access    Private
exports.createLead = asyncHandler(async (req, res, next) => {
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

  // Check if preferred provider exists
  if (req.body.preferredProvider) {
    const provider = await Staff.findById(req.body.preferredProvider);
    if (!provider) {
      return next(
        new ErrorResponse(`Provider not found with id of ${req.body.preferredProvider}`, 404)
      );
    }
  }

  const lead = await Lead.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Created lead: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: lead
  });
});

// @desc      Update lead
// @route     PUT /api/v1/leads/:id
// @access    Private
exports.updateLead = asyncHandler(async (req, res, next) => {
  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(
      new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404)
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

  // Check if preferred provider exists
  if (req.body.preferredProvider) {
    const provider = await Staff.findById(req.body.preferredProvider);
    if (!provider) {
      return next(
        new ErrorResponse(`Provider not found with id of ${req.body.preferredProvider}`, 404)
      );
    }
  }

  lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Updated lead: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: lead
  });
});

// @desc      Delete lead
// @route     DELETE /api/v1/leads/:id
// @access    Private
exports.deleteLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(
      new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if lead is already converted to client
  if (lead.convertedToClient) {
    return next(
      new ErrorResponse(`Cannot delete a lead that has been converted to client`, 400)
    );
  }

  await lead.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Deleted lead: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add interaction to lead
// @route     POST /api/v1/leads/:id/interactions
// @access    Private
exports.addLeadInteraction = asyncHandler(async (req, res, next) => {
  let lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(
      new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404)
    );
  }

  // Add staff to interaction
  req.body.staff = req.user.id;

  // Add interaction to lead
  lead.interactions.push(req.body);
  lead.updatedBy = req.user.id;
  lead.updatedAt = Date.now();

  await lead.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Added interaction to lead: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: lead
  });
});

// @desc      Convert lead to client
// @route     POST /api/v1/leads/:id/convert
// @access    Private
exports.convertLeadToClient = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(
      new ErrorResponse(`Lead not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if lead is already converted
  if (lead.convertedToClient) {
    return next(
      new ErrorResponse(`Lead has already been converted to client`, 400)
    );
  }

  // Create client from lead data
  const clientData = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    address: lead.address,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    status: 'Active',
    preferredProvider: lead.preferredProvider,
    preferredContactMethod: lead.preferredContactMethod,
    insuranceInformation: lead.insuranceInformation,
    referralSource: lead.referralSource,
    referredBy: lead.referredBy,
    createdBy: req.user.id,
    updatedBy: req.user.id,
    notes: lead.notes,
    tags: lead.tags
  };

  const client = await Client.create(clientData);

  // Update lead with conversion information
  lead.convertedToClient = true;
  lead.convertedClientId = client._id;
  lead.conversionDate = Date.now();
  lead.status = 'Converted';
  lead.updatedBy = req.user.id;
  lead.updatedAt = Date.now();

  await lead.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: lead._id,
    description: `Converted lead to client: ${lead.firstName} ${lead.lastName}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {
      lead,
      client
    }
  });
});

// @desc      Get lead statistics
// @route     GET /api/v1/leads/stats
// @access    Private
exports.getLeadStats = asyncHandler(async (req, res, next) => {
  // Get counts by status
  const statusCounts = await Lead.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by source
  const sourceCounts = await Lead.aggregate([
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get conversion rate
  const totalLeads = await Lead.countDocuments();
  const convertedLeads = await Lead.countDocuments({ convertedToClient: true });
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Get leads by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const leadsByMonth = await Lead.aggregate([
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
      totalLeads,
      convertedLeads,
      conversionRate,
      statusCounts,
      sourceCounts,
      leadsByMonth
    }
  });
});
