const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const operatorController = require('../controllers/operatorController');

const router = express.Router();

/**
 * @swagger
 * /operator/bus/{busNumber}:
 *   get:
 *     summary: Get details of a specific bus
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus number
 *     responses:
 *       200:
 *         description: Bus details retrieved successfully
 *       404:
 *         description: Bus not found
 *       403:
 *         description: Access denied
 */
router.get(
    '/bus/:busNumber',
    authenticate,
    authorize(['operator', 'admin']),
    operatorController.getBusDetails
);

/**
 * @swagger
 * /operator/bus/{busNumber}/schedule:
 *   put:
 *     summary: Update bus schedule
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus number
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
 *                     lockedSeats:
 *                       type: array
 *                       items:
 *                         type: number
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       404:
 *         description: Bus not found
 *       403:
 *         description: Access denied
 */
router.put(
    '/bus/:busNumber/schedule',
    authenticate,
    authorize(['operator', 'admin']),
    operatorController.updateSchedule
);

/**
 * @swagger
 * /operator/bus/{busNumber}/stops:
 *   put:
 *     summary: Update bus stops
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus number
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
 *       404:
 *         description: Bus not found
 *       403:
 *         description: Access denied
 */
router.put(
    '/bus/:busNumber/stops',
    authenticate,
    authorize(['operator', 'admin']),
    operatorController.updateStops
);

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
 *       404:
 *         description: Old bus not found
 *       400:
 *         description: New bus number already in use
 */
router.put(
    '/bus/change',
    authenticate,
    authorize(['operator', 'admin']),
    operatorController.replaceBus
);

/**
 * @swagger
 * /operator/bus/{busNumber}/details:
 *   put:
 *     summary: Update all details of a bus
 *     tags: [Operator, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: busNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus number
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
 *                     lockedSeats:
 *                       type: array
 *                       items:
 *                         type: number
 *     responses:
 *       200:
 *         description: Bus details updated successfully
 *       404:
 *         description: Bus not found
 *       403:
 *         description: Access denied
 */
router.put(
    '/bus/:busNumber/details',
    authenticate,
    authorize(['operator', 'admin']),
    operatorController.updateBusDetails
);

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
 *       404:
 *         description: No buses found for the operator
 */
router.get(
    '/permit/status',
    authenticate,
    authorize(['operator']),
    operatorController.getPermitStatus
);

module.exports = router;
