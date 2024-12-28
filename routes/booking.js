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
     *                 format: date-time
     *               time:
     *                 type: string
     *     responses:
     *       200:
     *         description: Booking created successfully
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
     */
    router.get('/user/:userEmail', getUserBookings);

    /**
     * @swagger
     * /booking/{id}:
     *   put:
     *     summary: Update booking details
     *     tags: [Booking]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
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
     *               tripTime:
     *                 type: string
     *               tripDate:
     *                 type: string
     *                 format: date-time
     *     responses:
     *       200:
     *         description: Booking updated successfully
     */
    router.put('/:id', authenticate, authorize(['admin', 'operator']), updateBooking);

    return router;
};
