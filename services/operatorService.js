const Bus = require('../models/bus');
const { generateStopsWithFares } = require('./adminService'); // Correctly importing the function

exports.getBusDetails = async (busNumber, user) => {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) throw { statusCode: 404, message: 'Bus not found' };

    if (user.role === 'operator' && bus.operatorId?.toString() !== user.userId) {
        throw { statusCode: 403, message: 'Access denied. You are not authorized to view this bus.' };
    }
    return bus;
};

exports.updateSchedule = async (busNumber, schedule, user) => {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) throw { statusCode: 404, message: 'Bus not found' };

    if (user.role === 'operator' && bus.operatorId?.toString() !== user.userId) {
        throw { statusCode: 403, message: 'Access denied. You are not authorized to update this bus schedule.' };
    }

    bus.schedule = schedule;
    await bus.save();
    return bus;
};

exports.updateStops = async (busNumber, stops, user) => {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) throw { statusCode: 404, message: 'Bus not found' };

    if (user.role === 'operator' && bus.operatorId?.toString() !== user.userId) {
        throw { statusCode: 403, message: 'Access denied. You are not authorized to update this bus stops.' };
    }

    const updatedStops = generateStopsWithFares(stops, bus.priceNormal, bus.priceLuxury);
    bus.stops = updatedStops;
    await bus.save();
    return bus;
};

exports.replaceBus = async (oldBusNumber, newBusNumber, user) => {
    const oldBus = await Bus.findOne({ busNumber: oldBusNumber });
    if (!oldBus) throw { statusCode: 404, message: 'Old bus not found' };

    if (user.role === 'operator' && oldBus.operatorId?.toString() !== user.userId) {
        throw { statusCode: 403, message: 'Access denied. You are not authorized to replace this bus.' };
    }

    const newBus = await Bus.findOne({ busNumber: newBusNumber });
    if (newBus) throw { statusCode: 400, message: 'New bus number is already in use.' };

    oldBus.busNumber = newBusNumber;
    await oldBus.save();
    return oldBus;
};

exports.updateBusDetails = async (busNumber, details, user) => {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) throw { statusCode: 404, message: 'Bus not found' };

    if (user.role === 'operator' && bus.operatorId?.toString() !== user.userId) {
        throw { statusCode: 403, message: 'Access denied. You are not authorized to update this bus.' };
    }

    const updatedStops = generateStopsWithFares(details.stops, details.priceNormal, details.priceLuxury);
    const preservedSchedule = details.schedule.map((updatedItem) => {
        const existingItem = bus.schedule.find(
            (item) => item.time === updatedItem.time && new Date(item.date).toISOString() === new Date(updatedItem.date).toISOString()
        );

        return existingItem
            ? {
                  ...updatedItem,
                  bookedSeats: existingItem.bookedSeats,
                  availableSeats: updatedItem.availableSeats - existingItem.bookedSeats.length,
              }
            : updatedItem;
    });

    Object.assign(bus, {
        ...details,
        stops: updatedStops,
        schedule: preservedSchedule,
    });

    await bus.save();
    return bus;
};

exports.getPermitStatus = async (user) => {
    const buses = await Bus.find({ operatorId: user.userId });
    return buses.map((bus) => ({
        busNumber: bus.busNumber,
        permitId: bus.permitId,
        permitStatus: bus.permitStatus,
    }));
};
