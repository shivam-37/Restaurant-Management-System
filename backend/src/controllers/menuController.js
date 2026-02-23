const asyncHandler = require('express-async-handler');
const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
    const { restaurantId } = req.query;

    if (!restaurantId) {
        res.json([]);
        return;
    }

    const menuItems = await Menu.find({ restaurant: restaurantId });
    res.json(menuItems);
});

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category, image, stock, restaurantId } = req.body;

    console.log('Creating menu item with data:', { name, price, category, restaurantId });

    if (!name || !description || price === undefined || price === null || !category || !restaurantId) {
        console.error('Validation failed: Missing fields', { name, description, price, category, restaurantId });
        res.status(400);
        throw new Error('Please add all fields including restaurantId');
    }

    const menuItem = await Menu.create({
        name,
        description,
        price,
        category,
        image,
        stock: stock || 0,
        restaurant: restaurantId
    });

    res.status(201).json(menuItem);
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.json(updatedMenuItem);
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
        res.status(404);
        throw new Error('Menu item not found');
    }

    await menuItem.deleteOne();

    res.json({ id: req.params.id });
});

module.exports = {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
