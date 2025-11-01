const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper: create sample events if none exist
async function seedIfEmpty() {
    const count = await Event.countDocuments();
    if (count === 0) {
        const sample = [
            {
                title: 'MLRIT Tech Talk: Web Dev',
                description: 'Intro to modern web development and best practices.',
                date: new Date(Date.now() + 7*24*60*60*1000),
                venue: 'Auditorium A',
                coordinator: 'Prof. Sharma'
            },
            {
                title: 'AI Workshop',
                description: 'Hands-on workshop on AI models and deployment.',
                date: new Date(Date.now() + 14*24*60*60*1000),
                venue: 'Lab 2',
                coordinator: 'Dr. Rao'
            },
            {
                title: 'Past: Coding Challenge',
                description: 'Competitive programming event (past).',
                date: new Date(Date.now() - 10*24*60*60*1000),
                venue: 'Online',
                coordinator: 'CS Club'
            }
        ];
        await Event.insertMany(sample);
        console.log('Seeded sample events');
    }
}

// GET /api/events - list events (seed if empty)
router.get('/', auth, async (req, res) => {
    try {
        await seedIfEmpty();
        const events = await Event.find().sort({ date: 1 }).lean();
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/events/:id - get single event
router.get('/:id', auth, async (req, res) => {
    try {
        const ev = await Event.findById(req.params.id).lean();
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        res.json(ev);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/events - create event (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const { title, description, date, venue, coordinator } = req.body;
        const event = new Event({ title, description, date, venue, coordinator });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid data' });
    }
});

// Register for event (fixed enum values)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: 'User not found or not authenticated' });

    // initialize arrays if needed
    ev.registrations = ev.registrations || [];
    ev.attendance = ev.attendance || [];

    // check for existing registration
    const already = ev.registrations.some(r => r.toString() === user._id.toString());
    if (already) return res.status(400).json({ message: 'Already registered' });

    // add registration
    ev.registrations.push(user._id);

    // add attendance entry with correct enum value
    const attExists = ev.attendance.some(a => a.student && a.student.toString() === user._id.toString());
    if (!attExists) {
      ev.attendance.push({ student: user._id, status: 'absent' }); // lowercase 'absent'
    }

    await ev.save();
    console.log(`User ${user.email} registered for event ${ev.title}`);
    return res.json({ message: 'Registration successful', eventId: ev._id });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/events/:id/registrations - admin view registrations (populated)
router.get('/:id/registrations', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const ev = await Event.findById(req.params.id).populate('registrations', 'name email').lean();
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        // map attendance statuses
        const attendanceMap = {};
        (ev.attendance || []).forEach(a => {
            attendanceMap[a.student.toString()] = a.status;
        });
        const regs = (ev.registrations || []).map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            attendance: attendanceMap[u._id.toString()] || 'Absent'
        }));
        res.json({ event: { _id: ev._id, title: ev.title }, registrations: regs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/events/:id/attendance - mark attendance (admin)
router.post('/:id/attendance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const { studentId, status } = req.body; // status: 'Present' or 'Absent'
        const ev = await Event.findById(req.params.id);
        if (!ev) return res.status(404).json({ message: 'Event not found' });

        ev.attendance = ev.attendance || [];
        const idx = ev.attendance.findIndex(a => a.student.toString() === studentId);
        if (idx >= 0) {
            ev.attendance[idx].status = status;
        } else {
            ev.attendance.push({ student: studentId, status });
        }
        await ev.save();
        res.json({ message: 'Attendance updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/events/:id - update (admin)
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        res.json(ev);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/events/:id - admin delete
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;