const BookingService = require('../services/bookingService');

module.exports = (io) => {
    const createBooking = async (req, res) => {
        try {
            const booking = await BookingService.createBooking(req.body);
            req.body.seatNumbers.forEach((seat) => {
                io.emit('bookingUpdate', { busId: req.body.busId, seatNumber: seat, status: 'reserved' });
            });
            res.status(200).json({ message: 'Booking successful', booking });
        } catch (error) {
            console.error('Error creating booking:', error.message);
            res.status(500).json({ error: 'Failed to book seat(s)', details: error.message });
        }
    };

    const getUserBookings = async (req, res) => {
        try {
            const bookings = await BookingService.getUserBookings(req.params.userId);
            res.status(200).json(bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error.message);
            res.status(500).json({ error: 'Failed to retrieve bookings' });
        }
    };

    const updateBooking = async (req, res) => {
        try {
            const booking = await BookingService.updateBooking(req.params.id, req.body);
            res.status(200).json({ message: 'Booking updated successfully', booking });
        } catch (error) {
            console.error('Error updating booking:', error.message);
            res.status(500).json({ message: 'Failed to update booking', error: error.message });
        }
    };

    return { createBooking, getUserBookings, updateBooking };
};
