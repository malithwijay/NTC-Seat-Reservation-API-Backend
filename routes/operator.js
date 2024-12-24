const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');

const router = express.Router();

/**
 * @swagger
 * /operator/bus/{id}/schedule:
 *   put:
 *     summary: Update bus schedule
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     time:
 *                       type: string
 *                     availableSeats:
 *                       type: number
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 */
router.put('/bus/:id/schedule', authenticate, authorize(['operator', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { schedule } = req.body;

    try {
        if (!schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ message: 'Invalid input. Schedule must be an array.' });
        }

        const bus = await Bus.findById(id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }

        // Allow operators to update only their buses
        if (req.user.role === 'operator' && bus.operatorId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this bus schedule.' });
        }

        bus.schedule = schedule;
        await bus.save();

        res.status(200).json({ message: 'Schedule updated successfully', bus });
    } catch (error) {
        console.error('Error updating schedule:', error.message);
        res.status(500).json({ message: 'Failed to update schedule', error: error.message });
    }
});

/**
 * @swagger
 * /operator/bus/{id}/stops:
 *   put:
 *     summary: Update bus stops
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stops:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     distance:
 *                       type: number
 *     responses:
 *       200:
 *         description: Stops updated successfully
 */
router.put('/bus/:id/stops', authenticate, authorize(['operator', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { stops } = req.body;

    try {
        if (!stops || !Array.isArray(stops)) {
            return res.status(400).json({ message: 'Invalid input. Stops must be an array.' });
        }

        const bus = await Bus.findById(id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }

        // Allow operators to update only their buses
        if (req.user.role === 'operator' && bus.operatorId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this bus stops.' });
        }

        bus.stops = stops;
        await bus.save();

        res.status(200).json({ message: 'Stops updated successfully', bus });
    } catch (error) {
        console.error('Error updating stops:', error.message);
        res.status(500).json({ message: 'Failed to update stops', error: error.message });
    }
});

/**
 * @swagger
 * /operator/bus/change:
 *   put:
 *     summary: Replace a bus in case of issues
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldBusNumber:
 *                 type: string
 *                 description: The bus number of the faulty bus
 *               newBusNumber:
 *                 type: string
 *                 description: The bus number of the replacement bus
 *     responses:
 *       200:
 *         description: Bus replaced successfully
 *       400:
 *         description: Validation error or bus not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.put('/bus/change', authenticate, authorize(['operator', 'admin']), async (req, res) => {
    const { oldBusNumber, newBusNumber } = req.body;

    try {
        if (!oldBusNumber || !newBusNumber) {
            return res.status(400).json({ message: 'Both oldBusNumber and newBusNumber are required.' });
        }

        const oldBus = await Bus.findOne({ busNumber: oldBusNumber });
        if (!oldBus) {
            return res.status(404).json({ message: 'Old bus not found.' });
        }

        // Allow operators to replace only their buses
        if (req.user.role === 'operator' && oldBus.operatorId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to replace this bus.' });
        }

        const newBus = await Bus.findOne({ busNumber: newBusNumber });
        if (newBus) {
            return res.status(400).json({ message: 'New bus number is already in use.' });
        }

        oldBus.busNumber = newBusNumber;
        await oldBus.save();

        res.status(200).json({ message: 'Bus replaced successfully', bus: oldBus });
    } catch (error) {
        console.error('Error replacing bus:', error.message);
        res.status(500).json({ message: 'Failed to replace the bus', error: error.message });
    }
});

/**
 * @swagger
 * /operator/bus/{id}/details:
 *   put:
 *     summary: Update all details of a bus
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busNumber:
 *                 type: string
 *               operatorId:
 *                 type: string
 *               route:
 *                 type: string
 *               priceNormal:
 *                 type: number
 *               priceLuxury:
 *                 type: number
 *               stops:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     distance:
 *                       type: number
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     time:
 *                       type: string
 *                     availableSeats:
 *                       type: number
 *     responses:
 *       200:
 *         description: Bus details updated successfully
 */
router.put('/bus/:id/details', authenticate, authorize(['operator', 'admin']), async (req, res) => {
    const { id } = req.params;
    const { busNumber, operatorId, route, priceNormal, priceLuxury, stops, schedule } = req.body;

    try {
        if (
            !busNumber ||
            !route ||
            !priceNormal ||
            !priceLuxury ||
            !stops ||
            !Array.isArray(stops) ||
            !schedule ||
            !Array.isArray(schedule)
        ) {
            return res.status(400).json({ message: 'Invalid input. All fields are required.' });
        }

        const bus = await Bus.findById(id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }

        // Allow operators to update only their buses
        if (req.user.role === 'operator' && bus.operatorId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this bus.' });
        }

        bus.busNumber = busNumber;
        bus.operatorId = operatorId || bus.operatorId;
        bus.route = route;
        bus.priceNormal = priceNormal;
        bus.priceLuxury = priceLuxury;
        bus.stops = stops;
        bus.schedule = schedule;

        await bus.save();

        res.status(200).json({ message: 'Bus details updated successfully', bus });
    } catch (error) {
        console.error('Error updating bus details:', error.message);
        res.status(500).json({ message: 'Failed to update bus details', error: error.message });
    }
});

module.exports = router;
