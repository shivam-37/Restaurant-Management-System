const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

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

module.exports = { simulateNotification, getNotifications, markAsRead };
