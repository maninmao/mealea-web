// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    stripeSessionId: { type: String }, 
    status: {
        type: String,
        enum: ['preparing', 'ready', 'completed', 'cancelled'],
        default: 'preparing'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);