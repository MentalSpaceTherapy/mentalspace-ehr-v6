const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const EmailCampaign = require('../models/EmailCampaign');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Contact = require('../models/Contact');
const Staff = require('../models/Staff');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all email campaigns
// @route     GET /api/v1/email-campaigns
// @access    Private
exports.getEmailCampaigns = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single email campaign
// @route     GET /api/v1/email-campaigns/:id
// @access    Private
exports.getEmailCampaign = asyncHandler(async (req, res, next) => {
  const emailCampaign = await EmailCampaign.findById(req.params.id)
    .populate({
      path: 'campaign',
      select: 'name type status'
    })
    .populate({
      path: 'createdBy',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'content.template',
      select: 'name subject content'
    });

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Accessed email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Create new email campaign
// @route     POST /api/v1/email-campaigns
// @access    Private
exports.createEmailCampaign = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  // Check if parent campaign exists
  if (req.body.campaign) {
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return next(
        new ErrorResponse(`Campaign not found with id of ${req.body.campaign}`, 404)
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

  const emailCampaign = await EmailCampaign.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Created email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(201).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Update email campaign
// @route     PUT /api/v1/email-campaigns/:id
// @access    Private
exports.updateEmailCampaign = asyncHandler(async (req, res, next) => {
  let emailCampaign = await EmailCampaign.findById(req.params.id);

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is already sent
  if (emailCampaign.status === 'Sent' || emailCampaign.status === 'Sending') {
    return next(
      new ErrorResponse(`Cannot update a campaign that has already been sent or is currently sending`, 400)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  // Check if parent campaign exists
  if (req.body.campaign) {
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return next(
        new ErrorResponse(`Campaign not found with id of ${req.body.campaign}`, 404)
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

  emailCampaign = await EmailCampaign.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Updated email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Delete email campaign
// @route     DELETE /api/v1/email-campaigns/:id
// @access    Private
exports.deleteEmailCampaign = asyncHandler(async (req, res, next) => {
  const emailCampaign = await EmailCampaign.findById(req.params.id);

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is already sent
  if (emailCampaign.status === 'Sent' || emailCampaign.status === 'Sending') {
    return next(
      new ErrorResponse(`Cannot delete a campaign that has already been sent or is currently sending`, 400)
    );
  }

  await emailCampaign.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Deleted email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Schedule email campaign
// @route     PUT /api/v1/email-campaigns/:id/schedule
// @access    Private
exports.scheduleEmailCampaign = asyncHandler(async (req, res, next) => {
  let emailCampaign = await EmailCampaign.findById(req.params.id);

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is already sent or scheduled
  if (emailCampaign.status === 'Sent' || emailCampaign.status === 'Sending' || emailCampaign.status === 'Scheduled') {
    return next(
      new ErrorResponse(`Cannot schedule a campaign that has already been sent, is sending, or is already scheduled`, 400)
    );
  }

  // Validate schedule data
  if (!req.body.sendDate) {
    return next(
      new ErrorResponse('Please provide a send date', 400)
    );
  }

  // Update campaign
  emailCampaign.schedule.sendDate = new Date(req.body.sendDate);
  emailCampaign.schedule.sendTime = req.body.sendTime || '09:00';
  emailCampaign.schedule.timezone = req.body.timezone || 'UTC';
  emailCampaign.schedule.isScheduled = true;
  emailCampaign.status = 'Scheduled';
  emailCampaign.updatedBy = req.user.id;
  emailCampaign.updatedAt = Date.now();

  await emailCampaign.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Scheduled email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Send email campaign now
// @route     PUT /api/v1/email-campaigns/:id/send
// @access    Private
exports.sendEmailCampaign = asyncHandler(async (req, res, next) => {
  let emailCampaign = await EmailCampaign.findById(req.params.id);

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is already sent or sending
  if (emailCampaign.status === 'Sent' || emailCampaign.status === 'Sending') {
    return next(
      new ErrorResponse(`Cannot send a campaign that has already been sent or is currently sending`, 400)
    );
  }

  // Check if campaign has recipients
  const totalRecipients = 
    (emailCampaign.recipients.leads ? emailCampaign.recipients.leads.length : 0) +
    (emailCampaign.recipients.clients ? emailCampaign.recipients.clients.length : 0) +
    (emailCampaign.recipients.contacts ? emailCampaign.recipients.contacts.length : 0);

  if (totalRecipients === 0) {
    return next(
      new ErrorResponse(`Cannot send a campaign with no recipients`, 400)
    );
  }

  // Update campaign status
  emailCampaign.status = 'Sending';
  emailCampaign.updatedBy = req.user.id;
  emailCampaign.updatedAt = Date.now();
  emailCampaign.sentAt = Date.now();

  await emailCampaign.save();

  // In a real implementation, this would trigger an email sending service
  // For this demo, we'll simulate sending by updating metrics
  
  // Simulate sending process (in a real app, this would be handled by a background job)
  setTimeout(async () => {
    try {
      // Update campaign with sending results
      emailCampaign = await EmailCampaign.findById(emailCampaign._id);
      
      if (emailCampaign) {
        // Update metrics with simulated results
        emailCampaign.metrics.sent = totalRecipients;
        emailCampaign.metrics.delivered = Math.floor(totalRecipients * 0.95); // 95% delivery rate
        
        // Update status
        emailCampaign.status = 'Sent';
        emailCampaign.completedAt = Date.now();
        
        await emailCampaign.save();
        
        // Update parent campaign metrics
        const parentCampaign = await Campaign.findById(emailCampaign.campaign);
        if (parentCampaign) {
          parentCampaign.metrics.sent += emailCampaign.metrics.sent;
          parentCampaign.metrics.delivered += emailCampaign.metrics.delivered;
          await parentCampaign.save();
        }
      }
    } catch (err) {
      console.error('Error updating email campaign after sending:', err);
    }
  }, 5000); // Simulate 5 second processing time

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Sent email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Cancel scheduled email campaign
// @route     PUT /api/v1/email-campaigns/:id/cancel
// @access    Private
exports.cancelEmailCampaign = asyncHandler(async (req, res, next) => {
  let emailCampaign = await EmailCampaign.findById(req.params.id);

  if (!emailCampaign) {
    return next(
      new ErrorResponse(`Email campaign not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if campaign is already sent or sending
  if (emailCampaign.status === 'Sent' || emailCampaign.status === 'Sending') {
    return next(
      new ErrorResponse(`Cannot cancel a campaign that has already been sent or is currently sending`, 400)
    );
  }

  // Update campaign
  emailCampaign.status = 'Cancelled';
  emailCampaign.schedule.isScheduled = false;
  emailCampaign.updatedBy = req.user.id;
  emailCampaign.updatedAt = Date.now();

  await emailCampaign.save();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'CRM',
    resourceId: emailCampaign._id,
    description: `Cancelled email campaign: ${emailCampaign.name}`,
    req
  });

  res.status(200).json({
    success: true,
    data: emailCampaign
  });
});

// @desc      Get email campaign statistics
// @route     GET /api/v1/email-campaigns/stats
// @access    Private
exports.getEmailCampaignStats = asyncHandler(async (req, res, next) => {
  // Get counts by status
  const statusCounts = await EmailCampaign.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get average metrics
  const metrics = await EmailCampaign.aggregate([
    {
      $match: {
        status: 'Sent'
      }
    },
    {
      $group: {
        _id: null,
        avgSent: { $avg: '$metrics.sent' },
        avgDelivered: { $avg: '$metrics.delivered' },
        avgOpened: { $avg: '$metrics.opened' },
        avgClicked: { $avg: '$metrics.clicked' },
        avgBounced: { $avg: '$metrics.bounced' },
        avgUnsubscribed: { $avg: '$metrics.unsubscribed' },
        totalSent: { $sum: '$metrics.sent' },
        totalDelivered: { $sum: '$metrics.delivered' },
        totalOpened: { $sum: '$metrics.opened' },
        totalClicked: { $sum: '$metrics.clicked' }
      }
    }
  ]);

  // Calculate rates
  let rates = {};
  if (metrics.length > 0) {
    const m = metrics[0];
    rates = {
      deliveryRate: m.totalSent > 0 ? (m.totalDelivered / m.totalSent) * 100 : 0,
      openRate: m.totalDelivered > 0 ? (m.totalOpened / m.totalDelivered) * 100 : 0,
      clickRate: m.totalOpened > 0 ? (m.totalClicked / m.totalOpened) * 100 : 0,
      clickToDeliveryRate: m.totalDelivered > 0 ? (m.totalClicked / m.totalDelivered) * 100 : 0
    };
  }

  // Get campaigns by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const campaignsByMonth = await EmailCampaign.aggregate([
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
      total: await EmailCampaign.countDocuments(),
      sent: await EmailCampaign.countDocuments({ status: 'Sent' }),
      scheduled: await EmailCampaign.countDocuments({ status: 'Scheduled' }),
      statusCounts,
      metrics: metrics.length > 0 ? metrics[0] : {},
      rates,
      campaignsByMonth
    }
  });
});
