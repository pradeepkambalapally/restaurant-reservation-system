const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @route  POST /api/reservations
// @access Private/Customer
const createReservation = async (req, res, next) => {
  try {
    const { table, date, timeSlot, guests } = req.body;

    if (!table || !date || !timeSlot || !guests) {
      return res.status(400).json({ message: 'table, date, timeSlot, and guests are required' });
    }

    // 1. Confirm the table actually exists
    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // 2. Capacity check — reject before even attempting to book
    if (guests > tableDoc.capacity) {
      return res.status(400).json({
        message: `Table ${tableDoc.tableNumber} seats up to ${tableDoc.capacity} guests, but ${guests} were requested`,
      });
    }

    // 3. Proactive conflict check — gives a clean, specific error message.
    // This is a courtesy check; it can still race under concurrent requests,
    // which is why the DB-level partial unique index (see Reservation model)
    // is the real guarantee. If two requests slip past this check at the same
    // instant, the second insert below will throw a duplicate-key error,
    // caught by the centralized error handler as a 409.
    const conflict = await Reservation.findOne({
      table,
      date,
      timeSlot,
      status: 'confirmed',
    });
    if (conflict) {
      return res.status(409).json({
        message: `Table ${tableDoc.tableNumber} is already booked for ${date} at ${timeSlot}`,
      });
    }

    // 4. Create the reservation
    const reservation = await Reservation.create({
      user: req.user._id,
      table,
      date,
      timeSlot,
      guests,
    });

    const populated = await reservation.populate('table', 'tableNumber capacity');
    res.status(201).json(populated);
  } catch (err) {
    next(err); // duplicate-key race lands here → 409 via errorHandler
  }
};

// @route  GET /api/reservations/mine
// @access Private/Customer
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/reservations/:id
// @access Private/Customer (own reservations only)
const cancelMyReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Ownership check — customers can only cancel their own bookings
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own reservations' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'Reservation is already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({ message: 'Reservation cancelled', reservation });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/reservations
// @access Private/Admin
// Supports optional ?date=YYYY-MM-DD filter
const getAllReservations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/reservations/:id
// @access Private/Admin
// Admin can update date/timeSlot/table/guests/status on any reservation
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const { table, date, timeSlot, guests, status } = req.body;

    // If table/date/timeSlot is changing, re-validate capacity + conflicts
    const newTable = table || reservation.table;
    const newDate = date || reservation.date;
    const newTimeSlot = timeSlot || reservation.timeSlot;
    const newGuests = guests || reservation.guests;

    const tableDoc = await Table.findById(newTable);
    if (!tableDoc) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (newGuests > tableDoc.capacity) {
      return res.status(400).json({
        message: `Table ${tableDoc.tableNumber} seats up to ${tableDoc.capacity} guests, but ${newGuests} were requested`,
      });
    }

    // Check conflicts, excluding this reservation itself
    const conflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      table: newTable,
      date: newDate,
      timeSlot: newTimeSlot,
      status: 'confirmed',
    });
    if (conflict) {
      return res.status(409).json({
        message: `Table ${tableDoc.tableNumber} is already booked for ${newDate} at ${newTimeSlot}`,
      });
    }

    reservation.table = newTable;
    reservation.date = newDate;
    reservation.timeSlot = newTimeSlot;
    reservation.guests = newGuests;
    if (status) reservation.status = status;

    await reservation.save();
    const populated = await reservation.populate('table', 'tableNumber capacity');

    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/reservations/:id/admin
// @access Private/Admin
// Admin can cancel any reservation, regardless of owner
const adminCancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({ message: 'Reservation cancelled by admin', reservation });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelMyReservation,
  getAllReservations,
  updateReservation,
  adminCancelReservation,
};