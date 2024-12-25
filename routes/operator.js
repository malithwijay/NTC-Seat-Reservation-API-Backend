const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');

const router = express.Router();

/**
 * Generate stops with all combinations and fares based on the provided stops
 */
const generateStopsWithFares = (stops, priceNormal, priceLuxury) => {
    const stopPairs = [];
    const totalStops = stops.length;

    for (let i = 0; i < totalStops; i++) {
        for (let j = i + 1; j < totalStops; j++) {
            const distance = stops[j].distance - stops[i].distance;
            const fareNormal = Math.ceil((priceNormal / stops[totalStops - 1].distance) * distance);
            const fareLuxury = Math.ceil((priceLuxury / stops[totalStops - 1].distance) * distance);

            stopPairs.push({
                name: `${stops[i].name} to ${stops[j].name}`,
                distance,
                fareNormal,
                fareLuxury,
            });
        }
    }

    return stopPairs;
};

/**
 * @swagger
 * /operator/bus/{id}:
 *   get:
 *     summary: Get details of a specific bus
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
 *     responses:
 *       200:
 *         description: Bus details retrieved successfully
 *       404:
 *         description: Bus not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/bus/:id', authenticate, authorize(['operator', 'admin']), async (req, res) => {
    const { id } = req.params;

    try {
        const bus = await Bus.findById(id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }

        // Allow operators to access only their buses
        if (req.user.role === 'operator' && bus.operatorId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to view this bus.' });
        }

        res.status(200).json({ message: 'Bus details retrieved successfully', bus });
    } catch (error) {
        console.error('Error fetching bus details:', error.message);
        res.status(500).json({ message: 'Failed to fetch bus details', error: error.message });
    }
});

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

        const updatedStops = generateStopsWithFares(stops, bus.priceNormal, bus.priceLuxury);

        bus.stops = updatedStops;
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

        const updatedStops = generateStopsWithFares(stops, priceNormal, priceLuxury);

        // Preserve existing bookedSeats in the schedule
        const preservedSchedule = schedule.map((updatedItem) => {
            const existingItem = bus.schedule.find(
                (item) => item.time === updatedItem.time && new Date(item.date).toISOString() === new Date(updatedItem.date).toISOString()
            );

            return existingItem
                ? {
                      ...updatedItem,
                      bookedSeats: existingItem.bookedSeats,
                      availableSeats:
                          updatedItem.availableSeats - existingItem.bookedSeats.length,
                  }
                : updatedItem;
        });

        bus.busNumber = busNumber;
        bus.operatorId = operatorId || bus.operatorId;
        bus.route = route;
        bus.priceNormal = priceNormal;
        bus.priceLuxury = priceLuxury;
        bus.stops = updatedStops;
        bus.schedule = preservedSchedule;

        await bus.save();

        res.status(200).json({ message: 'Bus details updated successfully', bus });
    } catch (error) {
        console.error('Error updating bus details:', error.message);
        res.status(500).json({ message: 'Failed to update bus details', error: error.message });
    }
});


/**
 * @swagger
 * /operator/permit/status:
 *   get:
 *     summary: View permit status of buses
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permit status retrieved successfully
 */
router.get('/permit/status', authenticate, authorize(['operator']), async (req, res) => {
    try {
        const buses = await Bus.find({ operatorId: req.user.userId });
        const permitStatus = buses.map((bus) => ({
            busNumber: bus.busNumber,
            permitId: bus.permitId,
            permitStatus: bus.permitStatus,
        }));

        res.status(200).json({ message: 'Permit status retrieved successfully', permitStatus });
    } catch (error) {
        console.error('Error fetching permit status:', error.message);
        res.status(500).json({ message: 'Failed to fetch permit status', error: error.message });
    }
});

module.exports = router;
