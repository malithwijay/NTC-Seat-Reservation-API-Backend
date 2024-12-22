const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');

const router = express.Router();

/**
 * @swagger
 * /admin/route:
 *   post:
 *     summary: Add a new route
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
 *               availableSeats:
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
 *         description: Route added successfully
 */
router.post('/route', authenticate, authorize(['admin']), async (req, res) => {
    const { busNumber, route, availableSeats, schedule } = req.body;

    try {
        const bus = new Bus({ busNumber, route, availableSeats, schedule });
        await bus.save();
        res.status(201).json({ message: 'Route added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add route', error });
    }
});

module.exports = router;
