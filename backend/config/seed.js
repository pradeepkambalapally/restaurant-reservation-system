// Seeds the database with:
//   1. A single admin account (from env vars — never via public signup)
//   2. A fixed set of restaurant tables
//
// Run with: npm run seed
// Safe to re-run — it skips creation if the admin or tables already exist,
// so it won't create duplicates or wipe existing reservations.

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('../models/User');
const Table = require('../models/Table');

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin seed.');
    return;
  }

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existingAdmin) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  await User.create({
    name: ADMIN_NAME || 'Admin',
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Admin account created: ${ADMIN_EMAIL}`);
};

const seedTables = async () => {
  const existingCount = await Table.countDocuments();
  if (existingCount > 0) {
    console.log(`Tables already seeded (${existingCount} found) — skipping.`);
    return;
  }

  // A single restaurant with a fixed set of tables of varying capacity.
  const tables = [
    { tableNumber: 1, capacity: 2 },
    { tableNumber: 2, capacity: 2 },
    { tableNumber: 3, capacity: 4 },
    { tableNumber: 4, capacity: 4 },
    { tableNumber: 5, capacity: 4 },
    { tableNumber: 6, capacity: 6 },
    { tableNumber: 7, capacity: 6 },
    { tableNumber: 8, capacity: 8 },
  ];

  await Table.insertMany(tables);
  console.log(`${tables.length} tables seeded.`);
};

const runSeed = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedTables();
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();