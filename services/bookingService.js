const Booking = require('../models/booking');
const Bus = require('../models/bus');

class BookingService {
    static async createBooking(data) {
        const { userId, busId, seatNumbers, startStop, busType, time } = data;

        const bus = await Bus.findById(busId);
        if (!bus) {
            throw new Error('Bus not found');
        }

        const validStops = bus.stops.map((stop) => stop.name);
        if (!validStops.includes(startStop)) {
            throw new Error(`Invalid startStop: ${startStop}. Available stops: ${validStops.join(', ')}`);
        }

        const stopDetails = bus.stops.find((stop) => stop.name === startStop);
        const fare = busType === 'luxury' ? stopDetails.fareLuxury : stopDetails.fareNormal;

        const schedule = bus.schedule.find((s) => s.time === time);
        if (!schedule) {
            throw new Error('Invalid time. No trip is scheduled for the selected time.');
        }

        for (const seat of seatNumbers) {
            if (schedule.bookedSeats.includes(seat)) {
                throw new Error(`Seat ${seat} is already booked.`);
            }
        }

        schedule.availableSeats -= seatNumbers.length;
        schedule.bookedSeats.push(...seatNumbers);

        await bus.save();

        const booking = new Booking({
            userId,
            busId,
            seatNumbers,
            startStop,
            fare: fare * seatNumbers.length,
            busType,
            tripTime: time,
            status: 'confirmed',
        });

        await booking.save();

        return booking;
    }

    static async getUserBookings(userId) {
        return Booking.find({ userId }).populate('busId', 'route');
    }

    static async updateBooking(id, data) {
        const booking = await Booking.findById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        const bus = await Bus.findById(booking.busId);
        if (!bus) {
            throw new Error('Bus not found for the booking');
        }

        const schedule = bus.schedule.find((s) => s.time === booking.tripTime);
        if (!schedule) {
            throw new Error('Invalid trip time. Schedule not found for the booking');
        }

        const oldSeatNumbers = booking.seatNumbers || [];
        const newSeatNumbers = data.seatNumbers || oldSeatNumbers;

        schedule.bookedSeats = schedule.bookedSeats.filter((seat) => !oldSeatNumbers.includes(seat));
        schedule.availableSeats += oldSeatNumbers.length;

        for (const seat of newSeatNumbers) {
            if (!schedule.bookedSeats.includes(seat)) {
                schedule.bookedSeats.push(seat);
                schedule.availableSeats -= 1;
            }
        }

        await bus.save();

        booking.seatNumbers = newSeatNumbers;
        booking.startStop = data.startStop || booking.startStop;
        booking.busType = data.busType || booking.busType;
        booking.tripTime = data.tripTime || booking.tripTime;

        await booking.save();

        return booking;
    }
}

module.exports = BookingService;
