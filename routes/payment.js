const express = require('express');
const Booking = require('../models/booking');
const Bus = require('../models/bus');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a payment process for all unpaid bookings of the logged-in user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Create checkout session created for all unpaid bookings
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from JWT in the authenticate middleware

        // Fetch all unpaid bookings for the user
        const bookings = await Booking.find({ userId, paymentStatus: 'unpaid' }).populate('busId');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No unpaid bookings found for the user' });
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

        res.json({
            message: 'checkout session created',
            totalFare,
            sessionDetails,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

/**
 * @swagger
 * /payment/success:
 *   post:
 *     summary: Simulate a successful payment and update all unpaid bookings
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmAll:
 *                 type: boolean
 *                 description: Confirm all unpaid bookings
 *     responses:
 *       200:
 *         description: Payment successful
 */
router.post('/success', authenticate, async (req, res) => {
    try {
        const { confirmAll } = req.body;

        if (!confirmAll) {
            return res.status(400).json({ message: 'Payment confirmation is required' });
        }

        const userId = req.user.userId;

        // Update all unpaid bookings for the user
        const updatedBookings = await Booking.updateMany(
            { userId, paymentStatus: 'unpaid' },
            { paymentStatus: 'paid', status: 'confirmed' }
        );

        if (updatedBookings.matchedCount === 0) {
            return res.status(404).json({ message: 'No unpaid bookings found or already paid' });
        }

        res.json({
            message: 'payment successful, all unpaid bookings updated',
            updatedBookings: updatedBookings.matchedCount,
        });
    } catch (error) {
        console.error('Error processing payment :', error.message);
        res.status(500).json({ error: 'Failed to process payment', details: error.message });
    }
});

module.exports = router;
