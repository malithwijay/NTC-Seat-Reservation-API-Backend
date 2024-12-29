const Bus = require('../models/bus');

exports.getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

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

exports.getBusesByCriteria = async ({ route, date, time }) => {
    const query = { route };
    const matchConditions = {};

    if (date) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        matchConditions['schedule.date'] = new Date(formattedDate);
    }

    if (time) {
        matchConditions['schedule.time'] = time;
    }

    const buses = await Bus.aggregate([
        { $match: query },
        { $unwind: '$schedule' },
        { $match: matchConditions },
        {
            $project: {
                busNumber: 1,
                route: 1,
                schedule: 1,
            },
        },
    ]);

    if (buses.length === 0) {
        throw new Error('No buses found matching the criteria');
    }

    return buses;
};
