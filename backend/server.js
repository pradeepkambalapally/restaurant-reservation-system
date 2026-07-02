require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Core middleware
app.use(cors());
app.use(express.json());

// Health check — useful for confirming deployment is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Restaurant Reservation API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

// 404 + centralized error handler (must be last, in this order)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});