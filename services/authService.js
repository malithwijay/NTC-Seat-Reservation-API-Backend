const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

class AuthService {
    static async registerUser({ name, email, password, role }) {
        const generateUserId = async (role) => {
            const prefixMap = {
                admin: 'ADM',
                commuter: 'COM',
                operator: 'OPE',
            };

            const prefix = prefixMap[role];
            if (!prefix) {
                throw new Error('Invalid role for userId generation.');
            }

            // Fetch the last user of the same role
            const lastUser = await User.findOne({ role }).sort({ userId: -1 }).select('userId');
            const lastNumber = lastUser && lastUser.userId ? parseInt(lastUser.userId.split('-')[1], 10) : 0;
            const newNumber = lastNumber + 1;
            return `${prefix}-${String(newNumber).padStart(4, '0')}`;
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Generate user ID
        const userId = await generateUserId(role);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const user = new User({ name, email, password: hashedPassword, role, userId });
        await user.save();

        return { message: 'User registered successfully', userId };
    }

    static async loginUser({ email, password }) {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token };
    }

    static async updateUserByAdmin(userId, updatedData) {
        const user = await User.findOne({ userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Update fields dynamically
        Object.keys(updatedData).forEach((key) => {
            if (key !== 'role') user[key] = updatedData[key];
        });

        await user.save();

        return { message: 'User updated successfully', user };
    }
}

module.exports = AuthService;
