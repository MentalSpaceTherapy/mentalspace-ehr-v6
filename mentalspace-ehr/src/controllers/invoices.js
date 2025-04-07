const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const auditLogger = require('../utils/auditLogger');

// @desc      Get all invoices
// @route     GET /api/v1/invoices
// @access    Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get invoices for a specific client
// @route     GET /api/v1/clients/:clientId/invoices
// @access    Private
exports.getClientInvoices = asyncHandler(async (req, res, next) => {
  const invoices = await Invoice.find({ client: req.params.clientId })
    .sort({ dateIssued: -1 });

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    description: `Accessed invoices for client ID: ${req.params.clientId}`,
    req
  });

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices
  });
});

// @desc      Get single invoice
// @route     GET /api/v1/invoices/:id
// @access    Private
exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate({
      path: 'client',
      select: 'firstName lastName email phone address'
    })
    .populate({
      path: 'items.appointment',
      select: 'startTime appointmentType'
    })
    .populate({
      path: 'items.claim',
      select: 'claimNumber serviceDate'
    })
    .populate({
      path: 'payments',
      select: 'amount date paymentType paymentMethod'
    });

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Log the access
  await auditLogger.log({
    user: req.user.id,
    action: 'READ',
    resourceType: 'BILLING',
    resourceId: invoice._id,
    description: `Accessed invoice ID: ${invoice._id}`,
    req
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc      Create invoice
// @route     POST /api/v1/invoices
// @access    Private
exports.createInvoice = asyncHandler(async (req, res, next) => {
  // Check if client exists
  const client = await Client.findById(req.body.client);
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.body.client}`, 404)
    );
  }

  // Generate invoice number if not provided
  if (!req.body.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await Invoice.countDocuments() + 1;
    req.body.invoiceNumber = `INV-${year}${month}-${count.toString().padStart(4, '0')}`;
  }

  // Set due date if not provided
  if (!req.body.dateDue) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default to 30 days
    req.body.dateDue = dueDate;
  }

  // Add creator to request body
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;

  const invoice = await Invoice.create(req.body);

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'CREATE',
    resourceType: 'BILLING',
    resourceId: invoice._id,
    description: `Created invoice: ${invoice.invoiceNumber} for client: ${client.firstName} ${client.lastName}`,
    req
  });

  res.status(201).json({
    success: true,
    data: invoice
  });
});

// @desc      Update invoice
// @route     PUT /api/v1/invoices/:id
// @access    Private
exports.updateInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent updating certain fields if invoice is not in Draft status
  if (invoice.status !== 'Draft' && (req.body.items || req.body.subtotal || req.body.totalAmount)) {
    return next(
      new ErrorResponse(`Cannot update items or amounts for an invoice with status: ${invoice.status}`, 403)
    );
  }

  // Add updater to request body
  req.body.updatedBy = req.user.id;

  invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'UPDATE',
    resourceType: 'BILLING',
    resourceId: invoice._id,
    description: `Updated invoice: ${invoice.invoiceNumber}`,
    req
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc      Delete invoice
// @route     DELETE /api/v1/invoices/:id
// @access    Private
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Only allow deletion of draft invoices
  if (invoice.status !== 'Draft') {
    return next(
      new ErrorResponse(`Cannot delete an invoice with status: ${invoice.status}`, 403)
    );
  }

  await invoice.remove();

  // Log the action
  await auditLogger.log({
    user: req.user.id,
    action: 'DELETE',
    resourceType: 'BILLING',
    resourceId: invoice._id,
    description: `Deleted invoice: ${invoice.invoiceNumber}`,
    req
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Send invoice
// @route     PUT /api/v1/invoices/:id/send
// @access    Private
exports.sendInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if invoice can be sent
  if (invoice.status !== 'Draft' && invoice.status !== 'Issued') {
    return next(
      new ErrorResponse(`Cannot send an invoice with status: ${invoice.status}`, 403)
    );
  }

  // Update invoice
  invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Sent',
      sentVia: req.body.sentVia || 'Email',
      sentDate: Date.now(),
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
    resourceId: invoice._id,
    description: `Sent invoice: ${invoice.invoiceNumber} via ${invoice.sentVia}`,
    req
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc      Add reminder to invoice
// @route     PUT /api/v1/invoices/:id/remind
// @access    Private
exports.addInvoiceReminder = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if invoice can be reminded
  if (invoice.status !== 'Sent' && invoice.status !== 'Partially Paid' && invoice.status !== 'Overdue') {
    return next(
      new ErrorResponse(`Cannot send reminder for an invoice with status: ${invoice.status}`, 403)
    );
  }

  // Add reminder
  const reminder = {
    date: Date.now(),
    method: req.body.method || 'Email',
    sentBy: req.user.id
  };

  invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { 
      $push: { remindersSent: reminder },
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
    resourceId: invoice._id,
    description: `Sent reminder for invoice: ${invoice.invoiceNumber} via ${reminder.method}`,
    req
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc      Void invoice
// @route     PUT /api/v1/invoices/:id/void
// @access    Private
exports.voidInvoice = asyncHandler(async (req, res, next) => {
  let invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(
      new ErrorResponse(`Invoice not found with id of ${req.params.id}`, 404)
    );
  }

  // Update invoice
  invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Void',
      notes: req.body.notes ? `${invoice.notes ? invoice.notes + ' | ' : ''}VOIDED: ${req.body.notes}` : `${invoice.notes ? invoice.notes + ' | ' : ''}VOIDED`,
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
    resourceId: invoice._id,
    description: `Voided invoice: ${invoice.invoiceNumber}`,
    req
  });

  res.status(200).json({
    success: true,
    data: invoice
  });
});
