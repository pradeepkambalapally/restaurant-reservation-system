const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelMyReservation,
  getAllReservations,
  updateReservation,
  adminCancelReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), createReservation);
router.get('/mine', protect, authorize('customer'), getMyReservations);
router.delete('/:id', protect, authorize('customer'), cancelMyReservation);

// Admin routes
router.get('/', protect, authorize('admin'), getAllReservations); // supports ?date=YYYY-MM-DD
router.put('/:id', protect, authorize('admin'), updateReservation);
router.delete('/:id/admin', protect, authorize('admin'), adminCancelReservation);

module.exports = router;