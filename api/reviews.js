const express = require('express');
const Review = require('../models/Review');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /api/reviews/:vehicleId — get all reviews for a vehicle
router.get('/:vehicleId', async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:vehicleId — add review (auth required)
router.post('/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { stars, text } = req.body;
    if (!stars || !text)
      return res.status(400).json({ error: 'Stars and text are required' });

    const vehicle = await Vehicle.findById(req.params.vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const review = await Review.create({
      vehicle: req.params.vehicleId,
      author: req.user.id,
      stars, text
    });

    await review.populate('author', 'name');
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ error: 'You already reviewed this vehicle' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id — delete own review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.author.toString() !== req.user.id)
      return res.status(403).json({ error: 'Not your review' });
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
