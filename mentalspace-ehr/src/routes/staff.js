const express = require('express');
const {
  getStaff,
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staff');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getStaffs)
  .post(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), createStaff);

router
  .route('/:id')
  .get(protect, getStaff)
  .put(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), updateStaff)
  .delete(protect, authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'), deleteStaff);

module.exports = router;
