const express = require('express');
const BusController = require('../controllers/busController');

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
router.get('/', BusController.getAllBuses);

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
router.get('/route/:route', BusController.getBusesByRoute);

/**
 * @swagger
 * /bus/{busNumber}:
 *   get:
 *     summary: Get details of a specific bus
 *     tags: [Bus]
 *     parameters:
 *       - in: path
 *         name: busNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The bus number
 *     responses:
 *       200:
 *         description: Bus details
 */
router.get('/:busNumber', BusController.getBusByNumber);

module.exports = router;
