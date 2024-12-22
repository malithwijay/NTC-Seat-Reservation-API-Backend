require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Bus = require('../models/bus');

const seedDatabase = async () => {
    const routes = ['Colombo to Kandy', 'Colombo to Galle', 'Kandy to Jaffna', 'Galle to Matara', 'Jaffna to Colombo'];

    const buses = Array.from({ length: 25 }, (_, i) => ({
        busNumber: `Bus-${i + 1}`,
        operatorId: null, // Assign operator IDs if operators are predefined
        route: routes[i % routes.length],
        availableSeats: 40,
        schedule: Array.from({ length: 7 }, (_, j) => ({
            date: new Date(Date.now() + j * 24 * 60 * 60 * 1000), // Dates for the next 7 days
            time: `${8 + (j % 12)}:00 ${j % 12 < 4 ? 'AM' : 'PM'}`, // Rotating times for variety
            bookedSeats: [], // No booked seats initially
        })),
    }));

    try {
        console.log('Connecting to MongoDB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        await Bus.insertMany(buses);
        console.log('Database seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Failed to seed database', error);
        process.exit(1);
    }
};

seedDatabase();
