const Booking = require('../models/booking');
const Bus = require('../models/bus');
const User = require('../models/user');

class BookingService {
    static async createBooking(data) {
        const { userEmail, busNumber, seatNumbers, startStop, busType, date, time } = data;

        const bus = await Bus.findOne({ busNumber });
        if (!bus) {
            throw new Error('Bus not found');
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            throw new Error('User not found');
        }

        const validStops = bus.stops.map((stop) => stop.name);
        if (!validStops.includes(startStop)) {
            throw new Error(`Invalid startStop: ${startStop}. Available stops: ${validStops.join(', ')}`);
        }

        const stopDetails = bus.stops.find((stop) => stop.name === startStop);
        const fare = busType === 'luxury' ? stopDetails.fareLuxury : stopDetails.fareNormal;

        const schedule = bus.schedule.find(
            (s) => new Date(s.date).toISOString() === new Date(date).toISOString() && s.time === time
        );
        if (!schedule) {
            throw new Error('Invalid date or time. No trip is scheduled for the selected date and time.');
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
            userId: user._id,
            busId: bus._id,
            seatNumbers,
            startStop,
            fare: fare * seatNumbers.length,
            busType,
            tripTime: time,
            tripDate: date,
            status: 'confirmed',
        });

        await booking.save();

        return booking;
    }

    static async getUserBookings(userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            throw new Error('User not found');
        }

        return Booking.find({ userId: user._id }).populate('busId', 'route');
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

        const schedule = bus.schedule.find(
            (s) => new Date(s.date).toISOString() === new Date(booking.tripDate).toISOString() && s.time === booking.tripTime
        );
        if (!schedule) {
            throw new Error('Invalid trip time or date. Schedule not found for the booking');
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
        booking.tripDate = data.tripDate || booking.tripDate;

        await booking.save();

        return booking;
    }
}

module.exports = BookingService;
