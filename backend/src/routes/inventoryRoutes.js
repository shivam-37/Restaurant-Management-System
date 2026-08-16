const express = require('express');
const router = express.Router();
const {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getInventory)
    .post(protect, admin, createInventoryItem);

router.route('/:id')
    .put(protect, admin, updateInventoryItem)
    .delete(protect, admin, deleteInventoryItem);

module.exports = router;
