const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');

const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');

// @desc    Get occupied tables for a specific date and time
// @route   GET /api/reservations/tables/occupied
// @access  Private
const getOccupiedReservationTables = asyncHandler(async (req, res) => {
    const { restaurantId, date, time } = req.query;

    if (!restaurantId || !date || !time) {
        return res.json([]);
    }

    // Find all reservations for this restaurant, date, and time that are NOT Cancelled
    const reservations = await Reservation.find({
        restaurant: restaurantId,
        date: new Date(date),
        time: time,
        status: { $ne: 'Cancelled' }
    });

    const occupiedTables = reservations.map(res => res.tableNumber);
    res.json(occupiedTables);
});

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = asyncHandler(async (req, res) => {
    const { name, phone, date, time, partySize, tableNumber, restaurantId } = req.body;

    if (!name || !phone || !date || !time || !partySize || !tableNumber || !restaurantId) {
        res.status(400);
        throw new Error('Please add all fields including tableNumber and restaurantId');
    }

    // Check for double booking
    const existingReservation = await Reservation.findOne({
        restaurant: restaurantId,
        date: new Date(date),
        time: time,
        tableNumber: tableNumber,
        status: { $ne: 'Cancelled' }
    });

    if (existingReservation) {
        res.status(400);
        throw new Error('This table is already booked for the selected time');
    }

    const reservation = await Reservation.create({
        user: req.user._id,
        restaurant: restaurantId,
        name,
        phone,
        date,
        time,
        partySize,
        tableNumber
    });

    // Notify the owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant && restaurant.owner) {
        await Notification.create({
            user: restaurant.owner,
            message: `A new reservation was booked by ${name} for ${partySize} people at Table ${tableNumber} on ${new Date(date).toLocaleDateString()} at ${time}.`,
            type: 'Reservation',
            isRead: false
        });
    }

    res.status(201).json(reservation);
});

// @desc    Get user reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
    const { restaurantId } = req.query;
    let query = { user: req.user._id };
    if (restaurantId) {
        query.restaurant = restaurantId;
    }
    const reservations = await Reservation.find(query).populate('restaurant', 'name');
    res.json(reservations);
});

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private (Staff/Admin)
const getReservations = asyncHandler(async (req, res) => {
    const { restaurantId } = req.query;
    let query = {};
    if (restaurantId) {
        query.restaurant = restaurantId;
    }
    const reservations = await Reservation.find(query).populate('user', 'name').populate('restaurant', 'name');
    res.json(reservations);
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id
// @access  Private (Staff/Admin)
const updateReservationStatus = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Reservation not found');
    }

    if (req.user.role === 'user') {
        if (reservation.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this reservation');
        }
        if (req.body.status !== 'Cancelled') {
            res.status(400);
            throw new Error('Users can only cancel their reservations');
        }
    }

    reservation.status = req.body.status;
    const updatedReservation = await reservation.save();
    
    // Populate before sending response
    await updatedReservation.populate('user', 'name');
    await updatedReservation.populate('restaurant', 'name');

    res.json(updatedReservation);
});

module.exports = {
    createReservation,
    getMyReservations,
    getReservations,
    updateReservationStatus,
    getOccupiedReservationTables
};
