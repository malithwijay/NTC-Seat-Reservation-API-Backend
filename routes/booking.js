const express = require('express');
const Booking = require('../models/booking');
const Bus = require('../models/bus');
const { authenticate, authorize } = require('../middleware/authMiddleware');

module.exports = (io) => {
    const router = express.Router();

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
     *               userId:
     *                 type: string
     *               busId:
     *                 type: string
     *               seatNumbers:
     *                 type: array
     *                 items:
     *                   type: number
     *               startStop:
     *                 type: string
     *                 description: Combined start and end stop in the format "Start Stop to End Stop"
     *               busType:
     *                 type: string
     *                 enum: [normal, luxury]
     *               time:
     *                 type: string
     *                 description: Time of the scheduled trip
     *     responses:
     *       200:
     *         description: Booking created successfully
     */
    router.post('/book', async (req, res) => {
        const { userId, busId, seatNumbers, startStop, busType, time } = req.body;

        try {
            if (!['normal', 'luxury'].includes(busType)) {
                return res.status(400).json({ message: 'Invalid bus type. Must be "normal" or "luxury".' });
            }

            const bus = await Bus.findById(busId);
            if (!bus) {
                return res.status(404).json({ message: 'Bus not found' });
            }

            const validStops = bus.stops.map((stop) => stop.name);
            if (!validStops.includes(startStop)) {
                return res.status(400).json({
                    message: `Invalid startStop: ${startStop}. Available stops: ${validStops.join(', ')}`,
                });
            }

            const stopDetails = bus.stops.find((stop) => stop.name === startStop);
            const fare = busType === 'luxury' ? stopDetails.fareLuxury : stopDetails.fareNormal;

            const schedule = bus.schedule.find((s) => s.time === time);
            if (!schedule) {
                return res.status(400).json({ message: 'Invalid time. No trip is scheduled for the selected time.' });
            }

            for (const seat of seatNumbers) {
                if (schedule.bookedSeats.includes(seat)) {
                    return res.status(400).json({ message: `Seat ${seat} is already booked.` });
                }
            }

            const updatedBus = await Bus.findOneAndUpdate(
                { _id: busId, 'schedule.time': time },
                {
                    $inc: { 'schedule.$.availableSeats': -seatNumbers.length },
                    $push: { 'schedule.$.bookedSeats': { $each: seatNumbers } },
                },
                { new: true }
            );
            if (!updatedBus) {
                return res.status(500).json({ message: 'Failed to update bus schedule.' });
            }

            const booking = new Booking({
                userId,
                busId,
                seatNumbers,
                startStop,
                fare: fare * seatNumbers.length,
                busType,
                tripTime: time,
                status: 'confirmed',
            });
            await booking.save();

            seatNumbers.forEach((seat) => {
                io.emit('bookingUpdate', { busId, seatNumber: seat, status: 'reserved' });
            });

            res.json({ message: 'Booking successful', booking });
        } catch (error) {
            console.error('Error creating booking:', error.message);
            res.status(500).json({ error: 'Failed to book seat(s)', details: error.message });
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
            const bookings = await Booking.find({ userId: req.params.userId }).populate('busId', 'route');
            res.json(bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error.message);
            res.status(500).json({ error: 'Failed to retrieve bookings' });
        }
    });

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
     *         description: Booking ID
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
     *     responses:
     *       200:
     *         description: Booking updated successfully
     */
    router.put('/:id', authenticate, authorize(['admin', 'operator']), async (req, res) => {
        const { id } = req.params;
        const { seatNumbers, startStop, busType, tripTime } = req.body;

        try {
            const booking = await Booking.findById(id);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            const bus = await Bus.findById(booking.busId);
            if (!bus) {
                return res.status(404).json({ message: 'Bus not found for the booking' });
            }

            const schedule = bus.schedule.find((s) => s.time === booking.tripTime);
            if (!schedule) {
                return res.status(400).json({ message: 'Invalid trip time. Schedule not found for the booking' });
            }

            const oldSeatNumbers = booking.seatNumbers || [];
            const newSeatNumbers = seatNumbers || oldSeatNumbers;

            schedule.bookedSeats = schedule.bookedSeats.filter((seat) => !oldSeatNumbers.includes(seat));
            schedule.availableSeats += oldSeatNumbers.length;

            for (const seat of newSeatNumbers) {
                if (!schedule.bookedSeats.includes(seat)) {
                    schedule.bookedSeats.push(seat);
                    schedule.availableSeats -= 1;
                }
            }

            await bus.save();

            booking.seatNumbers = newSeatNumbers;
            booking.startStop = startStop || booking.startStop;
            booking.busType = busType || booking.busType;
            booking.tripTime = tripTime || booking.tripTime;

            await booking.save();

            res.status(200).json({ message: 'Booking updated successfully', booking });
        } catch (error) {
            console.error('Error updating booking:', error.message);
            res.status(500).json({ message: 'Failed to update booking', error: error.message });
        }
    });

    return router;
};
