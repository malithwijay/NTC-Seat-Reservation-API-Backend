const Booking = require('../models/booking');

/**
 * Create a payment process for all unpaid bookings.
 */
exports.createCheckoutSession = async (userId) => {
    // Query using `userId` as a string
    const bookings = await Booking.find({ userId, paymentStatus: 'unpaid' }).populate('busId');

    if (!bookings || bookings.length === 0) {
        throw new Error('No unpaid bookings found');
    }

    const totalFare = bookings.reduce((sum, booking) => sum + booking.fare, 0);

    const sessionDetails = bookings.map((booking) => ({
        bookingId: booking.bookingId,
        busNumber: booking.busId?.busNumber || 'Unknown',
        route: booking.busId?.route || 'Unknown',
        seats: booking.seatNumbers,
        fare: booking.fare,
    }));

    return {
        message: 'Checkout session created',
        totalFare,
        sessionDetails,
    };
};

/**
 * Simulate a successful payment and update all unpaid bookings.
 */
exports.handlePaymentSuccess = async (userId) => {
    // Query using `userId` as a string
    const updatedBookings = await Booking.updateMany(
        { userId, paymentStatus: 'unpaid' },
        { paymentStatus: 'paid', status: 'confirmed' }
    );

    if (updatedBookings.matchedCount === 0) {
        throw new Error('No unpaid bookings found or already paid');
    }

    return {
        message: 'Payment successful, all unpaid bookings updated',
        updatedBookings: updatedBookings.matchedCount,
    };
};
