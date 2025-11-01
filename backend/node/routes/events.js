const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await db.query('SELECT * FROM events');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving events' });
    }
});

// Create a new event
router.post('/', async (req, res) => {
    const { title, description, date, venue, coordinator } = req.body;
    try {
        const result = await db.query('INSERT INTO events (title, description, date, venue, coordinator) VALUES (?, ?, ?, ?, ?)', [title, description, date, venue, coordinator]);
        res.status(201).json({ message: 'Event created', eventId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await db.query('SELECT * FROM events WHERE event_id = ?', [id]);
        if (event.length > 0) {
            res.json(event[0]);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving event' });
    }
});

// Update an event
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, date, venue, coordinator } = req.body;
    try {
        await db.query('UPDATE events SET title = ?, description = ?, date = ?, venue = ?, coordinator = ? WHERE event_id = ?', [title, description, date, venue, coordinator, id]);
        res.json({ message: 'Event updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
});

// Delete an event
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM events WHERE event_id = ?', [id]);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;