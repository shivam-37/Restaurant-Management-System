const express = require('express');
const router = express.Router();
const {
    createOrder,
    createGuestOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics,
    addOrderReview,
    getOccupiedTables
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/analytics').get(protect, getAnalytics); // Place specific routes before parameterized routes
router.route('/tables/occupied').get(getOccupiedTables); // Public route
router.route('/guest').post(createGuestOrder); // Public route for guest checkouts
router.route('/').post(protect, createOrder).get(protect, getOrders);
router.route('/:id').put(protect, updateOrderStatus);
router.route('/:id/review').put(protect, addOrderReview);

module.exports = router;
