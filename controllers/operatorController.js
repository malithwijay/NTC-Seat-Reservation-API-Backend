const operatorService = require('../services/operatorService');

exports.getBusDetails = async (req, res) => {
    try {
        const bus = await operatorService.getBusDetails(req.params.busNumber, req.user);
        res.status(200).json({ message: 'Bus details retrieved successfully', bus });
    } catch (error) {
        console.error('Error fetching bus details:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const updatedBus = await operatorService.updateSchedule(req.params.busNumber, req.body.schedule, req.user);
        res.status(200).json({ message: 'Schedule updated successfully', bus: updatedBus });
    } catch (error) {
        console.error('Error updating schedule:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateStops = async (req, res) => {
    try {
        const updatedBus = await operatorService.updateStops(req.params.busNumber, req.body.stops, req.user);
        res.status(200).json({ message: 'Stops updated successfully', bus: updatedBus });
    } catch (error) {
        console.error('Error updating stops:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.replaceBus = async (req, res) => {
    try {
        const updatedBus = await operatorService.replaceBus(req.body.oldBusNumber, req.body.newBusNumber, req.user);
        res.status(200).json({ message: 'Bus replaced successfully', bus: updatedBus });
    } catch (error) {
        console.error('Error replacing bus:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateBusDetails = async (req, res) => {
    try {
        const updatedBus = await operatorService.updateBusDetails(req.params.busNumber, req.body, req.user);
        res.status(200).json({ message: 'Bus details updated successfully', bus: updatedBus });
    } catch (error) {
        console.error('Error updating bus details:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getPermitStatus = async (req, res) => {
    try {
        const permitStatus = await operatorService.getPermitStatus(req.user);
        res.status(200).json({ message: 'Permit status retrieved successfully', permitStatus });
    } catch (error) {
        console.error('Error fetching permit status:', error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
