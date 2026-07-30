const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

// @desc    Simulate sending a notification (Email/SMS)
// @route   POST /api/notifications/simulate
// @access  Private
const simulateNotification = asyncHandler(async (req, res) => {
    const { type, message, recipient } = req.body;

    console.log(`\n--- [MOCK NOTIFICATION] ---`);
    console.log(`Type: ${type.toUpperCase()}`);
    console.log(`To: ${recipient}`);
    console.log(`Message: ${message}`);
    console.log(`---------------------------\n`);

    res.json({ success: true, status: 'Sent via Mock Provider' });
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Push offer/alert notification to customers
// @route   POST /api/notifications/push
// @access  Private (Owner/Admin)
const pushNotification = asyncHandler(async (req, res) => {
    const { message, type, restaurantId } = req.body;

    if (!message || !type || !restaurantId) {
        res.status(400);
        throw new Error('Message, type, and restaurantId are required');
    }

    if (!['Offer', 'Alert'].includes(type)) {
        res.status(400);
        throw new Error('Invalid notification type for push');
    }

    // Find all distinct users who have ordered from this restaurant
    const users = await Order.distinct('user', { restaurant: restaurantId });

    if (!users || users.length === 0) {
        return res.json({ success: true, message: 'No customers found for this restaurant', count: 0 });
    }

    // Create a notification for each user
    const notifications = users.map(userId => ({
        user: userId,
        message: message,
        type: type,
        isRead: false
    }));

    await Notification.insertMany(notifications);

    res.json({ success: true, message: 'Notifications pushed successfully', count: users.length });
});

// @desc    Clear all user notifications
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'Notifications cleared' });
});

module.exports = { simulateNotification, getNotifications, markAsRead, pushNotification, clearNotifications };
