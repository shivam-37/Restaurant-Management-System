const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');

// @desc    Get restaurant details and tables
// @route   GET /api/restaurant
// @access  Private
const getRestaurantDetails = asyncHandler(async (req, res) => {
    let restaurant = await Restaurant.findOne();

    // Seed initial data if none exists
    if (!restaurant) {
        restaurant = await Restaurant.create({
            name: "The Gilded Fork",
            tables: [
                { number: 1, capacity: 2, x: 10, y: 10, status: 'Available' },
                { number: 2, capacity: 4, x: 10, y: 40, status: 'Available' },
                { number: 3, capacity: 4, x: 40, y: 10, status: 'Occupied' },
                { number: 4, capacity: 6, x: 40, y: 40, status: 'Reserved' },
                { number: 5, capacity: 2, x: 70, y: 10, status: 'Cleaning' },
                { number: 6, capacity: 4, x: 70, y: 40, status: 'Available' }
            ]
        });
    }

    res.json(restaurant);
});

// @desc    Update a table status
// @route   PUT /api/restaurant/table/:number
// @access  Private/Admin
const updateTableStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { number } = req.params;

    const restaurant = await Restaurant.findOne();
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

module.exports = { getRestaurantDetails, updateTableStatus };
