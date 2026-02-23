const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, totalPrice, tableNumber, specialInstructions, restaurantId } = req.body;

    if (!restaurantId) {
        console.error('Order Creation Failed: Missing Restaurant ID');
        res.status(400);
        throw new Error('Restaurant ID is required');
    }

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
            restaurant: restaurantId,
            items,
            totalPrice,
            tableNumber,
            specialInstructions
        });

        const createdOrder = await order.save();
        console.log('Order Created Successfully:', createdOrder._id);
        res.status(201).json(createdOrder);
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    let query = {};
    const { restaurantId } = req.query;

    if (restaurantId) {
        query.restaurant = restaurantId;
    }

    // If user is not admin or staff, only get their own orders
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        query.user = req.user._id;
    }

    const orders = await Order.find(query).populate('user', 'id name').populate('restaurant', 'name');
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Staff/Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            res.status(401);
            throw new Error('Not authorized to update order status');
        }

        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        console.log(`Updating Order ${order._id} status: ${oldStatus} -> ${order.status}`);

        let updatedOrder;
        try {
            updatedOrder = await order.save();
            console.log('Order Updated Successfully');
        } catch (error) {
            console.error('Order Update Failed (Save Error):', error.message);
            res.status(400);
            throw new Error(`Order update failed: ${error.message}`);
        }

        // Award loyalty points if order is marked as Completed
        if (updatedOrder.status === 'Completed' && oldStatus !== 'Completed') {
            const user = await User.findById(updatedOrder.user);
            if (user) {
                const pointsEarned = Math.floor(updatedOrder.totalPrice * 10);
                user.loyaltyPoints += pointsEarned;
                await user.save();
                console.log(`Awarded ${pointsEarned} loyalty points to User ${user.email}`);
            }
        }

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
    const { restaurantId } = req.query;
    let query = {};

    if (restaurantId) {
        query.restaurant = restaurantId;
    }

    if (req.user.role === 'admin' || req.user.role === 'staff') {
        // Global stats for admin/staff
        totalOrders = await Order.countDocuments(query);
        activeOrders = await Order.countDocuments({ ...query, status: { $ne: 'Completed' } });

        const orders = await Order.find({ ...query, status: 'Completed' });
        totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaysOrders = await Order.find({ ...query, createdAt: { $gte: todayStart } });
        newCustomers = new Set(todaysOrders.map(o => o.user.toString())).size;
    } else {
        // Personalized stats for regular users
        totalOrders = await Order.countDocuments({ user: req.user._id, ...query });
        activeOrders = await Order.countDocuments({
            user: req.user._id,
            ...query,
            status: { $nin: ['Completed', 'Cancelled'] }
        });

        const userOrders = await Order.find({ user: req.user._id, ...query, status: 'Completed' });
        totalSales = userOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        newCustomers = 0; // Not applicable for regular users
    }

    // Get per-restaurant stats for Admin (if no restaurantId is specified)
    let restaurantStats = [];
    if (!restaurantId && (req.user.role === 'admin' || req.user.role === 'staff')) {
        const Restaurant = require('../models/Restaurant');
        const restaurants = await Restaurant.find({});

        restaurantStats = await Promise.all(restaurants.map(async (r) => {
            const rOrders = await Order.find({ restaurant: r._id });
            const rTotalSales = rOrders
                .filter(o => o.status === 'Completed')
                .reduce((acc, o) => acc + o.totalPrice, 0);

            return {
                id: r._id,
                name: r.name,
                totalOrders: rOrders.length,
                activeOrders: rOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length,
                totalSales: rTotalSales,
                cuisine: r.cuisine,
                tableCount: r.tables?.length || 0
            };
        }));
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
                ...query,
                status: 'Completed',
                createdAt: { $gte: date, $lt: nextDay }
            });
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: orders.reduce((acc, order) => acc + order.totalPrice, 0)
            };
        }));
    }

    const user = await User.findById(req.user._id);

    res.json({
        totalOrders,
        activeOrders,
        totalSales,
        newCustomers,
        dailySales,
        restaurantStats,
        loyaltyPoints: user ? user.loyaltyPoints : 0
    });
});

const addOrderReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to review this order');
    }

    if (order.status !== 'Completed') {
        res.status(400);
        throw new Error('Can only review completed orders');
    }

    // AI Sentiment Analysis
    let sentiment = 'Neutral';
    if (comment) {
        try {
            const { GoogleGenAI } = require("@google/genai");
            const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY,
                apiVersion: 'v1beta'
            });

            const prompt = `Analyze the sentiment of this restaurant review. Respond with exactly one word: Positive, Neutral, or Negative. Review: "${comment}"`;
            const result = await ai.models.generateContent({
                model: "models/gemini-3-flash-preview",
                contents: prompt
            });
            const text = result.candidates[0].content.parts[0].text.trim();

            if (['Positive', 'Neutral', 'Negative'].includes(text)) {
                sentiment = text;
            }
        } catch (error) {
            console.error('Sentiment analysis failed:', error.message);
        }
    }

    order.review = {
        rating,
        comment,
        sentiment,
        reviewedAt: Date.now()
    };

    await order.save();
    res.json(order);
});

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAnalytics,
    addOrderReview
};
