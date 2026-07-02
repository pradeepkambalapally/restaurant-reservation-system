const Table = require('../models/Table');

// @route  GET /api/tables
// @access Private (any authenticated role — customers need this to book)
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json(tables);
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/tables
// @access Private/Admin
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (tableNumber === undefined || capacity === undefined) {
      return res.status(400).json({ message: 'tableNumber and capacity are required' });
    }

    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/tables/:id
// @access Private/Admin
const updateTable = async (req, res, next) => {
  try {
    const { capacity } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (capacity !== undefined) table.capacity = capacity;
    await table.save();

    res.status(200).json(table);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/tables/:id
// @access Private/Admin
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await table.deleteOne();
    res.status(200).json({ message: 'Table deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable };