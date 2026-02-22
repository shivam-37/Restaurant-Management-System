const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurantDetails, updateTableStatus } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getRestaurants);
router.get('/:id', getRestaurantDetails);
router.put('/:id/table/:number', protect, admin, updateTableStatus);

module.exports = router;
