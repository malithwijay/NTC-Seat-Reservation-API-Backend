const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');
const crypto = require('crypto');

const router = express.Router();

/**
 * Generate a unique permit ID for buses
 */
const generateUniquePermit = () => {
    return crypto.randomBytes(8).toString('hex');
};

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
 * /admin/route:
 *   post:
 *     summary: Add a new route or a bus to an existing route
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               priceNormal:
 *                 type: number
 *               priceLuxury:
 *                 type: number
 *               operatorId:
 *                 type: string
 *                 description: The ID of the operator managing the bus
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
 *       201:
 *         description: Route or bus added successfully
 */
router.post('/route', authenticate, authorize(['admin']), async (req, res) => {
    const { busNumber, route, priceNormal, priceLuxury, operatorId, stops, schedule } = req.body;

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

        const existingRoute = await Bus.findOne({ route });

        if (existingRoute) {
            const existingBus = await Bus.findOne({ route, busNumber });
            if (existingBus) {
                return res.status(400).json({ message: 'Bus with this number already exists for the route.' });
            }

            const generatedStops = generateStopsWithFares(stops, priceNormal, priceLuxury);

            const newBus = new Bus({
                busNumber,
                route,
                priceNormal,
                priceLuxury,
                operatorId,
                stops: generatedStops,
                schedule,
                permitId: generateUniquePermit(),
                permitStatus: 'pending',
            });
            await newBus.save();
            return res.status(201).json({ message: 'New bus added to the existing route', bus: newBus });
        }

        const generatedStops = generateStopsWithFares(stops, priceNormal, priceLuxury);

        const newRoute = new Bus({
            busNumber,
            route,
            priceNormal,
            priceLuxury,
            operatorId,
            stops: generatedStops,
            schedule,
            permitId: generateUniquePermit(),
            permitStatus: 'pending',
        });
        await newRoute.save();

        res.status(201).json({ message: 'New route and bus added successfully', bus: newRoute });
    } catch (error) {
        console.error('Error in /admin/route:', error.message);
        res.status(500).json({ message: 'Failed to add route or bus', error: error.message });
    }
});

/**
 * @swagger
 * /admin/routes:
 *   get:
 *     summary: Get all routes and buses
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all routes and buses
 *       500:
 *         description: Internal server error
 */
router.get('/routes', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const routes = await Bus.find();
        res.status(200).json(routes);
    } catch (error) {
        console.error('Error in /admin/routes:', error.message);
        res.status(500).json({ message: 'Failed to retrieve routes and buses', error: error.message });
    }
});

/**
 * @swagger
 * /admin/bus/{id}/stops:
 *   put:
 *     summary: Update stops for a specific bus
 *     tags: [Admin]
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
router.put('/bus/:id/stops', authenticate, authorize(['admin']), async (req, res) => {
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
 * /admin/permit/{busId}:
 *   put:
 *     summary: Grant or revoke a permit for a bus
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bus to update permit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permitStatus:
 *                 type: string
 *                 enum: [granted, revoked]
 *     responses:
 *       200:
 *         description: Permit updated successfully
 */
router.put('/permit/:busId', authenticate, authorize(['admin']), async (req, res) => {
    const { busId } = req.params;
    const { permitStatus } = req.body;

    if (!['granted', 'revoked'].includes(permitStatus)) {
        return res.status(400).json({ message: 'Invalid permit status. Must be "granted" or "revoked".' });
    }

    try {
        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found.' });
        }

        if (!bus.permitId) {
            bus.permitId = generateUniquePermit();
        }

        bus.permitStatus = permitStatus;
        await bus.save();

        res.status(200).json({ message: `Permit ${permitStatus} successfully`, bus });
    } catch (error) {
        console.error('Error updating permit status:', error.message);
        res.status(500).json({ message: 'Failed to update permit status', error: error.message });
    }
});

module.exports = router;
