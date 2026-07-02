// Centralized error handler. Any err passed to next(err) lands here.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose duplicate key error (e.g. table+date+timeSlot conflict, or duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ');
    return res.status(409).json({
      message: field.includes('email')
        ? 'An account with this email already exists'
        : 'This table is already booked for the selected date and time slot',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
};

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };