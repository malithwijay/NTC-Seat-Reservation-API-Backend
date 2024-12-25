const Booking = require('../models/booking');
const Bus = require('../models/bus');

/**
 * Create a payment process for all unpaid bookings.
 */
exports.createCheckoutSession = async (userId) => {
    // Fetch all unpaid bookings for the user
    const bookings = await Booking.find({ userId, paymentStatus: 'unpaid' }).populate('busId');

    if (!bookings || bookings.length === 0) {
        throw new Error('No unpaid bookings found');
    }

    // Aggregate total fare for all unpaid bookings
    const totalFare = bookings.reduce((sum, booking) => sum + booking.fare, 0);

    // Create checkout session details
    const sessionDetails = bookings.map((booking) => ({
        bookingId: booking._id,
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
    // Update all unpaid bookings for the user
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
