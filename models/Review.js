const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars:   { type: Number, min: 1, max: 5, required: true },
  text:    { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// One review per user per vehicle
reviewSchema.index({ vehicle: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
