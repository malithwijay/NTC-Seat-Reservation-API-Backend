const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNumber: String,
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    route: String,
    availableSeats: Number,
    schedule: [
        {
            date: { type: Date, required: true },
            time: { type: String, required: true },
            bookedSeats: { type: [Number], default: [] },
        },
    ],
});

// Check if the model already exists to prevent OverwriteModelError
module.exports = mongoose.models.Bus || mongoose.model('Bus', BusSchema);
