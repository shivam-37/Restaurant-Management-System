const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, totalPrice, tableNumber, specialInstructions } = req.body;

    if (items && items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // Check stock and decrement
        for (const item of items) {
            const menuItem = await Menu.findById(item.menuItem);
            if (!menuItem) {
                res.status(404);
                throw new Error(`Menu item not found: ${item.name}`);
            }
            if (menuItem.stock < item.quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for ${item.name}`);
            }
            menuItem.stock -= item.quantity;
            await menuItem.save();
        }

        const order = new Order({
            user: req.user._id,
            items,
            totalPrice,
            tableNumber,
            specialInstructions
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    let query = {};

    // If user is not admin or staff, only get their own orders
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        query.user = req.user._id;
    }

    const orders = await Order.find(query).populate('user', 'id name');
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Staff/Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Only admin/staff can update status
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            res.status(401);
            throw new Error('Not authorized to update order status');
        }
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
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
    let totalOrders, activeOrders, totalSales, newCustomers;

    if (req.user.role === 'admin' || req.user.role === 'staff') {
        // Global stats for admin/staff
        totalOrders = await Order.countDocuments();
        activeOrders = await Order.countDocuments({ status: { $ne: 'Completed' } });

        const orders = await Order.find({ status: 'Completed' });
        totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaysOrders = await Order.find({ createdAt: { $gte: todayStart } });
        newCustomers = new Set(todaysOrders.map(o => o.user.toString())).size;
    } else {
        // Personalized stats for regular users
        totalOrders = await Order.countDocuments({ user: req.user._id });
        activeOrders = await Order.countDocuments({
            user: req.user._id,
            status: { $nin: ['Completed', 'Cancelled'] }
        });

        const userOrders = await Order.find({ user: req.user._id, status: 'Completed' });
        totalSales = userOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        newCustomers = 0; // Not applicable for regular users
    }

    // Get daily sales for the last 7 days (Admin only)
    let dailySales = [];
    if (req.user.role === 'admin' || req.user.role === 'staff') {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        dailySales = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            const orders = await Order.find({
                status: 'Completed',
                createdAt: { $gte: date, $lt: nextDay }
            });
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: orders.reduce((acc, order) => acc + order.totalPrice, 0)
            };
        }));
    }

    res.json({
        totalOrders,
        activeOrders,
        totalSales,
        newCustomers,
        dailySales
    });
});

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics
};
