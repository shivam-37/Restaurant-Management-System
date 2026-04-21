const mongoose = require('mongoose');

const aiAnalyticsSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['recommendation', 'inventory-prediction', 'sentiment', 'description']
    },
    identifier: {
        type: String, // userId, restaurantId, or hash of content
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document will automatically be deleted by MongoDB at this time
    }
}, {
    timestamps: true
});

// Compound index for fast lookups
aiAnalyticsSchema.index({ type: 1, identifier: 1 });

module.exports = mongoose.model('AIAnalytics', aiAnalyticsSchema);
