const express = require('express');
const {
  getTimesheets,
  getStaffTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  approveTimesheet,
  rejectTimesheet
} = require('../controllers/timesheets');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Timesheet = require('../models/Timesheet');

router
  .route('/')
  .get(
    protect,
    advancedResults(Timesheet, {
      path: 'staff',
      select: 'firstName lastName email'
    }),
    getTimesheets
  )
  .post(protect, createTimesheet);

router
  .route('/:id')
  .get(protect, getTimesheet)
  .put(protect, updateTimesheet)
  .delete(protect, deleteTimesheet);

router
  .route('/:id/approve')
  .put(protect, authorize('PRACTICE_ADMIN', 'SUPERVISOR'), approveTimesheet);

router
  .route('/:id/reject')
  .put(protect, authorize('PRACTICE_ADMIN', 'SUPERVISOR'), rejectTimesheet);

module.exports = router;
