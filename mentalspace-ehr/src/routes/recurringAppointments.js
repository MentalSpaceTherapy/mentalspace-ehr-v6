const express = require('express');
const {
  getRecurringAppointments,
  getClientRecurringAppointments,
  getProviderRecurringAppointments,
  getRecurringAppointment,
  createRecurringAppointment,
  updateRecurringAppointment,
  cancelRecurringAppointment,
  addException
} = require('../controllers/recurringAppointments');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const RecurringAppointment = require('../models/RecurringAppointment');

router
  .route('/')
  .get(
    protect,
    advancedResults(RecurringAppointment, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'provider', select: 'firstName lastName' }
    ]),
    getRecurringAppointments
  )
  .post(protect, createRecurringAppointment);

router
  .route('/:id')
  .get(protect, getRecurringAppointment)
  .put(protect, updateRecurringAppointment);

router
  .route('/:id/cancel')
  .put(protect, cancelRecurringAppointment);

router
  .route('/:id/exceptions')
  .post(protect, addException);

module.exports = router;
