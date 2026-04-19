const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dish name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price cannot be negative']
    },
    imageUrl: {
        type: String,
        default: 'default-food.jpg'
    }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);