const User = require('../models/user');
const Bus = require('../models/bus');

/**
 * Get commuter profile by user ID
 */
exports.getProfile = async (userId) => {
    const user = await User.findOne({ userId });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

/**
 * Update commuter profile by user ID
 */
exports.updateProfile = async (userId, updates) => {
    const user = await User.findOne({ userId });
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

/**
 * Get buses by route, date, and time
 */
exports.getBusesByCriteria = async ({ route, date, time }) => {
    console.log('Received Criteria:', { route, date, time });

    const query = { route };
    const matchConditions = {};

    // Ensure the date is formatted correctly
    if (date) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        console.log('Formatted Date:', formattedDate);
        matchConditions['schedule.date'] = new Date(formattedDate);
    }

    // Add time to match conditions if provided
    if (time) {
        matchConditions['schedule.time'] = time;
    }

    console.log('Match Conditions:', matchConditions);

    const buses = await Bus.aggregate([
        { $match: query },
        { $unwind: '$schedule' }, // Flatten schedule array for matching
        { $match: matchConditions },
        {
            $project: {
                busNumber: 1,
                route: 1,
                schedule: 1,
            },
        },
    ]);

    console.log('Query Results:', buses);

    if (buses.length === 0) {
        throw new Error('No buses found matching the criteria');
    }

    return buses;
}; 