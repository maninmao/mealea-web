const express = require('express');
const router = express.Router();
const { 
    makeReservation, 
    getMyReservations, 
    getAdminReservations, 
    updateStatus 
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Publicly accessible for logged-in users
router.post('/', protect, makeReservation);
router.get('/my', protect, getMyReservations);

// Admin-only routes for the restaurant staff dashboard
router.get('/admin', protect, admin, getAdminReservations);
router.put('/:id/status', protect, admin, updateStatus);

module.exports = router;