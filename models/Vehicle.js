const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['bike', 'car'], required: true },
  name:     { type: String, required: true },
  model:    { type: String, required: true },
  year:     { type: Number, required: true },
  buyDate:  { type: Date },
  fuel:     { type: String, enum: ['Petrol','Diesel','Electric','Hybrid','Manual'], required: true },
  seats:    { type: Number, required: true },
  kmDriven: { type: Number, required: true },
  desc:     { type: String, default: '' },
  photos:   [{ type: String }],   // base64 or URLs
  pricePerHour: { type: Number, required: true },
  pricePerDay:  { type: Number },
  status:   { type: String, enum: ['available', 'rented', 'inactive'], default: 'available' },
  location: { type: String, default: 'India' },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
