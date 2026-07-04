const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicle:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  renter:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  returnTime: { type: String, required: true },
  location:   { type: String, default: '' },
  totalHours: { type: Number, required: true },
  totalAmount:{ type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI','Card','NetBanking','Cash'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  status: { type: String, enum: ['active','completed','cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
