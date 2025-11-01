// Run: node create_admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO = process.env.DATABASE_URL || 'mongodb://localhost:27017/eventease';
const ADMIN_EMAIL = 'admin@mlrit.ac.in';
const ADMIN_PASSWORD = 'Admin@123'; // change after first use

(async function run() {
  try {
    console.log('create_admin.js starting');
    console.log('Using MONGO URI:', MONGO);

    // set short connection timeout
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = new User({ name: 'EventEase Admin', email: ADMIN_EMAIL, password: hash, role: 'admin' });
  await admin.save();
  console.log('Created admin ->', ADMIN_EMAIL, 'password:', ADMIN_PASSWORD);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });