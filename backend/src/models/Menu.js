const mongoose = require('mongoose');

const menuSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage']
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
