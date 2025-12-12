const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Routes
const medicineRoutes = require('../screens/adminMedicineMasterList/routes/medicine');
const authRoutes = require('../screens/auth/routes/auth');
const dashboardRoutes = require('../screens/adminDashboard/routes/dashboard');
const userManagementRoutes = require('../screens/adminUserManagement/routes/usermanagementRoutes');

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

// Login page route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html')); 
});

// Protect dashboard page
app.get('/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Protect medicine masterlist page
app.get('/medicine-masterlist.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/medicine-masterlist.html'));
});


app.get('/usermanagement.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/usermanagement.html'));
});

// Auth routes
app.use('/auth', authRoutes);

// API routes
app.use('/api', requireAuth, medicineRoutes);
app.use('/api', requireAuth, dashboardRoutes);
app.use('/admin', requireAuth, userManagementRoutes);

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/login.html');
  });
});

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
