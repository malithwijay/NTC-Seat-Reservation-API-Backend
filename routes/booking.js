const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

module.exports = (io) => {
    const router = express.Router();
    const { createBooking, getUserBookings, updateBooking } = bookingController(io);

    /**
     * @swagger
     * /booking/book:
     *   post:
     *     summary: Book one or more seats
     *     tags: [Booking]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userEmail:
     *                 type: string
     *               busNumber:
     *                 type: string
     *               seatNumbers:
     *                 type: array
     *                 items:
     *                   type: number
     *               startStop:
     *                 type: string
     *               busType:
     *                 type: string
     *                 enum: [normal, luxury]
     *               date:
     *                 type: string
     *                 format: date
     *               time:
     *                 type: string
     *     responses:
     *       200:
     *         description: Booking created successfully
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal server error
     */
    router.post('/book', createBooking);

    /**
     * @swagger
     * /booking/user/{userEmail}:
     *   get:
     *     summary: Get bookings for a specific user
     *     tags: [Booking]
     *     parameters:
     *       - in: path
     *         name: userEmail
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of bookings for the user
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
    router.get('/user/:userEmail', getUserBookings);

    /**
     * @swagger
     * /booking/{bookingId}:
     *   put:
     *     summary: Update booking details
     *     tags: [Booking]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookingId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               seatNumbers:
     *                 type: array
     *                 items:
     *                   type: number
     *               startStop:
     *                 type: string
     *               busType:
     *                 type: string
     *                 enum: [normal, luxury]
     *               tripDate:
     *                 type: string
     *                 format: date
     *               tripTime:
     *                 type: string
     *     responses:
     *       200:
     *         description: Booking updated successfully
     *       404:
     *         description: Booking not found
     *       500:
     *         description: Internal server error
     */
    router.put('/:bookingId', authenticate, authorize(['admin', 'operator']), updateBooking);

    return router;
};
