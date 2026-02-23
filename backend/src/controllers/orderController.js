const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, totalPrice, tableNumber, specialInstructions, restaurantId, orderType, paymentMethod, deliveryAddress } = req.body;

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
            tableNumber: tableNumber || 0,
            specialInstructions,
            orderType: orderType || 'Dine-In',
            paymentMethod: paymentMethod || 'Cash',
            deliveryAddress: deliveryAddress || ''
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

    // If user is not management (admin or owner), only get their own orders
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
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
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            res.status(401);
            throw new Error('Not authorized to update order status');
        }

        const oldStatus = order.status;
        order.status = req.body.status || order.status;
        console.log(`Updating Order ${order._id} status: ${oldStatus} -> ${order.status}`);

        let updatedOrder;
        try {
            updatedOrder = await order.save();
            console.log('Order Status Updated Successfully');

            // Handle loyalty points gracefully (don't fail the status update if this fails)
            try {
                if (updatedOrder.status === 'Completed' && oldStatus !== 'Completed') {
                    const user = await User.findById(updatedOrder.user);
                    if (user) {
                        const pointsEarned = Math.floor(updatedOrder.totalPrice * 10);
                        user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
                        await user.save();
                        console.log(`Awarded ${pointsEarned} loyalty points to User ${user.email}`);
                    }
                } else if (oldStatus === 'Completed' && updatedOrder.status !== 'Completed') {
                    const user = await User.findById(updatedOrder.user);
                    if (user) {
                        const pointsLost = Math.floor(updatedOrder.totalPrice * 10);
                        user.loyaltyPoints = Math.max(0, (user.loyaltyPoints || 0) - pointsLost);
                        await user.save();
                        console.log(`Deducted ${pointsLost} loyalty points from User ${user.email}`);
                    }
                }
            } catch (pointsError) {
                console.error('Loyalty points update failed:', pointsError.message);
                // We don't throw here so the status update response still goes through
            }

            res.json(updatedOrder);
        } catch (error) {
            console.error('Order Update Failed:', error.message);
            res.status(400);
            throw new Error(`Order update failed: ${error.message}`);
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get total sales and stats
// @route   GET /api/orders/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
    const { restaurantId } = req.query;
    const isManagement = req.user.role === 'admin' || req.user.role === 'owner';

    // Base match for queries
    let baseMatch = {};
    if (restaurantId) {
        baseMatch.restaurant = new (require('mongoose').Types.ObjectId)(restaurantId);
    }

    // Authorization filter
    let userFilter = {};
    if (!isManagement) {
        userFilter.user = req.user._id;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Run basic counts and sales in parallel
    const [totalOrders, activeOrders, totalSalesResult, newCustomersResult] = await Promise.all([
        Order.countDocuments({ ...baseMatch, ...userFilter }),
        Order.countDocuments({
            ...baseMatch,
            ...userFilter,
            status: { $nin: ['Completed', 'Cancelled'] }
        }),
        Order.aggregate([
            { $match: { ...baseMatch, ...userFilter, status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        // New customers today: distinctly count users who placed their first completed order today? 
        // Or just users with completed orders today? Let's stick to unique users with orders today for now as per current logic but only "Completed"
        Order.aggregate([
            {
                $match: {
                    ...baseMatch,
                    createdAt: { $gte: todayStart },
                    status: { $ne: 'Cancelled' }
                }
            },
            { $group: { _id: '$user' } },
            { $count: 'count' }
        ])
    ]);

    const totalSales = totalSalesResult[0]?.total || 0;
    const newCustomers = newCustomersResult[0]?.count || 0;

    // Daily Sales (Last 7 Days) - Management Only
    let dailySales = [];
    if (isManagement) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        dailySales = await Order.aggregate([
            {
                $match: {
                    ...baseMatch,
                    status: 'Completed',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Fill in missing days with 0 sales
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        dailySales = days.reverse().map(dateStr => {
            const match = dailySales.find(d => d._id === dateStr);
            const dateObj = new Date(dateStr);
            return {
                date: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: match ? match.sales : 0
            };
        });
    }

    // Per-Restaurant Stats - Platform View Only
    let restaurantStats = [];
    if (!restaurantId && isManagement) {
        restaurantStats = await Order.aggregate([
            {
                $group: {
                    _id: "$restaurant",
                    totalOrders: { $sum: 1 },
                    activeOrders: {
                        $sum: {
                            $cond: [{ $not: [{ $in: ["$status", ["Completed", "Cancelled"]] }] }, 1, 0]
                        }
                    },
                    totalSales: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Completed"] }, "$totalPrice", 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "_id",
                    foreignField: "_id",
                    as: "restaurantInfo"
                }
            },
            { $unwind: "$restaurantInfo" },
            {
                $project: {
                    id: "$_id",
                    name: "$restaurantInfo.name",
                    totalOrders: 1,
                    activeOrders: 1,
                    totalSales: 1,
                    cuisine: "$restaurantInfo.cuisine",
                    tableCount: { $size: { $ifNull: ["$restaurantInfo.tables", []] } }
                }
            }
        ]);
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

    // AI Sentiment Analysis (non-blocking - defaults to Neutral if rate-limited)
    let sentiment = 'Neutral';
    if (comment) {
        try {
            const { GoogleGenAI } = require("@google/genai");
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1beta' });
            const prompt = `Analyze the sentiment of this restaurant review. Respond with exactly one word: Positive, Neutral, or Negative. Review: "${comment}"`;
            const result = await ai.models.generateContent({
                model: "models/gemini-2.0-flash",
                contents: prompt
            });
            const text = result.candidates[0].content.parts[0].text.trim();
            if (['Positive', 'Neutral', 'Negative'].includes(text)) {
                sentiment = text;
            }
        } catch (error) {
            // Rate limit or API error - silently default to Neutral
            console.warn('[AI] Sentiment analysis skipped:', error.message);
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
