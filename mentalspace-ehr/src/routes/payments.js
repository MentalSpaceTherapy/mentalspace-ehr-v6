const express = require('express');
const {
  getPayments,
  getClientPayments,
  getClaimPayments,
  getInvoicePayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  voidPayment
} = require('../controllers/payments');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Payment = require('../models/Payment');

router
  .route('/')
  .get(
    protect,
    advancedResults(Payment, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'claim', select: 'claimNumber serviceDate' },
      { path: 'invoice', select: 'invoiceNumber dateIssued' }
    ]),
    getPayments
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createPayment);

router
  .route('/:id')
  .get(protect, getPayment)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updatePayment)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deletePayment);

router
  .route('/:id/void')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), voidPayment);

module.exports = router;
