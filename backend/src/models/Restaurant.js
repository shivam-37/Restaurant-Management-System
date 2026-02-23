const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    cuisine: { type: String },
    image: { type: String },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: { type: Number, default: 4.5 },
    tables: [
        {
            number: { type: Number, required: true },
            capacity: { type: Number, default: 4 },
            status: {
                type: String,
                enum: ['Available', 'Occupied', 'Reserved', 'Cleaning'],
                default: 'Available'
            },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
