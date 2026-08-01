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
    let { name, email, phone, identifier, password, role } = req.body;

    if (!email && !phone && identifier) {
        const cleanIdent = identifier.trim();
        if (cleanIdent.includes('@')) {
            email = cleanIdent;
        } else {
            phone = cleanIdent;
        }
    }

    if (email) email = email.toLowerCase().trim();
    if (phone) phone = phone.trim();
    if (!email) email = undefined;
    if (!phone) phone = undefined;

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
        // Send OTP asynchronously
        if (email) {
            sendEmail({
                email: user.email,
                subject: 'Verify your account',
                message: `Your verification OTP is: ${otp}`
            }).catch(err => console.error('Background Email Sending Failed:', err));
        } else if (phone) {
            sendSms({
                phone: user.phone,
                message: `Your verification OTP is: ${otp}`
            }).catch(err => console.error('Background SMS Sending Failed:', err));
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
    if (!email) email = undefined;
    if (!phone) phone = undefined;

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
    const cleanDigits = identifier.replace(/\D/g, '');

    const searchConditions = [
        { email: identifier },
        { phone: identifier }
    ];

    // Search for phone matching either exact identifier or ending digits
    if (cleanDigits.length >= 7) {
        searchConditions.push({ 
            phone: { $regex: new RegExp(cleanDigits + '$') } 
        });
    }

    // Check for user by email or phone
    const user = await User.findOne({
        $or: searchConditions
    }).populate('restaurant');

    if (user && (await user.matchPassword(password))) {
        // Enforce 2FA (Two-Factor Authentication) on every login
        const isEmailLogin = identifier.includes('@');
        const isPhoneLogin = !isEmailLogin;

        if (isEmailLogin) {
            const otp = generateOtp();
            user.emailOtp = otp;
            user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            sendEmail({
                email: user.email,
                subject: 'Login Verification Code',
                message: `Your login verification OTP is: ${otp}`
            }).catch(err => console.error('Background Email Sending Failed:', err));
            return res.status(200).json({ requiresOtp: true, method: 'email', userId: user._id, message: 'Please verify your identity with the OTP sent to your email.' });
        }

        if (isPhoneLogin) {
            const otp = generateOtp();
            user.phoneOtp = otp;
            user.phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            sendSms({
                phone: user.phone,
                message: `Your login verification OTP is: ${otp}`
            }).catch(err => console.error('Background SMS Sending Failed:', err));
            return res.status(200).json({ requiresOtp: true, method: 'phone', userId: user._id, message: 'Please verify your identity with the OTP sent to your phone.' });
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

    let payload;

    try {
        // Try verifying as ID token (JWT)
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (idTokenError) {
        // Fallback: Verify as OAuth2 Access Token by fetching userinfo from Google
        try {
            const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (googleRes.ok) {
                payload = await googleRes.json();
            } else {
                throw new Error('Google UserInfo API error');
            }
        } catch (accessTokenError) {
            console.error('Google Auth Verification Error:', idTokenError?.message, accessTokenError?.message);
            res.status(401);
            throw new Error('Invalid Google token');
        }
    }

    if (!payload || !payload.email) {
        res.status(401);
        throw new Error('Could not retrieve user details from Google');
    }

    let user = await User.findOne({ email: payload.email }).populate('restaurant');

    if (!user) {
        // Register new user
        user = await User.create({
            name: payload.name || payload.email.split('@')[0],
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
});

// @desc    Forgot password - Send OTP to email and/or phone
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    let { identifier, email, phone } = req.body;
    let target = identifier || email || phone;

    if (!target) {
        res.status(400);
        throw new Error('Please provide an email address or phone number');
    }

    target = target.trim();
    const isEmail = target.includes('@');
    const cleanEmail = isEmail ? target.toLowerCase() : undefined;
    const cleanPhone = !isEmail ? target : undefined;

    const query = [];
    if (cleanEmail) query.push({ email: cleanEmail });
    if (cleanPhone) {
        query.push({ phone: cleanPhone });
        const cleanDigits = cleanPhone.replace(/\D/g, '');
        if (cleanDigits.length >= 7) {
            query.push({ phone: { $regex: new RegExp(cleanDigits + '$') } });
        }
    }

    const user = await User.findOne({ $or: query });

    if (!user) {
        res.status(404);
        throw new Error('No user found with this email address or phone number');
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.emailOtp = otp;
    user.emailOtpExpiry = otpExpiry;
    user.phoneOtp = otp;
    user.phoneOtpExpiry = otpExpiry;
    await user.save();

    console.log(`\n========================================`);
    console.log(`🔑 [FORGOT PASSWORD OTP] Target User: ${user.name} (${user.email || 'No Email'}, ${user.phone || 'No Phone'}) | OTP Code: ${otp}`);
    console.log(`========================================\n`);

    // Send Email if account has email
    if (user.email) {
        sendEmail({
            email: user.email,
            subject: 'Password Reset OTP - DineFlow',
            message: `Your password reset OTP code is: ${otp}\nThis code is valid for 10 minutes.`
        }).catch(err => console.error('Forgot Password Email Error:', err));
    }

    // Send SMS if account has phone number
    if (user.phone) {
        sendSms({
            phone: user.phone,
            message: `Your password reset OTP code is: ${otp}`
        }).catch(err => console.error('Forgot Password SMS Error:', err));
    }

    const deliveryMethod = user.email ? 'email' : 'phone';
    const displayTarget = user.email ? user.email : user.phone;

    res.json({
        message: `OTP verification code sent to ${displayTarget}`,
        method: deliveryMethod,
        target: displayTarget,
        userId: user._id,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
});

// @desc    Reset password using OTP or Token
// @route   POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
    let { identifier, email, phone, token, otp, password } = req.body;

    console.log('\n========================================');
    console.log('🔑 [RESET PASSWORD REQUEST RECEIVED]');
    console.log('Payload:', { identifier, email, phone, token, otp, password: password ? '******' : undefined });
    console.log('========================================\n');

    if (!password) {
        res.status(400);
        throw new Error('Please enter a new password');
    }

    // Token-based fallback reset
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                res.status(404);
                throw new Error('User not found');
            }

            user.password = password.trim();
            await user.save();

            return res.json({ message: 'Password reset successfully! You can now log in.' });
        } catch (error) {
            res.status(400);
            throw new Error('Invalid or expired reset token');
        }
    }

    // OTP-based reset
    if (!otp) {
        res.status(400);
        throw new Error('Please enter your 6-digit OTP verification code');
    }

    let user = null;
    let target = identifier || email || phone;
    if (target) {
        target = target.trim();
        const isEmail = target.includes('@');
        const cleanEmail = isEmail ? target.toLowerCase() : undefined;
        const cleanPhone = !isEmail ? target : undefined;

        const query = [];
        if (cleanEmail) query.push({ email: cleanEmail });
        if (cleanPhone) {
            query.push({ phone: cleanPhone });
            const cleanDigits = cleanPhone.replace(/\D/g, '');
            if (cleanDigits.length >= 7) {
                query.push({ phone: { $regex: new RegExp(cleanDigits + '$') } });
            }
        }
        user = await User.findOne({ $or: query });
    }

    // Fallback: Match user directly by active unexpired OTP code
    if (!user) {
        user = await User.findOne({
            $or: [
                { emailOtp: otp, emailOtpExpiry: { $gte: new Date() } },
                { phoneOtp: otp, phoneOtpExpiry: { $gte: new Date() } }
            ]
        });
    }

    if (!user) {
        res.status(400);
        throw new Error('User not found or invalid reset request');
    }

    // Verify OTP code
    let isValidOtp = false;
    if (user.emailOtp === otp && user.emailOtpExpiry >= Date.now()) {
        isValidOtp = true;
        user.emailOtp = undefined;
        user.emailOtpExpiry = undefined;
    } else if (user.phoneOtp === otp && user.phoneOtpExpiry >= Date.now()) {
        isValidOtp = true;
        user.phoneOtp = undefined;
        user.phoneOtpExpiry = undefined;
    }

    if (!isValidOtp) {
        res.status(400);
        throw new Error('Invalid or expired 6-digit OTP code');
    }

    user.password = password.trim();
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in.' });
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
    if (!email) email = undefined;
    if (!phone) phone = undefined;

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user) {
        if (email) {
            user.emailOtp = otp;
            user.emailOtpExpiry = otpExpiry;
        } else if (phone) {
            user.phoneOtp = otp;
            user.phoneOtpExpiry = otpExpiry;
        }
        await user.save();
    }

    if (email) {
        sendEmail({
            email,
            subject: 'Your Verification Code',
            message: `Your verification OTP is: ${otp}`
        }).catch(err => console.error('Background Email Sending Failed:', err));
        res.status(200).json({ message: 'OTP sent to email', method: 'email' });
    } else if (phone) {
        sendSms({
            phone,
            message: `Your verification OTP is: ${otp}`
        }).catch(err => console.error('Background SMS Sending Failed:', err));
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
