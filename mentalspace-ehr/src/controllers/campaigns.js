const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Contact = require('../models/Contact');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all campaigns
// @route     GET /api/v1/campaigns
// @access    Private
exports.getCampaigns = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single campaign
// @route     GET /api/v1/campaigns/:id
// @access    Private
exports.getCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate({
      path: 'assignedTo',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'tasks',
      select: 'title type status dueDate'
    })
    .populate({
      path: 'recipients.leads',
      select: 'firstName lastName email status'
    })
    .populate({
      path: 'recipients.clients',
      select: 'firstName lastName email status'
    })
    .populate({
      path: 'recipients.contacts',
      select: 'firstName lastName email type'
    });

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Accessed campaign: ${campaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// @desc      Create new campaign
// @route     POST /api/v1/campaigns
// @access    Private
exports.createCampaign = asyncHandler(async (req, res, next) => {
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

  // Validate recipients if provided
  if (req.body.recipients) {
    // Validate leads
    if (req.body.recipients.leads && req.body.recipients.leads.length > 0) {
      for (const leadId of req.body.recipients.leads) {
        const lead = await Lead.findById(leadId);
        if (!lead) {
          return next(
            new ErrorResponse(`Lead not found with id of ${leadId}`, 404)
          );
        }
      }
    }

    // Validate clients
    if (req.body.recipients.clients && req.body.recipients.clients.length > 0) {
      for (const clientId of req.body.recipients.clients) {
        const client = await Client.findById(clientId);
        if (!client) {
          return next(
            new ErrorResponse(`Client not found with id of ${clientId}`, 404)
          );
        }
      }
    }

    // Validate contacts
    if (req.body.recipients.contacts && req.body.recipients.contacts.length > 0) {
      for (const contactId of req.body.recipients.contacts) {
        const contact = await Contact.findById(contactId);
        if (!contact) {
          return next(
            new ErrorResponse(`Contact not found with id of ${contactId}`, 404)
          );
        }
      }
    }
  }

  const campaign = await Campaign.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Created campaign: ${campaign.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: campaign
  });
});

// @desc      Update campaign
// @route     PUT /api/v1/campaigns/:id
// @access    Private
exports.updateCampaign = asyncHandler(async (req, res, next) => {
  let campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404)
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

  // Validate recipients if provided
  if (req.body.recipients) {
    // Validate leads
    if (req.body.recipients.leads && req.body.recipients.leads.length > 0) {
      for (const leadId of req.body.recipients.leads) {
        const lead = await Lead.findById(leadId);
        if (!lead) {
          return next(
            new ErrorResponse(`Lead not found with id of ${leadId}`, 404)
          );
        }
      }
    }

    // Validate clients
    if (req.body.recipients.clients && req.body.recipients.clients.length > 0) {
      for (const clientId of req.body.recipients.clients) {
        const client = await Client.findById(clientId);
        if (!client) {
          return next(
            new ErrorResponse(`Client not found with id of ${clientId}`, 404)
          );
        }
      }
    }

    // Validate contacts
    if (req.body.recipients.contacts && req.body.recipients.contacts.length > 0) {
      for (const contactId of req.body.recipients.contacts) {
        const contact = await Contact.findById(contactId);
        if (!contact) {
          return next(
            new ErrorResponse(`Contact not found with id of ${contactId}`, 404)
          );
        }
      }
    }
  }

  campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Updated campaign: ${campaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// @desc      Delete campaign
// @route     DELETE /api/v1/campaigns/:id
// @access    Private
exports.deleteCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is active
  if (campaign.status === 'Active') {
    return next(
      new ErrorResponse(`Cannot delete an active campaign`, 400)
    );
  }

  await campaign.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Deleted campaign: ${campaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add recipients to campaign
// @route     PUT /api/v1/campaigns/:id/recipients
// @access    Private
exports.addCampaignRecipients = asyncHandler(async (req, res, next) => {
  let campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Initialize recipients arrays if they don't exist
  if (!campaign.recipients.leads) campaign.recipients.leads = [];
  if (!campaign.recipients.clients) campaign.recipients.clients = [];
  if (!campaign.recipients.contacts) campaign.recipients.contacts = [];

  // Add leads
  if (req.body.leads && req.body.leads.length > 0) {
    for (const leadId of req.body.leads) {
      // Check if lead exists
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return next(
          new ErrorResponse(`Lead not found with id of ${leadId}`, 404)
        );
      }

      // Check if lead is already in the campaign
      if (!campaign.recipients.leads.includes(leadId)) {
        campaign.recipients.leads.push(leadId);
      }
    }
  }

  // Add clients
  if (req.body.clients && req.body.clients.length > 0) {
    for (const clientId of req.body.clients) {
      // Check if client exists
      const client = await Client.findById(clientId);
      if (!client) {
        return next(
          new ErrorResponse(`Client not found with id of ${clientId}`, 404)
        );
      }

      // Check if client is already in the campaign
      if (!campaign.recipients.clients.includes(clientId)) {
        campaign.recipients.clients.push(clientId);
      }
    }
  }

  // Add contacts
  if (req.body.contacts && req.body.contacts.length > 0) {
    for (const contactId of req.body.contacts) {
      // Check if contact exists
      const contact = await Contact.findById(contactId);
      if (!contact) {
        return next(
          new ErrorResponse(`Contact not found with id of ${contactId}`, 404)
        );
      }

      // Check if contact is already in the campaign
      if (!campaign.recipients.contacts.includes(contactId)) {
        campaign.recipients.contacts.push(contactId);
      }
    }
  }

  // Update campaign
  campaign.updatedBy = req.user.id;
  campaign.updatedAt = Date.now();
  await campaign.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Added recipients to campaign: ${campaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// @desc      Remove recipient from campaign
// @route     DELETE /api/v1/campaigns/:id/recipients/:type/:recipientId
// @access    Private
exports.removeCampaignRecipient = asyncHandler(async (req, res, next) => {
  let campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404)
    );
  }

  const { type, recipientId } = req.params;

  // Validate recipient type
  if (!['leads', 'clients', 'contacts'].includes(type)) {
    return next(
      new ErrorResponse(`Invalid recipient type: ${type}`, 400)
    );
  }

  // Check if recipient exists in campaign
  if (!campaign.recipients[type] || !campaign.recipients[type].includes(recipientId)) {
    return next(
      new ErrorResponse(`Recipient not found in campaign`, 404)
    );
  }

  // Remove recipient
  campaign.recipients[type] = campaign.recipients[type].filter(
    id => id.toString() !== recipientId
  );

  // Update campaign
  campaign.updatedBy = req.user.id;
  campaign.updatedAt = Date.now();
  await campaign.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: campaign._id,
    description: `Removed recipient from campaign: ${campaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// @desc      Get campaign statistics
// @route     GET /api/v1/campaigns/stats
// @access    Private
exports.getCampaignStats = asyncHandler(async (req, res, next) => {
  // Get counts by type
  const typeCounts = await Campaign.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get counts by status
  const statusCounts = await Campaign.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get campaigns by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const campaignsByMonth = await Campaign.aggregate([
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

  // Get average metrics
  const metrics = await Campaign.aggregate([
    {
      $group: {
        _id: null,
        avgSent: { $avg: '$metrics.sent' },
        avgDelivered: { $avg: '$metrics.delivered' },
        avgOpened: { $avg: '$metrics.opened' },
        avgClicked: { $avg: '$metrics.clicked' },
        avgResponded: { $avg: '$metrics.responded' },
        avgConverted: { $avg: '$metrics.converted' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: await Campaign.countDocuments(),
      typeCounts,
      statusCounts,
      campaignsByMonth,
      metrics: metrics.length > 0 ? metrics[0] : {}
    }
  });
});
