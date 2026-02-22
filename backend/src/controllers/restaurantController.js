const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurant
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({});
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

module.exports = { getRestaurants, getRestaurantDetails, updateTableStatus };
