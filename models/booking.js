const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    seatNumber: Number,
    status: { type: String, enum: ['confirmed', 'pending'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
});

// Check if the model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
