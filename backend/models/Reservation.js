const mongoose = require('mongoose');
const { TIME_SLOTS } = require('../config/constants');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      // Stored as 'YYYY-MM-DD' string for simple exact-match querying.
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: TIME_SLOTS,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Partial unique index: prevents two *confirmed* reservations from
// ever existing on the same table/date/timeSlot combination, even under
// concurrent requests. Cancelled reservations are excluded so a table
// frees up once cancelled.
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

module.exports = mongoose.model('Reservation', reservationSchema);