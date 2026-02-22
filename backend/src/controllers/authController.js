const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password, role } = req.body;

    if (email) email = email.toLowerCase().trim();

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role ? role.toLowerCase() : 'user'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    if (email) email = email.toLowerCase().trim();

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;
    if (email) email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found with this email');
    }

    // In a real app, we would generate a unique token and send an email
    // For this simulation, we'll return a "simulated link" with a JWT reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.json({
        message: 'Password reset instructions sent to email (Simulated)',
        resetLink: `http://localhost:5173/reset-password?token=${resetToken}`
    });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        res.status(400);
        throw new Error('Please provide token and new password');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.password = password;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
};
