const Reservation = require('../models/Reservation');

exports.createReservation = async (reservationData) => {
    return await Reservation.create(reservationData);
};

exports.getUserReservations = async (userId) => {
    // Sort by date, newest first
    return await Reservation.find({ user: userId }).sort({ date: -1 });
};

exports.getAllReservations = async () => {
    // Populate the user field just in case we need extra info on the admin dashboard
    return await Reservation.find().populate('user', 'name email').sort({ date: -1 });
};

exports.updateReservationStatus = async (id, status) => {
    const reservation = await Reservation.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true, runValidators: true }
    );
    if (!reservation) throw new Error('Reservation not found');
    return reservation;
};