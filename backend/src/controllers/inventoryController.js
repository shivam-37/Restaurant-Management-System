const asyncHandler = require('express-async-handler');
const InventoryItem = require('../models/InventoryItem');

// @desc    Get all inventory items for a restaurant
// @route   GET /api/inventory?restaurantId=...
// @access  Private (Owner/Admin)
const getInventory = asyncHandler(async (req, res) => {
    const { restaurantId } = req.query;

    if (!restaurantId) {
        res.status(400);
        throw new Error('Restaurant ID is required');
    }

    const items = await InventoryItem.find({ restaurant: restaurantId }).sort({ name: 1 });
    res.json(items);
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private (Owner/Admin)
const createInventoryItem = asyncHandler(async (req, res) => {
    const { restaurantId, name, quantity, unit, costPerUnit, lowStockThreshold } = req.body;

    if (!restaurantId || !name) {
        res.status(400);
        throw new Error('Restaurant ID and Name are required');
    }

    const item = await InventoryItem.create({
        restaurant: restaurantId,
        name,
        quantity: quantity || 0,
        unit: unit || 'kg',
        costPerUnit: costPerUnit || 0,
        lowStockThreshold: lowStockThreshold || 10
    });

    res.status(201).json(item);
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Owner/Admin)
const updateInventoryItem = asyncHandler(async (req, res) => {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Inventory item not found');
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedItem);
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Owner/Admin)
const deleteInventoryItem = asyncHandler(async (req, res) => {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Inventory item not found');
    }

    await item.deleteOne();
    res.json({ id: req.params.id });
});

module.exports = {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};
