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
     *               startStop:
     *                 type: string
     *               endStop:
     *                 type: string
     *     responses:
     *       200:
     *         description: Booking created successfully
     */
    router.post('/book', async (req, res) => {
        const { userId, busId, seatNumber, startStop, endStop } = req.body;

        try {
            const bus = await Bus.findOne({ 'schedule._id': busId });
            if (!bus) {
                return res.status(404).json({ message: 'Bus schedule not found' });
            }

            const schedule = bus.schedule.id(busId);

            // Check if the seat is already booked
            if (schedule.bookedSeats.includes(seatNumber)) {
                return res.status(400).json({ message: 'Seat already booked' });
            }

            // Validate stops
            const stops = bus.stops.map((stop) => stop.name);
            if (!stops.includes(startStop) || !stops.includes(endStop)) {
                return res.status(400).json({ message: 'Invalid start or end stop' });
            }

            const startIndex = stops.indexOf(startStop);
            const endIndex = stops.indexOf(endStop);
            if (startIndex >= endIndex) {
                return res.status(400).json({ message: 'Start stop must be before end stop' });
            }

            // Calculate fare
            let fare = 0;
            for (let i = startIndex; i < endIndex; i++) {
                const stop = bus.stops[i];
                const nextStop = bus.stops[i + 1];
                fare += nextStop.fareNormal; // Assuming normal fare, adjust for bus type if needed
            }

            // Update availability
            schedule.bookedSeats.push(seatNumber);
            schedule.availableSeats -= 1;

            await bus.save();

            // Save booking
            const booking = new Booking({
                userId,
                busId,
                seatNumber,
                startStop,
                endStop,
                fare,
                status: 'confirmed',
            });
            await booking.save();

            // Emit real-time update
            io.emit('bookingUpdate', { busId, seatNumber, status: 'reserved' });

            res.json({
                message: 'Booking successful',
                busId,
                seatNumber,
                startStop,
                endStop,
                fare,
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to book seat', details: error.message });
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
