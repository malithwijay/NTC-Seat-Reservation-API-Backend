const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId:
 *                 type: string
 *               seatNumber:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Checkout session created
 */
router.post('/create-checkout-session', async (req, res) => {
    const { busId, seatNumber, price } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Seat Reservation for Bus ${busId} (Seat ${seatNumber})`,
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

module.exports = router;
