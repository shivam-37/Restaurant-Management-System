const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    name: { type: String, required: true },
    tables: [
        {
            number: { type: Number, required: true },
            capacity: { type: Number, default: 4 },
            status: {
                type: String,
                enum: ['Available', 'Occupied', 'Reserved', 'Cleaning'],
                default: 'Available'
            },
            x: { type: Number, default: 0 }, // For visual layout
            y: { type: Number, default: 0 }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
