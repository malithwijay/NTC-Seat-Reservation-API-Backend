const Bus = require('../models/bus');

class BusService {
    static async getAllBuses() {
        try {
            return await Bus.find();
        } catch (error) {
            throw new Error('Failed to retrieve buses');
        }
    }

    static async getBusesByRoute(route) {
        try {
            return await Bus.find({ route });
        } catch (error) {
            throw new Error('Failed to retrieve buses for the route');
        }
    }

    static async getBusById(id) {
        try {
            const bus = await Bus.findById(id);
            if (!bus) {
                throw new Error('Bus not found');
            }
            return bus;
        } catch (error) {
            throw new Error('Failed to retrieve bus details');
        }
    }
}

module.exports = BusService;