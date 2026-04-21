const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantDetails, getMyRestaurant, updateTableStatus, createRestaurant, updateRestaurant } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', (req, res, next) => {
    console.log('Public GET /api/restaurant reached');
    next();
}, getRestaurants);

// Get my restaurant (must be before /:id)
router.get('/my', protect, getMyRestaurant);

router.get('/:id', (req, res, next) => {
    console.log('Public GET /api/restaurant/:id reached');
    next();
}, getRestaurantDetails);

// Protected routes
router.post('/', protect, admin, createRestaurant);
router.put('/:id', protect, admin, updateRestaurant);
router.put('/:id/table/:number', protect, admin, updateTableStatus);

module.exports = router;
