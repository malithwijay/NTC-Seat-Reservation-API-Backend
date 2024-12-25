const Joi = require('joi');
const AuthService = require('../services/authService');

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

module.exports = {
    registerUser,
    loginUser,
};
