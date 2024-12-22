const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/booking');
const Bus = require('../models/bus');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for the logged-in user's booking
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout session created
 */
router.post('/create-checkout-session', authenticate, async (req, res) => {
    try {
        // Fetch the user's latest booking
        const userId = req.user.userId; // Extracted from JWT in the authenticate middleware
        const booking = await Booking.findOne({ userId, paymentStatus: 'unpaid' }).populate('busId');

        if (!booking) {
            return res.status(404).json({ message: 'No unpaid booking found for the user' });
        }

        // Fetch bus and schedule details
        const bus = await Bus.findById(booking.busId);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found for the booking' });
        }

        const schedule = bus.schedule.id(booking.busId);
        if (!schedule) {
            return res.status(404).json({ message: 'Bus schedule not found' });
        }

        // Assume a fixed price per seat; replace with dynamic pricing logic if needed
        const price = 10;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Seat Reservation for ${bus.busNumber} on ${schedule.date} at ${schedule.time}`,
                        },
                        unit_amount: price * 100, // Price in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * @swagger
 * /payment/success:
 *   post:
 *     summary: Handle payment success and update booking status
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment successful and booking updated
 */
router.post('/success', authenticate, async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Verify the session ID with Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not successful' });
        }

        // Update booking status to "paid"
        const booking = await Booking.findOneAndUpdate(
            { userId: req.user.userId, paymentStatus: 'unpaid' },
            { paymentStatus: 'paid', status: 'confirmed' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or already paid' });
        }

        res.json({ message: 'Payment successful, booking updated', booking });
    } catch (error) {
        console.error('Error processing payment success:', error);
        res.status(500).json({ error: 'Failed to process payment success' });
    }
});

module.exports = router;
