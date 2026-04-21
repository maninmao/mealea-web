// server/controllers/reservationController.js
const reservationService = require('../services/reservationService');

exports.makeReservation = async (req, res) => {
    try {

        const reservationData = {
            ...req.body,
            user:          req.user._id,
            customerName:  req.body.customerName  || req.user.name,
            customerEmail: req.body.customerEmail || req.user.email
        };

        const reservation = await reservationService.createReservation(reservationData);
        res.status(201).json(reservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await reservationService.getUserReservations(req.user._id);
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminReservations = async (req, res) => {
    try {
        const reservations = await reservationService.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;


        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const updatedReservation = await reservationService.updateReservationStatus(req.params.id, status);
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};