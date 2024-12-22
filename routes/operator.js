const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Bus = require('../models/bus');

const router = express.Router();

/**
 * @swagger
 * /operator/bus/{id}/schedule:
 *   put:
 *     summary: Update bus schedule
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bus ID
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
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 */
router.put('/bus/:id/schedule', authenticate, authorize(['operator']), async (req, res) => {
    const { id } = req.params;
    const { schedule } = req.body;

    try {
        const bus = await Bus.findById(id);
        if (!bus || bus.operatorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        bus.schedule = schedule;
        await bus.save();
        res.json({ message: 'Schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update schedule', error });
    }
});

module.exports = router;
