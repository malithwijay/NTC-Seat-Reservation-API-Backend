const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['commuter', 'operator', 'admin'], default: 'commuter' },
    profile: {
        phone: String,
        address: String,
    },
});

// Check if the model already exists to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
