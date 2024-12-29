const Joi = require('joi');
const AuthService = require('../services/authService');
const User = require('../models/user');


const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('commuter', 'operator', 'admin').default('commuter'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const updateSchema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().email(),
    phone: Joi.string(),
    address: Joi.string(),
});

const registerUser = async (req, res) => {
    try {
        const validatedData = await registerSchema.validateAsync(req.body);
        const result = await AuthService.registerUser(validatedData);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error.details?.[0]?.message || error.message || 'Validation error';
        res.status(400).json({ message: errorMessage });
    }
};

const loginUser = async (req, res) => {
    try {
        const validatedData = await loginSchema.validateAsync(req.body);
        const result = await AuthService.loginUser(validatedData);
        res.status(200).json(result);
    } catch (error) {
        const errorMessage = error.details?.[0]?.message || error.message || 'Invalid credentials';
        res.status(401).json({ message: errorMessage });
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, address } = req.body;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update top-level fields
        if (name) user.name = name;
        if (email) user.email = email;

        // Update nested fields
        if (phone) user.profile.phone = phone;
        if (address) user.profile.address = address;

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};



module.exports = { updateUserByAdmin, registerUser, loginUser };
