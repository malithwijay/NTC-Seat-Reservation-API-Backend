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
        res.status(500).json({ error: 'Failed to retrieve buses for the route' });
    }
});

/**
 * @swagger
 * /bus/{id}:
 *   get:
 *     summary: Get details of a specific bus
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bus ID
 *     responses:
 *       200:
 *         description: Bus details
 */
router.get('/:id', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve bus details' });
    }
});

module.exports = router;
