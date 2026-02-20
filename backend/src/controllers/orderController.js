const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, totalPrice, tableNumber } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            user: req.user._id,
            items,
            totalPrice,
            tableNumber
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Staff/Admin)
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Staff/Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get total sales and stats
// @route   GET /api/orders/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ status: { $ne: 'Completed' } });

    // Calculate total sales
    const orders = await Order.find({ status: 'Completed' });
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Get today's activity
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysOrders = await Order.find({ createdAt: { $gte: todayStart } });
    const newCustomers = new Set(todaysOrders.map(o => o.user.toString())).size;

    res.json({
        totalOrders,
        activeOrders,
        totalSales,
        newCustomers
    });
});

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics
};
