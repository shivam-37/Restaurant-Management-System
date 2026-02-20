const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
    const { name, phone, date, time, partySize } = req.body;

    if (!name || !phone || !date || !time || !partySize) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const reservation = await Reservation.create({
        user: req.user._id,
        name,
        phone,
        date,
        time,
        partySize
    });

    res.status(201).json(reservation);
});

// @desc    Get user reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ user: req.user._id });
    res.json(reservations);
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private (Staff/Admin)
const getReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({});
    res.json(reservations);
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id
// @access  Private (Staff/Admin)
const updateReservationStatus = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
        reservation.status = req.body.status || reservation.status;
        const updatedReservation = await reservation.save();
        res.json(updatedReservation);
    } else {
        res.status(404);
        throw new Error('Reservation not found');
    }
});

module.exports = {
    createReservation,
    getMyReservations,
    getReservations,
    updateReservationStatus
};
