const express = require('express');
const Bus = require('../models/bus');
const router = express.Router();

/**
 * @swagger
 * /bus/route/{route}:
 *   get:
 *     summary: Get buses for a specific route
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: route
 *         required: true
 *         schema:
 *           type: string
 *         description: The route name
 *     responses:
 *       200:
 *         description: List of buses for the route
 */
router.get('/route/:route', async (req, res) => {
    try {
        const buses = await Bus.find({ route: req.params.route });
        res.json(buses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve buses for route' });
    }
});

module.exports = router;
