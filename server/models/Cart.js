// server/models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // One user should only have one active cart
    },
    items: [{
        menuItem: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Menu',
            required: true
        },
        quantity: { 
            type: Number, 
            required: true, 
            default: 1,
            min: 1
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);