const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Routes
const authRoutes = require('../screens/auth/routes/auth');
const dashboardRoutes = require('../screens/adminDashboard/routes/dashboard');

// Middleware
const { requireAuth } = require('./middleware/auth');

const app = express();

// Middleware for parsing form and JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware for login persistence
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true only if using HTTPS
}));

// Serve static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// Root route → login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

// Protect dashboard page
app.get('/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Auth routes
app.use('/auth', authRoutes);


app.use('/api', requireAuth, dashboardRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
