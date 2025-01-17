const adminService = require('../services/adminService');

exports.addRoute = async (req, res) => {
    try {
        const routeData = req.body;
        const result = await adminService.addRoute(routeData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding route:', error.message);
        res.status(500).json({ message: 'Failed to add route or bus', error: error.message });
    }
};

exports.getRoutes = async (req, res) => {
    try {
        const routes = await adminService.getRoutes();
        res.status(200).json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error.message);
        res.status(500).json({ message: 'Failed to retrieve routes', error: error.message });
    }
};

exports.updateStops = async (req, res) => {
    try {
        const { busNumber } = req.params;
        const stops = req.body.stops;
        const result = await adminService.updateStops(busNumber, stops);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating stops:', error.message);
        res.status(500).json({ message: 'Failed to update stops', error: error.message });
    }
};

exports.updatePermitStatus = async (req, res) => {
    try {
        const { busNumber } = req.params;
        const { permitStatus } = req.body;
        const result = await adminService.updatePermitStatus(busNumber, permitStatus);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating permit status:', error.message);
        res.status(500).json({ message: 'Failed to update permit status', error: error.message });
    }
};
