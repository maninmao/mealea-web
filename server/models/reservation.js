const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: { 
        type: String, 
        required: true 
    },
    customerEmail: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        required: [true, 'Date is required'] 
    },
    time: { 
        type: String, 
        required: [true, 'Time is required'] 
    },
    numberOfPeople: { 
        type: Number, 
        required: [true, 'Party size is required'], 
        min: [1, 'Must be at least 1 person'] 
    },
    specialRequests: { 
        type: String 
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);