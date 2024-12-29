const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a payment process for all unpaid bookings
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout session created for all unpaid bookings
 */
router.post('/create-checkout-session', authenticate, paymentController.createCheckoutSession);

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
router.post('/success', authenticate, paymentController.handlePaymentSuccess);

module.exports = router;
