const express = require('express');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// POST /api/bookings — create booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupTime, returnTime, location, paymentMethod } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'available')
      return res.status(400).json({ error: 'Vehicle is not available' });

    // Calculate hours & amount
    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end   = new Date(`${returnDate}T${returnTime}`);
    const totalHours = Math.max(1, Math.round((end - start) / 3600000));
    const totalAmount = totalHours * vehicle.pricePerHour;

    const booking = await Booking.create({
      vehicle: vehicleId, renter: req.user.id,
      pickupDate, returnDate, pickupTime, returnTime,
      location, totalHours, totalAmount,
      paymentMethod: paymentMethod || 'Cash'
    });

    // Mark vehicle as rented
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'rented' });

    await booking.populate('vehicle', 'name model icon pricePerHour');
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/my — renter's bookings
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('vehicle', 'name model type icon pricePerHour')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/all — all bookings (admin view)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle', 'name model type')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.renter.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your booking' });

    booking.status = 'cancelled';
    await booking.save();

    // Free up the vehicle
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available' });
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id/complete
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'completed';
    await booking.save();
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'available' });
    res.json({ message: 'Booking completed', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
