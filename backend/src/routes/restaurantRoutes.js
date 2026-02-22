const express = require('express');
const router = express.Router();
const { getRestaurantDetails, updateTableStatus } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getRestaurantDetails);
router.put('/table/:number', protect, admin, updateTableStatus);

module.exports = router;
