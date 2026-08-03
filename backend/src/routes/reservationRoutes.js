const express = require('express');
const router = express.Router();
const {
    createReservation,
    getMyReservations,
    getReservations,
    updateReservationStatus,
    getOccupiedReservationTables
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/tables/occupied').get(protect, getOccupiedReservationTables);
router.route('/').post(protect, createReservation).get(protect, getReservations);
router.route('/my').get(protect, getMyReservations);
router.route('/:id').put(protect, updateReservationStatus);

module.exports = router;
