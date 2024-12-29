const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Manually entered userId
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['commuter', 'operator', 'admin'], default: 'commuter' },
    profile: {
        phone: { type: String, default: null },
        address: { type: String, default: null },
    },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
