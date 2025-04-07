const express = require('express');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  setLocationAsPrimary,
  getPrimaryLocation,
  updateOperatingHours
} = require('../controllers/locations');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Location = require('../models/Location');

router
  .route('/')
  .get(
    protect,
    advancedResults(Location, [
      { path: 'createdBy', select: 'firstName lastName' },
      { path: 'updatedBy', select: 'firstName lastName' }
    ]),
    getLocations
  )
  .post(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    createLocation
  );

router
  .route('/primary')
  .get(
    protect,
    getPrimaryLocation
  );

router
  .route('/:id')
  .get(
    protect,
    getLocation
  )
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    updateLocation
  )
  .delete(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    deleteLocation
  );

router
  .route('/:id/set-primary')
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    setLocationAsPrimary
  );

router
  .route('/:id/operating-hours')
  .put(
    protect,
    authorize('PRACTICE_ADMIN', 'SYSTEM_ADMIN'),
    updateOperatingHours
  );

module.exports = router;
