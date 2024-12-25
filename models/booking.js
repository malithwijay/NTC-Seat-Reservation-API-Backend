const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    seatNumbers: { type: [Number], required: true }, // Array of seat numbers
    startStop: { type: String, required: true }, // Combined start and end stop
    fare: { type: Number, required: true }, // Total fare
    busType: { type: String, enum: ['normal', 'luxury'], required: true },
    tripTime: { type: String, required: true }, // Time of the scheduled trip
    status: { type: String, enum: ['confirmed', 'pending'], default: 'confirmed' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
