const mongoose = require('mongoose');

// Schema for stops
const StopSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Name of the stop
    distance: { type: Number, required: true }, // Distance from the starting point (in km)
    fareNormal: { type: Number, required: true }, // Fare for normal buses to this stop
    fareLuxury: { type: Number, required: true }, // Fare for luxury buses to this stop
});

// Schema for schedule
const ScheduleSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    availableSeats: { type: Number, default: 40 },
    bookedSeats: { type: [Number], default: [] }, // Array of booked seat numbers
});

// Main bus schema
const BusSchema = new mongoose.Schema({
    busNumber: { type: String, required: true },
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Reference to the operator managing the bus
    route: { type: String, required: true }, // Route name (e.g., "Colombo to Kandy")
    stops: { type: [StopSchema], required: true }, // Array of stops along the route
    priceNormal: { type: Number, required: true }, // Full route fare for normal buses
    priceLuxury: { type: Number, required: true }, // Full route fare for luxury buses
    schedule: { type: [ScheduleSchema], required: true }, // Array of schedules for the bus
});

module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
