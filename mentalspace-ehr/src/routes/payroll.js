const express = require('express');
const {
  getPayrolls,
  getStaffPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  approvePayroll,
  markPayrollPaid
} = require('../controllers/payroll');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Payroll = require('../models/Payroll');

router
  .route('/')
  .get(
    protect,
    authorize('PRACTICE_ADMIN', 'BILLING'),
    advancedResults(Payroll, {
      path: 'staff',
      select: 'firstName lastName email'
    }),
    getPayrolls
  )
  .post(protect, authorize('PRACTICE_ADMIN', 'BILLING'), createPayroll);

router
  .route('/:id')
  .get(protect, getPayroll)
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), updatePayroll)
  .delete(protect, authorize('PRACTICE_ADMIN', 'BILLING'), deletePayroll);

router
  .route('/:id/approve')
  .put(protect, authorize('PRACTICE_ADMIN'), approvePayroll);

router
  .route('/:id/paid')
  .put(protect, authorize('PRACTICE_ADMIN', 'BILLING'), markPayrollPaid);

module.exports = router;
