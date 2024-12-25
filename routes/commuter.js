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
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.put('/profile', authenticate, authorize(['commuter']), async (req, res) => {
    const { name, phone, address } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user details
        if (name) user.name = name;
        if (phone) user.profile.phone = phone;
        if (address) user.profile.address = address;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Failed to update profile', error });
    }
});

module.exports = router;
