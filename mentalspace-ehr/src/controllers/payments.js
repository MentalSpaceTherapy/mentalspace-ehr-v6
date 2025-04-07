const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Payment = require('../models/Payment');
const Claim = require('../models/Claim');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all payments
// @route     GET /api/v1/payments
// @access    Private
exports.getPayments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get payments for a specific client
// @route     GET /api/v1/clients/:clientId/payments
// @access    Private
exports.getClientPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ client: req.params.clientId })
    .populate({
      path: 'claim',
      select: 'claimNumber serviceDate totalCharged'
    })
    .populate({
      path: 'invoice',
      select: 'invoiceNumber dateIssued totalAmount'
    })
    .sort({ date: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed payments for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc      Get payments for a specific claim
// @route     GET /api/v1/claims/:claimId/payments
// @access    Private
exports.getClaimPayments = asyncHandler(async (req, res, next) => {
  const claim = await Claim.findById(req.params.claimId);
  
  if (!claim) {
    return next(
      new ErrorResponse(`Claim not found with id of ${req.params.claimId}`, 404)
    );
  }

  const payments = await Payment.find({ claim: req.params.claimId })
    .sort({ date: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed payments for claim ID: ${req.params.claimId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc      Get payments for a specific invoice
// @route     GET /api/v1/invoices/:invoiceId/payments
// @access    Private
exports.getInvoicePayments = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.invoiceId);
  
  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.invoiceId}`, 404)
    );
  }

  const payments = await Payment.find({ invoice: req.params.invoiceId })
    .sort({ date: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed payments for invoice ID: ${req.params.invoiceId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc      Get single payment
// @route     GET /api/v1/payments/:id
// @access    Private
exports.getPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName'
    })
    .populate({
      path: 'claim',
      select: 'claimNumber serviceDate totalCharged'
    })
    .populate({
      path: 'invoice',
      select: 'invoiceNumber dateIssued totalAmount'
    })
    .populate({
      path: 'insuranceEOB.insuranceCarrier',
      select: 'name'
    });

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    resourceId: payment._id,
    description: `Accessed payment ID: ${payment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc      Create payment
// @route     POST /api/v1/payments
// @access    Private
exports.createPayment = asyncHandler(async (req, res, next) => {
  // Check if client exists if provided
  if (req.body.client) {
    const client = await Client.findById(req.body.client);
    if (!client) {
      return next(
        new ErrorResponse(`Client not found with id of ${req.body.client}`, 404)
      );
    }
  }

  // Check if claim exists if provided
  if (req.body.claim) {
    const claim = await Claim.findById(req.body.claim);
    if (!claim) {
      return next(
        new ErrorResponse(`Claim not found with id of ${req.body.claim}`, 404)
      );
    }
    
    // If client not provided, get from claim
    if (!req.body.client) {
      req.body.client = claim.client;
    }
  }

  // Check if invoice exists if provided
  if (req.body.invoice) {
    const invoice = await Invoice.findById(req.body.invoice);
    if (!invoice) {
      return next(
        new ErrorResponse(`Invoice not found with id of ${req.body.invoice}`, 404)
      );
    }
    
    // If client not provided, get from invoice
    if (!req.body.client) {
      req.body.client = invoice.client;
    }
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const payment = await Payment.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'BILLING',
    resourceId: payment._id,
    description: `Created ${payment.paymentType} payment of $${payment.amount}`,
    req
  });

  res.status(201).json({
    success: true,
    data: payment
  });
});

// @desc      Update payment
// @route     PUT /api/v1/payments/:id
// @access    Private
exports.updatePayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: payment._id,
    description: `Updated payment ID: ${payment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc      Delete payment
// @route     DELETE /api/v1/payments/:id
// @access    Private
exports.deletePayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  await payment.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'BILLING',
    resourceId: payment._id,
    description: `Deleted payment ID: ${payment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Void payment
// @route     PUT /api/v1/payments/:id/void
// @access    Private
exports.voidPayment = asyncHandler(async (req, res, next) => {
  let payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(
      new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404)
    );
  }

  // Update payment
  payment = await Payment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Voided',
      notes: req.body.notes ? `${payment.notes ? payment.notes + ' | ' : ''}VOIDED: ${req.body.notes}` : `${payment.notes ? payment.notes + ' | ' : ''}VOIDED`,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: payment._id,
    description: `Voided payment ID: ${payment._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: payment
  });
});
