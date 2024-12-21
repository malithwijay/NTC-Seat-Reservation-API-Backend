const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNumber: String,
    route: String,
    availableSeats: Number,
    schedule: [Date],
});

module.exports = mongoose.model('Bus', BusSchema);
