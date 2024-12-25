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

module.exports = router;
