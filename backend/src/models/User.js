const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('User Model Loaded with roles:', ['user', 'admin', 'owner']);

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: function() {
            return !this.phone && this.authProvider === 'local';
        },
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    emailOtp: String,
    emailOtpExpiry: Date,
    phoneOtp: String,
    phoneOtpExpiry: Date,
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'owner'],
            message: '{VALUE} is not a valid role'
        },
        default: 'user'
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    avatar: {
        type: String,
        default: ''
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    notificationPrefs: {
        orderUpdates: { type: Boolean, default: true },
        newReservations: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        weeklyReport: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
