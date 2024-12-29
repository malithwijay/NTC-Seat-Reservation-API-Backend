const mongoose = require('mongoose');

// Schema for stops
const StopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    distance: { type: Number, required: true },
    fareNormal: { type: Number, required: true },
    fareLuxury: { type: Number, required: true },
});

// Schema for schedule
const ScheduleSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    availableSeats: { type: Number, default: 40 },
    bookedSeats: { type: [Number], default: [] },
    lockedSeats: { type: [Number], default: [] }, 
});

// Main bus schema
const BusSchema = new mongoose.Schema({
    busNumber: { type: String, required: true },
    operatorId: { type: String, required: true }, 
    route: { type: String, required: true },
    stops: { type: [StopSchema], required: true },
    priceNormal: { type: Number, required: true },
    priceLuxury: { type: Number, required: true },
    schedule: { type: [ScheduleSchema], required: true },
    permitId: { type: String, default: null },
    permitStatus: { type: String, enum: ['pending', 'granted', 'revoked'], default: 'pending' },
});

module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
