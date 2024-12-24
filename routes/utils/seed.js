require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('../../models/bus');

const generateStopsWithFares = (stops, priceNormal, priceLuxury) => {
    const stopPairs = [];
    const totalStops = stops.length;

    // Generate fare for each combination of stops
    for (let i = 0; i < totalStops; i++) {
        for (let j = i + 1; j < totalStops; j++) {
            const distance = stops[j].distance - stops[i].distance;
            const fareNormal = Math.ceil((priceNormal / stops[totalStops - 1].distance) * distance);
            const fareLuxury = Math.ceil((priceLuxury / stops[totalStops - 1].distance) * distance);

            stopPairs.push({
                name: `${stops[i].name} to ${stops[j].name}`,
                distance,
                fareNormal,
                fareLuxury,
            });
        }
    }

    return stopPairs;
};

const seedDatabase = async () => {
    const routes = [
        {
            route: 'Colombo to Kandy',
            priceNormal: 1250,
            priceLuxury: 2400,
            stops: [
                { name: 'Colombo Fort', distance: 0 },
                { name: 'Kadawatha', distance: 10 },
                { name: 'Nittambuwa', distance: 30 },
                { name: 'Kegalle', distance: 50 },
                { name: 'Kandy', distance: 100 },
            ],
        },
        {
            route: 'Colombo to Galle',
            priceNormal: 1200,
            priceLuxury: 2350,
            stops: [
                { name: 'Colombo Fort', distance: 0 },
                { name: 'Moratuwa', distance: 10 },
                { name: 'Panadura', distance: 20 },
                { name: 'Kalutara', distance: 40 },
                { name: 'Galle', distance: 90 },
            ],
        },
        {
            route: 'Kandy to Nuwara Eliya',
            priceNormal: 1300,
            priceLuxury: 2500,
            stops: [
                { name: 'Kandy', distance: 0 },
                { name: 'Peradeniya', distance: 10 },
                { name: 'Gampola', distance: 30 },
                { name: 'Nawalapitiya', distance: 50 },
                { name: 'Nuwara Eliya', distance: 80 },
            ],
        },
        {
            route: 'Colombo to Jaffna',
            priceNormal: 1800,
            priceLuxury: 3200,
            stops: [
                { name: 'Colombo Fort', distance: 0 },
                { name: 'Kurunegala', distance: 50 },
                { name: 'Dambulla', distance: 120 },
                { name: 'Vavuniya', distance: 180 },
                { name: 'Jaffna', distance: 300 },
            ],
        },
        {
            route: 'Colombo to Badulla',
            priceNormal: 1400,
            priceLuxury: 2700,
            stops: [
                { name: 'Colombo Fort', distance: 0 },
                { name: 'Avissawella', distance: 40 },
                { name: 'Ratnapura', distance: 80 },
                { name: 'Haputale', distance: 150 },
                { name: 'Badulla', distance: 200 },
            ],
        },
    ];

    const buses = Array.from({ length: 25 }, (_, i) => {
        const routeIndex = i % routes.length; // Distribute buses across 5 routes
        const route = routes[routeIndex];

        return {
            busNumber: `Bus-${i + 1}`,
            route: route.route,
            priceNormal: route.priceNormal,
            priceLuxury: route.priceLuxury,
            stops: generateStopsWithFares(route.stops, route.priceNormal, route.priceLuxury),
            schedule: Array.from({ length: 7 }, (_, j) => ({
                date: new Date(Date.now() + j * 24 * 60 * 60 * 1000), // Schedules for the next 7 days
                time: `${8 + (j % 12)}:00 ${j % 2 === 0 ? 'AM' : 'PM'}`, // Rotating times
                availableSeats: 40,
                bookedSeats: [],
            })),
        };
    });

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log('Clearing existing data...');
        await Bus.deleteMany();

        console.log('Inserting new data...');
        await Bus.insertMany(buses);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Failed to seed database', error);
        process.exit(1);
    }
};

seedDatabase();
