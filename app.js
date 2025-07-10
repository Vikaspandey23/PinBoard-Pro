const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const MongoStore = require('connect-mongo');
const User = require('./models/user');
const authRoutes = require('./routes/auth');
const pinRoutes = require('./routes/pins');
const boardRoutes = require('./routes/boards');
const Pin = require('./models/Pin');

dotenv.config(); // Load environment variables

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ View engine and middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ Disable cache (dev only)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ✅ Session config with Mongo store (no maxAge here)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
  cookie: {
    // No maxAge by default; we'll handle it after login
  }
}));

// ✅ Middleware to handle "Remember Me" after login form
app.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/login' && req.body.rememberMe) {
    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  } else {
    req.session.cookie.expires = false; // session cookie (clears on browser close)
  }
  next();
});

// ✅ Make session & user available to views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('username');
      res.locals.user = user;
    } catch (err) {
      console.error('User lookup error:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

// ✅ Routes
app.use('/', authRoutes);
app.use('/pins', pinRoutes);
app.use('/boards', boardRoutes);

// ✅ Home Route — fetch 4 most recent pins only
app.get('/', async (req, res) => {
  try {
    const pins = await Pin.find()
      .populate('userId')
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(4);               // Limit to 4 pins

    res.render('index', {
      pins,
      session: req.session,
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
