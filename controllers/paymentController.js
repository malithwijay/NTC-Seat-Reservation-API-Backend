const paymentService = require('../services/paymentService');

/**
 * Create a payment process for all unpaid bookings.
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.userId; // Retrieve the string userId (e.g., "COM-0001")
        const result = await paymentService.createCheckoutSession(userId);
        res.json(result);
    } catch (error) {
        console.error('Error in createCheckoutSession:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
};

/**
 * Simulate a successful payment and update all unpaid bookings.
 */
exports.handlePaymentSuccess = async (req, res) => {
    try {
        const { confirmAll } = req.body;
        const userId = req.user.userId;

        if (!confirmAll) {
            return res.status(400).json({ message: 'Payment confirmation is required' });
        }

        const result = await paymentService.handlePaymentSuccess(userId);
        res.json(result);
    } catch (error) {
        console.error('Error in handlePaymentSuccess:', error.message);
        res.status(500).json({ error: 'Failed to process payment', details: error.message });
    }
};
