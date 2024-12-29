const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    userId: { type: String, required: true }, // Changed to string-based userId
    busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    seatNumbers: { type: [Number], required: true },
    startStop: { type: String, required: true },
    fare: { type: Number, required: true },
    busType: { type: String, enum: ['normal', 'luxury'], required: true },
    tripDate: { type: Date, required: true },
    tripTime: { type: String, required: true },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'confirmed' }, // Added 'cancelled'
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
}, 
{ timestamps: true }); // Enable timestamps

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
