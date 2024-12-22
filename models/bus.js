const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNumber: String,
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    route: String,
    price: { type: Number, required: true },
    schedule: [
        {
            date: { type: Date, required: true },
            time: { type: String, required: true },
            availableSeats: { type: Number, default: 40 },
            bookedSeats: { type: [Number], default: [] }, // Ensure bookedSeats is initialized as an empty array
        },
    ],
});

module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
