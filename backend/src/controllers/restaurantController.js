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

// @desc    Create a new restaurant
// @route   POST /api/restaurant
// @access  Private/Admin
const createRestaurant = asyncHandler(async (req, res) => {
    const { name, description, address, cuisine, image, tables } = req.body;

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
        tables: tables || [
            { number: 1, capacity: 4, status: 'Available' },
            { number: 2, capacity: 4, status: 'Available' },
            { number: 3, capacity: 2, status: 'Available' },
            { number: 4, capacity: 6, status: 'Available' }
        ]
    });

    res.status(201).json(restaurant);
});

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

module.exports = { getRestaurants, getRestaurantDetails, updateTableStatus, createRestaurant, updateRestaurant };
