const Bus = require('../models/bus');
const crypto = require('crypto');

const generateUniquePermit = () => {
    return crypto.randomBytes(8).toString('hex');
};

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
    const newBus = new Bus({
        busNumber,
        route,
        priceNormal,
        priceLuxury,
        operatorId,
        stops: generatedStops,
        schedule,
        permitId: generateUniquePermit(),
        permitStatus: 'pending',
    });

    await newBus.save();

    return { message: 'New bus added successfully', bus: newBus };
};

exports.getRoutes = async () => {
    return await Bus.find();
};

exports.updateStops = async (id, stops) => {
    if (!stops || !Array.isArray(stops)) {
        throw new Error('Invalid input. Stops must be an array.');
    }

    const bus = await Bus.findById(id);
    if (!bus) {
        throw new Error('Bus not found.');
    }

    bus.stops = stops;
    await bus.save();

    return { message: 'Stops updated successfully', bus };
};

exports.updatePermitStatus = async (busId, permitStatus) => {
    if (!['granted', 'revoked'].includes(permitStatus)) {
        throw new Error('Invalid permit status. Must be "granted" or "revoked".');
    }

    const bus = await Bus.findById(busId);
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
