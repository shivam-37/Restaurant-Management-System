const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantDetails, updateTableStatus } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', (req, res, next) => {
    console.log('Public GET /api/restaurant reached');
    next();
}, getRestaurants);

router.get('/:id', (req, res, next) => {
    console.log('Public GET /api/restaurant/:id reached');
    next();
}, getRestaurantDetails);

// Protected routes
router.put('/:id/table/:number', protect, admin, updateTableStatus);

module.exports = router;
