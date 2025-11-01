const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Signup (student)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !email.endsWith('@mlrit.ac.in')) return res.status(400).json({ message: 'Invalid MLRIT email' });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase().trim(), password: hash, role: 'student' });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(201).json({ message: 'User created', token, role: user.role });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login (student or admin) — expects email + password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user.userId).select('-password').lean();
    if (!u) return res.status(404).json({ message: 'User not found' });
    return res.json(u);
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;