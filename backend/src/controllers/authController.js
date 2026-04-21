const path = require('path');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const sendSms = require('../services/smsService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, phone, password, role } = req.body;

    if (email) email = email.toLowerCase().trim();
    if (phone) phone = phone.trim();

    if (!name || (!email && !phone) || !password) {
        res.status(400);
        throw new Error('Please provide name, password, and either email or phone');
    }

    // Check if user exists
    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });
    
    const userExists = await User.findOne({ $or: query });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email or phone');
    }

    // Create user
    role = role ? role.toLowerCase() : 'user';
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const userObj = {
        name,
        password,
        role,
        authProvider: 'local'
    };

    if (email) {
        userObj.email = email;
        userObj.emailOtp = otp;
        userObj.emailOtpExpiry = otpExpiry;
    }
    if (phone) {
        userObj.phone = phone;
        userObj.phoneOtp = otp;
        userObj.phoneOtpExpiry = otpExpiry;
    }

    const user = await User.create(userObj);

    if (user) {
        // Send OTP
        if (email) {
            await sendEmail({
                email: user.email,
                subject: 'Verify your account',
                message: `Your verification OTP is: ${otp}`
            });
        } else if (phone) {
            await sendSms({
                phone: user.phone,
                message: `Your verification OTP is: ${otp}`
            });
        }

        res.status(201).json({
            message: 'Registration successful. Please verify OTP.',
            userId: user._id,
            requiresOtp: true,
            method: email ? 'email' : 'phone'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    let { email, phone, otp } = req.body;

    if (email) email = email.toLowerCase().trim();
    if (phone) phone = phone.trim();

    if ((!email && !phone) || !otp) {
        res.status(400);
        throw new Error('Please provide OTP and either email or phone');
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query).populate('restaurant');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check explicit OTP
    if (email) {
        if (user.emailOtp !== otp || user.emailOtpExpiry < Date.now()) {
            res.status(400);
            throw new Error('Invalid or expired OTP');
        }
        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiry = undefined;
    } else if (phone) {
        if (user.phoneOtp !== otp || user.phoneOtpExpiry < Date.now()) {
            res.status(400);
            throw new Error('Invalid or expired OTP');
        }
        user.isPhoneVerified = true;
        user.phoneOtp = undefined;
        user.phoneOtpExpiry = undefined;
    }

    await user.save();

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurant: user.restaurant,
        token: generateToken(user._id),
    });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
        res.status(400);
        throw new Error('Please provide identifier (email or phone) and password');
    }
    
    identifier = identifier.toLowerCase().trim();

    // Check for user by email or phone
    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    }).populate('restaurant');

    if (user && (await user.matchPassword(password))) {
        // Enforce Verification
        const isEmailLogin = user.email === identifier;
        const isPhoneLogin = user.phone === identifier;

        if (isEmailLogin && !user.isEmailVerified) {
            const otp = generateOtp();
            user.emailOtp = otp;
            user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await sendEmail({
                email: user.email,
                subject: 'Verify your account',
                message: `Your verification OTP is: ${otp}`
            });
            return res.status(403).json({ requiresOtp: true, method: 'email', userId: user._id, message: 'Please verify your email.' });
        }

        if (isPhoneLogin && !user.isPhoneVerified) {
            const otp = generateOtp();
            user.phoneOtp = otp;
            user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await sendSms({
                phone: user.phone,
                message: `Your verification OTP is: ${otp}`
            });
            return res.status(403).json({ requiresOtp: true, method: 'phone', userId: user._id, message: 'Please verify your phone number.' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            restaurant: user.restaurant,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Google Auth Login/Register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { token, role } = req.body; // Role used only if new registration

    if (!token) {
        res.status(400);
        throw new Error('Google token not provided');
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        let user = await User.findOne({ email: payload.email }).populate('restaurant');

        if (!user) {
            // Register new user
            user = await User.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.sub,
                authProvider: 'google',
                isEmailVerified: true,
                role: role ? role.toLowerCase() : 'user'
            });
        } else if (!user.googleId) {
            // Link existing account to Google
            user.googleId = payload.sub;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            await user.save();
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurant: user.restaurant,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401);
        throw new Error('Invalid Google token');
    }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;
    if (email) email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found with this email');
    }

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

const sendOtp = asyncHandler(async (req, res) => {
    let { email, phone } = req.body;
    
    if (!email && !phone) {
        res.status(400);
        throw new Error('Please provide either email or phone');
    }

    if (email) email = email.toLowerCase().trim();
    if (phone) phone = phone.trim();

    const otp = generateOtp();

    if (email) {
        await sendEmail({
            email,
            subject: 'Your Verification Code',
            message: `Your verification OTP is: ${otp}`
        });
        res.status(200).json({ message: 'OTP sent to email', method: 'email' });
    } else if (phone) {
        await sendSms({
            phone,
            message: `Your verification OTP is: ${otp}`
        });
        res.status(200).json({ message: 'OTP sent to phone', method: 'phone' });
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    verifyOtp,
    googleAuth,
    sendOtp
};
