const express = require('express');
const Booking = require('../models/booking');
const Bus = require('../models/bus');

module.exports = (io) => {
    const router = express.Router();

    /**
     * @swagger
     * /booking/book:
     *   post:
     *     summary: Book a seat
     *     tags: [Booking]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: string
     *               busId:
     *                 type: string
     *               seatNumber:
     *                 type: number
     *     responses:
     *       200:
     *         description: Booking created successfully
     */
    router.post('/book', async (req, res) => {
        const { userId, busId, seatNumber } = req.body;

        try {
            const booking = new Booking({ userId, busId, seatNumber });
            await booking.save();

            // Emit a real-time update
            io.emit('bookingUpdate', { busId, seatNumber, status: 'reserved' });

            res.json({ message: 'Booking created successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create booking' });
        }
    });

    /**
     * @swagger
     * /booking/user/{userId}:
     *   get:
     *     summary: Get bookings for a specific user
     *     tags: [Booking]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: The user ID
     *     responses:
     *       200:
     *         description: List of bookings for the user
     */
    router.get('/user/:userId', async (req, res) => {
        try {
            const bookings = await Booking.find({ userId: req.params.userId });
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve bookings' });
        }
    });

    return router;
};
