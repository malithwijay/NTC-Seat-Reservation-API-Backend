require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('../../models/bus');

const seedDatabase = async () => {
    const routes = [
        { name: 'Colombo to Kandy', price: 1500 },
        { name: 'Colombo to Galle', price: 2600 },
        { name: 'Kandy to Jaffna', price: 4500 },
        { name: 'Galle to Matara', price: 1200 },
        { name: 'Jaffna to Colombo', price: 5700 },
    ];

    const buses = Array.from({ length: 25 }, (_, i) => ({
        busNumber: `Bus-${i + 1}`,
        operatorId: null,
        route: routes[i % routes.length].name,
        price: routes[i % routes.length].price, // Assign price based on route
        schedule: Array.from({ length: 7 }, (_, j) => ({
            date: new Date(Date.now() + j * 24 * 60 * 60 * 1000),
            time: `${8 + (j % 12)}:00 ${j % 12 < 4 ? 'AM' : 'PM'}`,
            availableSeats: 40,
            bookedSeats: [],
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
