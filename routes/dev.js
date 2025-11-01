const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Dev route: sets an admin token in localStorage and redirects to admin dashboard.
// REMOVE this route before deploying to production.
router.get('/admin-login', (req, res) => {
  const payload = { userId: 'dev-admin', role: 'admin', email: 'admin@mlrit.ac.in' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  res.send(`<!doctype html>
  <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dev Admin Login</title></head>
    <body>
      <script>
        // store token and redirect to admin UI
        localStorage.setItem('token', ${JSON.stringify(token)});
        window.location.href = '/pages/admin/dashboard.html';
      </script>
      <noscript>Enable JavaScript to continue.</noscript>
    </body>
  </html>`);
});

module.exports = router;