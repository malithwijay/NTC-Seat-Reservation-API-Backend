const User = require('../models/user');

/**
 * Get commuter profile by user ID
 */
exports.getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

/**
 * Update commuter profile by user ID
 */
exports.updateProfile = async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Apply updates
    if (updates.name) user.name = updates.name;
    if (updates.phone) user.profile.phone = updates.phone || user.profile.phone;
    if (updates.address) user.profile.address = updates.address || user.profile.address;

    await user.save();
    return user;
};
