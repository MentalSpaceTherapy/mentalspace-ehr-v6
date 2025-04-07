const express = require('express');
const {
  getInvoices,
  getClientInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  addInvoiceReminder,
  voidInvoice
} = require('../controllers/invoices');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Invoice = require('../models/Invoice');

router
  .route('/')
  .get(
    protect,
    advancedResults(Invoice, {
      path: 'client',
      select: 'firstName lastName'
    }),
    getInvoices
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createInvoice);

router
  .route('/:id')
  .get(protect, getInvoice)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updateInvoice)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deleteInvoice);

router
  .route('/:id/send')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), sendInvoice);

router
  .route('/:id/remind')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), addInvoiceReminder);

router
  .route('/:id/void')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), voidInvoice);

module.exports = router;
