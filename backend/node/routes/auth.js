const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to validate MLRIT email
const validateEmailDomain = (email) => {
    return email.endsWith('@mlrit.ac.in');
};

// Student login route
router.post('/login/student', async (req, res) => {
    const { email, password } = req.body;

    if (!validateEmailDomain(email)) {
        return res.status(400).json({ message: 'Invalid email domain' });
    }

    try {
        const student = await db.query('SELECT * FROM students WHERE email = ?', [email]);
        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const isMatch = await bcrypt.compare(password, student[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: student[0].student_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin login route
router.post('/login/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        if (admin.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: admin[0].admin_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Export the router
module.exports = router;