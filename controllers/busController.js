const BusService = require('../services/busService');

class BusController {
    static async getAllBuses(req, res) {
        try {
            const buses = await BusService.getAllBuses();
            res.json(buses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBusesByRoute(req, res) {
        try {
            const { route } = req.params;
            const buses = await BusService.getBusesByRoute(route);
            res.json(buses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getBusByNumber(req, res) {
        try {
            const { busNumber } = req.params;
            const bus = await BusService.getBusByNumber(busNumber);
            res.json(bus);
        } catch (error) {
            res.status(error.message === 'Bus not found' ? 404 : 500).json({ error: error.message });
        }
    }
}

module.exports = BusController;
