const commuterService = require('../services/commuterService');

/**
 * Get commuter profile
 */
exports.getProfile = async (req, res) => {
    try {
        const profile = await commuterService.getProfile(req.user.userId);
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Failed to retrieve profile', error: error.message });
    }
};

/**
 * Update commuter profile
 */
exports.updateProfile = async (req, res) => {
    const { name, phone, address } = req.body;

    try {
        const updatedProfile = await commuterService.updateProfile(req.user.userId, { name, phone, address });
        res.status(200).json({ message: 'Profile updated successfully', user: updatedProfile });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};
