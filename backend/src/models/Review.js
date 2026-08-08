const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        required: true
    },
    status: {
        type: String,
        enum: ['approved', 'pending'],
        default: 'approved'
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
