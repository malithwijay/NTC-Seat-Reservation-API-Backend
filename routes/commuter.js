const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const commuterController = require('../controllers/commuterController');

const router = express.Router();

/**
 * @swagger
 * /commuter/profile:
 *   get:
 *     summary: View commuter profile
 *     tags: [Commuter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commuter profile details
 */
router.get('/profile', authenticate, authorize(['commuter']), commuterController.getProfile);

/**
 * @swagger
 * /commuter/profile:
 *   put:
 *     summary: Update commuter profile
 *     tags: [Commuter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticate, authorize(['commuter']), commuterController.updateProfile);

/**
 * @swagger
 * /commuter/buses:
 *   get:
 *     summary: Get buses by route, date, and time
 *     tags: [Commuter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: route
 *         required: true
 *         schema:
 *           type: string
 *         description: The route of the bus
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: The date of the bus schedule (YYYY-MM-DD)
 *       - in: query
 *         name: time
 *         required: false
 *         schema:
 *           type: string
 *         description: The time of the bus schedule (e.g., "08:00 AM")
 *     responses:
 *       200:
 *         description: List of buses matching the criteria
 *       404:
 *         description: No buses found
 *       500:
 *         description: Internal server error
 */
router.get('/buses', authenticate, authorize(['commuter']), commuterController.getBusesByCriteria);

module.exports = router;