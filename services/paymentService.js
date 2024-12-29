const Booking = require('../models/booking');
const Bus = require('../models/bus');
const User = require('../models/user');
const sendEmail = require('../routes/utils/emailService');

/**
 * Create a payment process for all unpaid bookings.
 */
exports.createCheckoutSession = async (userId) => {
    
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
    // Fetch all unpaid bookings for the user
    const bookings = await Booking.find({ userId, paymentStatus: 'unpaid' }).populate('busId');

    if (!bookings || bookings.length === 0) {
        throw new Error('No unpaid bookings found or already paid');
    }

    // Update the payment status and status of all unpaid bookings
    const updatedBookings = await Booking.updateMany(
        { userId, paymentStatus: 'unpaid' },
        { paymentStatus: 'paid', status: 'confirmed' }
    );

    if (updatedBookings.matchedCount === 0) {
        throw new Error('No unpaid bookings found or already paid');
    }

    // Fetch user details for email
    const user = await User.findOne({ userId });
    if (!user) {
        throw new Error('User not found');
    }

    // Send payment confirmation email
    const emailContent = `
        <h1>Payment Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Your payment has been successfully processed for the following bookings:</p>
        <ul>
            ${bookings
                .map(
                    (booking) => `
                <li>
                    <strong>Booking ID:</strong> ${booking.bookingId}<br />
                    <strong>Bus Number:</strong> ${booking.busId?.busNumber || 'Unknown'}<br />
                    <strong>Route:</strong> ${booking.busId?.route || 'Unknown'}<br />
                    <strong>Seats:</strong> ${booking.seatNumbers.join(', ')}<br />
                    <strong>Fare:</strong> Rs${booking.fare}<br />
                </li>
            `
                )
                .join('')}
        </ul>
        <p>Thank you for choosing our service!</p>
    `;
    await sendEmail(user.email, 'Payment Confirmation', emailContent);

    return {
        message: 'Payment successful, all unpaid bookings updated',
        updatedBookings: updatedBookings.matchedCount,
    };
};
