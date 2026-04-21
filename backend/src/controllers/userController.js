const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar || '',
            loyaltyPoints: updatedUser.loyaltyPoints,
            notificationPrefs: updatedUser.notificationPrefs
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users with their order stats
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'user' }).select('-password');

    // Enrich users with order stats
    const enrichedUsers = await Promise.all(users.map(async (user) => {
        const Order = require('../models/Order');
        const orders = await Order.find({ user: user._id });
        const totalSpent = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        return {
            ...user._doc,
            orderCount: orders.length,
            totalSpent: totalSpent.toFixed(2)
        };
    }));

    res.json(enrichedUsers);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete own account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    await user.deleteOne();
    res.json({ message: 'Account deleted successfully' });
});

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
const updateNotifications = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.notificationPrefs = { ...user.notificationPrefs?.toObject?.() || {}, ...req.body };
    await user.save();
    res.json({ notificationPrefs: user.notificationPrefs });
});

module.exports = {
    updateUserProfile,
    getUsers,
    deleteUser,
    deleteAccount,
    updateNotifications
};
