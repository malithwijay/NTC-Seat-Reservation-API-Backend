const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

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
 *               priceNormal:
 *                 type: number
 *               priceLuxury:
 *                 type: number
 *               operatorId:
 *                 type: string
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
 *                     lockedSeats:
 *                       type: array
 *                       items:
 *                         type: number
 *     responses:
 *       201:
 *         description: Route or bus added successfully
 */
router.post('/route', authenticate, authorize(['admin']), adminController.addRoute);

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
 */
router.get('/routes', authenticate, authorize(['admin']), adminController.getRoutes);

/**
 * @swagger
 * /admin/bus/{busNumber}/stops:
 *   put:
 *     summary: Update stops for a specific bus
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
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
router.put('/bus/:busNumber/stops', authenticate, authorize(['admin']), adminController.updateStops);

/**
 * @swagger
 * /admin/permit/{busNumber}:
 *   put:
 *     summary: Grant or revoke a permit for a bus
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
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
 *               permitStatus:
 *                 type: string
 *                 enum: [granted, revoked]
 *     responses:
 *       200:
 *         description: Permit updated successfully
 */
router.put('/permit/:busNumber', authenticate, authorize(['admin']), adminController.updatePermitStatus);

module.exports = router;
