const express = require('express');
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
router.get('/profile', commuterController.getProfile);

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
router.put('/profile', commuterController.updateProfile);

/**
 * @swagger
 * /commuter/buses:
 *   get:
 *     summary: Retrieve buses based on route, date, and time
 *     tags: [Commuter]
 *     parameters:
 *       - in: query
 *         name: route
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: time
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching buses
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: No buses found
 *       500:
 *         description: Internal server error
 */
router.get('/buses', commuterController.getBusesByCriteria);

module.exports = router;
