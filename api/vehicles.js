const express = require('express');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/vehicles — get all vehicles (public)
router.get('/', async (req, res) => {
  try {
    const { type, status, fuel } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (fuel) filter.fuel = fuel;
    const vehicles = await Vehicle.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id — single vehicle (public)
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email phone');
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles — list a vehicle (owner only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'owner')
      return res.status(403).json({ error: 'Only owners can list vehicles' });

    const { type, name, model, year, buyDate, fuel, seats, kmDriven, desc, photos, pricePerHour, pricePerDay, location } = req.body;
    if (!photos || photos.length < 6)
      return res.status(400).json({ error: 'Minimum 6 photos required' });

    const vehicle = await Vehicle.create({
      owner: req.user.id, type, name, model, year, buyDate, fuel,
      seats, kmDriven, desc, photos, pricePerHour,
      pricePerDay: pricePerDay || pricePerHour * 20, location
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id — update vehicle (owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your vehicle' });

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id (owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.owner.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your vehicle' });
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/owner/my — owner's own vehicles
router.get('/owner/my', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
