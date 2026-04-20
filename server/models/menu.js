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
        min: [0, 'Price cannot be negative']
    },
    imageUrl: {
        type: String,
        default: 'default-food.jpg'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        // These match the groups from your mock data
        enum: ['Appetizer', 'Main', 'Dessert', 'Drink'] 
    },
    tag: {
        type: String,
        // Optional field for "Signature", "Popular", etc.
        default: '' 
    },
    isTakeoutAvailable: {
        type: Boolean,
        // If true, this item will show up on the takeout/ordering page
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);