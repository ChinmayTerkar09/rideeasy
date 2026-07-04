const express = require('express');
const twilio = require('twilio');
const authMiddleware = require('../middleware/auth');
const Booking = require('../models/Booking');
const router = express.Router();

const getClient = () => twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /api/notify/booking-confirm — SMS on booking confirmation
router.post('/booking-confirm', authMiddleware, async (req, res) => {
  try {
    const { bookingId, phone } = req.body;
    const booking = await Booking.findById(bookingId)
      .populate('vehicle', 'name model')
      .populate('renter', 'name phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const message = `✅ RideEasy Booking Confirmed!
ID: ${booking._id.toString().slice(-6).toUpperCase()}
Vehicle: ${booking.vehicle.name} (${booking.vehicle.model})
Pickup: ${new Date(booking.pickupDate).toDateString()} at ${booking.pickupTime}
Return: ${new Date(booking.returnDate).toDateString()} at ${booking.returnTime}
Total: ₹${booking.totalAmount}
Thank you for choosing RideEasy! 🚗`;

    const client = getClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone || booking.renter.phone
    });

    res.json({ success: true, message: 'SMS sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notify/booking-reminder — reminder 1hr before pickup
router.post('/booking-reminder', authMiddleware, async (req, res) => {
  try {
    const { bookingId, phone } = req.body;
    const booking = await Booking.findById(bookingId)
      .populate('vehicle', 'name')
      .populate('renter', 'name phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const message = `⏰ RideEasy Reminder!
Your ${booking.vehicle.name} pickup is in 1 hour.
Time: ${booking.pickupTime} today.
Have a great ride! 🚗`;

    const client = getClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone || booking.renter.phone
    });

    res.json({ success: true, message: 'Reminder sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notify/owner-alert — notify owner when their vehicle is booked
router.post('/owner-alert', authMiddleware, async (req, res) => {
  try {
    const { bookingId, ownerPhone } = req.body;
    const booking = await Booking.findById(bookingId)
      .populate('vehicle', 'name')
      .populate('renter', 'name phone');

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const message = `🔔 RideEasy: Your vehicle "${booking.vehicle.name}" has been booked!
Renter: ${booking.renter.name}
From: ${new Date(booking.pickupDate).toDateString()} ${booking.pickupTime}
To: ${new Date(booking.returnDate).toDateString()} ${booking.returnTime}
Amount: ₹${booking.totalAmount}`;

    const client = getClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ownerPhone
    });

    res.json({ success: true, message: 'Owner alerted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
