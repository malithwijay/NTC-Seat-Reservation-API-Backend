const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');

const router = express.Router();

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
 *               price:
 *                 type: number
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
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/route', authenticate, authorize(['admin']), async (req, res) => {
    const { busNumber, route, price, schedule } = req.body;

    try {
        // Validate input
        if (!busNumber || !route || !price || !schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ message: 'Invalid input. All fields are required.' });
        }

        // Check if the route already exists
        const existingRoute = await Bus.findOne({ route });

        if (existingRoute) {
            // Check if a bus with the same busNumber already exists in the route
            const existingBus = await Bus.findOne({ route, busNumber });
            if (existingBus) {
                return res.status(400).json({ message: 'Bus with this number already exists for the route.' });
            }

            // Add a new bus to the route
            const newBus = new Bus({
                busNumber,
                route,
                price,
                schedule,
            });
            await newBus.save();
            return res.status(201).json({ message: 'New bus added to the existing route', bus: newBus });
        }

        // If the route does not exist, create a new route with the bus
        const newRoute = new Bus({
            busNumber,
            route,
            price,
            schedule,
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

module.exports = router;
