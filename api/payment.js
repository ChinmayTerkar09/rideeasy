const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/order — create Razorpay order
router.post('/order', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: { bookingId: bookingId.toString() }
    });

    // Save order id to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify — verify Razorpay payment signature
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ error: 'Payment verification failed' });

    // Update booking
    await Booking.findByIdAndUpdate(bookingId, {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'paid'
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/refund — refund on cancellation
router.post('/refund', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (!booking.razorpayPaymentId)
      return res.status(400).json({ error: 'No payment found for this booking' });

    const razorpay = getRazorpay();
    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
      amount: booking.totalAmount * 100
    });

    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, refund });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
