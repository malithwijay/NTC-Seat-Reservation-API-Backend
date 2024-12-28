const Bus = require('../models/bus');
const crypto = require('crypto');

/**
 * Generate a unique permit ID for buses
 */
const generateUniquePermit = () => {
    return crypto.randomBytes(8).toString('hex');
};

/**
 * Generate stops with all combinations and fares based on the provided stops
 */
const generateStopsWithFares = (stops, priceNormal, priceLuxury) => {
    const stopPairs = [];
    const totalStops = stops.length;

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

/**
 * Add a new route or bus
 */
exports.addRoute = async (routeData) => {
    const { busNumber, route, priceNormal, priceLuxury, operatorId, stops, schedule } = routeData;

    if (!busNumber || !route || !priceNormal || !priceLuxury || !stops || !schedule) {
        throw new Error('Invalid input. All fields are required.');
    }

    const existingRoute = await Bus.findOne({ route });

    if (existingRoute) {
        const existingBus = await Bus.findOne({ route, busNumber });
        if (existingBus) {
            throw new Error('Bus with this number already exists for the route.');
        }
    }

    const generatedStops = generateStopsWithFares(stops, priceNormal, priceLuxury);

    // Process schedule to lock specific seats
    const processedSchedule = schedule.map((item) => {
        if (item.lockedSeats && Array.isArray(item.lockedSeats)) {
            return {
                ...item,
                availableSeats: item.availableSeats - item.lockedSeats.length,
                bookedSeats: [...item.lockedSeats],
            };
        }
        return item;
    });

    const newBus = new Bus({
        busNumber,
        route,
        priceNormal,
        priceLuxury,
        operatorId,
        stops: generatedStops,
        schedule: processedSchedule,
        permitId: generateUniquePermit(),
        permitStatus: 'pending',
    });

    await newBus.save();

    return { message: 'New bus added successfully', bus: newBus };
};

/**
 * Update stops for a specific bus
 */
exports.updateStops = async (busNumber, stops) => {
    if (!stops || !Array.isArray(stops)) {
        throw new Error('Invalid input. Stops must be an array.');
    }

    const bus = await Bus.findOne({ busNumber });
    if (!bus) {
        throw new Error('Bus not found.');
    }

    const updatedStops = generateStopsWithFares(stops, bus.priceNormal, bus.priceLuxury);
    bus.stops = updatedStops;
    await bus.save();

    return { message: 'Stops updated successfully', bus };
};

/**
 * Update the permit status of a bus
 */
exports.updatePermitStatus = async (busNumber, permitStatus) => {
    if (!['granted', 'revoked'].includes(permitStatus)) {
        throw new Error('Invalid permit status. Must be "granted" or "revoked".');
    }

    const bus = await Bus.findOne({ busNumber });
    if (!bus) {
        throw new Error('Bus not found.');
    }

    if (!bus.permitId) {
        bus.permitId = generateUniquePermit();
    }

    bus.permitStatus = permitStatus;
    await bus.save();

    return { message: `Permit ${permitStatus} successfully`, bus };
};

/**
 * Export the generateStopsWithFares function for reuse in other services
 */
exports.generateStopsWithFares = generateStopsWithFares;
