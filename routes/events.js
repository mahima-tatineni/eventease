const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new event (admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const event = new Event({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        venue: req.body.venue,
        coordinator: req.body.coordinator
    });

    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.registrations.includes(req.user.userId)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        event.registrations.push(req.user.userId);
        await event.save();
        res.json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;