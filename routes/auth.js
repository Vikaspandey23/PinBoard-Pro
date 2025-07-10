const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// ✅ Middleware to check login
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// ✅ Show Register Page
router.get('/register', (req, res) => {
    res.render('register');
});

// ✅ Show Login Page
router.get('/login', (req, res) => {
    res.render('login');
});

// ✅ Protected Upload Page
router.get('/upload', isLoggedIn, (req, res) => {
    res.render('upload');
});

// ✅ Handle Register Form
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword
  });

  await newUser.save();
  res.redirect('/login');
});

// ✅ Handle Login Form
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }
        req.session.userId = user._id;
        res.redirect('/upload');
    } catch (err) {
        console.error(err);
        res.status(500).send('Login failed');
    }
});

// ✅ Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


module.exports = router;
