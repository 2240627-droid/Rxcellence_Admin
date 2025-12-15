const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Route handlers for different modules
const medicineRoutes = require('../screens/adminMedicineMasterList/routes/medicine');
const authRoutes = require('../screens/auth/routes/auth');
const dashboardRoutes = require('../screens/adminDashboard/routes/dashboard');
const userManagementRoutes = require('../screens/adminUserManagement/routes/usermanagementRoutes');

// Middleware to protect routes
const { requireAuth } = require('./middleware/auth');

const app = express();

// Parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session handling for login state
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Use true only if serving over HTTPS
}));

// Serve static files (CSS, JS, images) from /public
app.use(express.static(path.join(__dirname, '../public')));

// Public routes for login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html')); 
});

// Protected HTML pages (require login)
app.get('/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/medicine-masterlist.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/medicine-masterlist.html'));
});

app.get('/usermanagement.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/usermanagement.html'));
});

// Route groups
app.use('/auth', authRoutes); // Login, logout, etc.
app.use('/api', requireAuth, medicineRoutes); // Medicine API
app.use('/api', requireAuth, dashboardRoutes); // Dashboard API
app.use('/admin', requireAuth, userManagementRoutes); // User management API

// Logout and destroy session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/login.html');
  });
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
