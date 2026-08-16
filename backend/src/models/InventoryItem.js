const mongoose = require('mongoose');

const inventoryItemSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'kg' // e.g., kg, liters, units, grams
    },
    costPerUnit: {
        type: Number,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

inventoryItemSchema.index({ restaurant: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
