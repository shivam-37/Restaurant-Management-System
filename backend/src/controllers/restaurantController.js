const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurant
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({}).populate('owner', 'name avatar');
    res.json(restaurants);
});

// @desc    Get restaurant details and tables
// @route   GET /api/restaurant/:id
// @access  Public
const getRestaurantDetails = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    res.json(restaurant);
});

// @desc    Get current user's restaurants (branches)
// @route   GET /api/restaurant/my
// @access  Private
const getMyRestaurants = asyncHandler(async (req, res) => {
    // Find all restaurants where this user is the owner
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json(restaurants);
});

// @desc    Update a table status
// @route   PUT /api/restaurant/:id/table/:number
// @access  Private/Admin
const updateTableStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id, number } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    const table = restaurant.tables.find(t => t.number === parseInt(number));
    if (!table) {
        res.status(404);
        throw new Error('Table not found');
    }

    table.status = status;
    await restaurant.save();

    res.json(restaurant);
});

// @desc    Create a new restaurant
// @route   POST /api/restaurant
// @access  Private/Admin
const createRestaurant = asyncHandler(async (req, res) => {
    const { name, description, address, cuisine, image, openingTime, closingTime, tables } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a restaurant name');
    }

    const restaurant = await Restaurant.create({
        name,
        description,
        address,
        cuisine,
        image,
        openingTime: openingTime || '10:00',
        closingTime: closingTime || '22:00',
        owner: req.user._id,
        tables: tables || [
            { number: 1, capacity: 4, status: 'Available' },
            { number: 2, capacity: 4, status: 'Available' },
            { number: 3, capacity: 2, status: 'Available' },
            { number: 4, capacity: 6, status: 'Available' }
        ]
    });

    res.status(201).json(restaurant);
});

const QRCode = require('qrcode');

const updateRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedRestaurant);
});

// @desc    Generate a QR code for a specific table
// @route   GET /api/restaurant/:id/table/:number/qr
// @access  Private/Admin
const generateTableQRCode = asyncHandler(async (req, res) => {
    const { id, number } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
        res.status(404);
        throw new Error('Restaurant not found');
    }

    // Check if table exists
    const table = restaurant.tables.find(t => t.number === parseInt(number));
    if (!table) {
        res.status(404);
        throw new Error('Table not found');
    }

    // Determine the base URL for the frontend
    // In production, this might be from an env var like process.env.FRONTEND_URL
    // For now, we will assume standard Vite dev port if not provided.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // The guest menu route we will create in Phase 2
    const qrData = `${frontendUrl}/r/${id}/t/${number}`;

    try {
        // Generate QR code as a data URI (base64 image)
        const qrCodeImage = await QRCode.toDataURL(qrData);
        res.json({ qrCode: qrCodeImage, url: qrData, tableNumber: number });
    } catch (err) {
        res.status(500);
        throw new Error('Failed to generate QR Code');
    }
});

module.exports = { getRestaurants, getRestaurantDetails, getMyRestaurants, updateTableStatus, createRestaurant, updateRestaurant, generateTableQRCode };
