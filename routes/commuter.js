const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const User = require('../models/user');
const Booking = require('../models/booking');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, authorize(['commuter']), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve profile', error });
    }
});


module.exports = router;
