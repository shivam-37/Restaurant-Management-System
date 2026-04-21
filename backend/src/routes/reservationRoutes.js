const express = require('express');
const router = express.Router();
const {
    createReservation,
    getMyReservations,
    getReservations,
    updateReservationStatus
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReservation).get(protect, getReservations);
router.route('/my').get(protect, getMyReservations);
router.route('/:id').put(protect, updateReservationStatus);

module.exports = router;
