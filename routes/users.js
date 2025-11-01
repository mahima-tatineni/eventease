const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// PUT /api/users/me - update profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.department !== undefined) updates.department = req.body.department;
    if (req.body.year !== undefined) updates.year = req.body.year;
    if (req.body.semester !== undefined) updates.semester = req.body.semester;
    if (req.body.rollNumber !== undefined) updates.rollNumber = req.body.rollNumber;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password').lean();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;