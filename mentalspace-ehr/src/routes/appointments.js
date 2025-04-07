const express = require('express');
const {
  getAppointments,
  getClientAppointments,
  getProviderAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  completeAppointment
} = require('../controllers/appointments');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Appointment = require('../models/Appointment');

router
  .route('/')
  .get(
    protect,
    advancedResults(Appointment, [
      { path: 'client', select: 'firstName lastName' },
      { path: 'provider', select: 'firstName lastName' }
    ]),
    getAppointments
  )
  .post(protect, createAppointment);

router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'RECEPTIONIST'), deleteAppointment);

router
  .route('/:id/cancel')
  .put(protect, cancelAppointment);

router
  .route('/:id/complete')
  .put(protect, authorize('PRACTICE_ADMIN', 'CLINICIAN', 'INTERN'), completeAppointment);

module.exports = router;
