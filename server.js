require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '20mb' })); // large limit for base64 photos
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// DB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/auth',     require('./api/auth'));
app.use('/api/vehicles', require('./api/vehicles'));
app.use('/api/bookings', require('./api/bookings'));
app.use('/api/reviews',  require('./api/reviews'));
app.use('/api/payment',  require('./api/payment'));
app.use('/api/notify',   require('./api/notify'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'RideEasy API', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 RideEasy API running on port ${PORT}`));

module.exports = app;
