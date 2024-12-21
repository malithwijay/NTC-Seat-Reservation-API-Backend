const express = require('express');
const Bus = require('../models/bus');

const router = express.Router();

/**
 * @swagger
 * /bus:
 *   get:
 *     summary: Get all buses
 *     tags: [Bus]
 *     responses:
 *       200:
 *         description: List of all buses
 */
router.get('/', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve buses' });
    }
});

/**
 * @swagger
 * /bus:
 *   post:
 *     summary: Add a new bus
 *     tags: [Bus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busNumber:
 *                 type: string
 *               route:
 *                 type: string
 *               availableSeats:
 *                 type: number
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *     responses:
 *       201:
 *         description: Bus added successfully
 */
router.post('/', async (req, res) => {
    const { busNumber, route, availableSeats, schedule } = req.body;

    try {
        const bus = new Bus({ busNumber, route, availableSeats, schedule });
        await bus.save();
        res.status(201).json({ message: 'Bus added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add bus' });
    }
});

module.exports = router;
