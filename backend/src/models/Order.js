const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Menu'
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    tableNumber: {
        type: Number,
        required: false,
        default: 0
    },
    orderType: {
        type: String,
        enum: ['Dine-In', 'Home Delivery'],
        default: 'Dine-In'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI'],
        default: 'Cash'
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    specialInstructions: {
        type: String,
        default: ''
    },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'] },
        reviewedAt: { type: Date }
    }
}, {
    timestamps: true
});

orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
