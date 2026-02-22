const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics,
    addOrderReview
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/analytics').get(protect, getAnalytics); // Place specific routes before parameterized routes
router.route('/').post(protect, createOrder).get(protect, getOrders);
router.route('/:id').put(protect, updateOrderStatus);
router.route('/:id/review').put(protect, addOrderReview);

module.exports = router;
