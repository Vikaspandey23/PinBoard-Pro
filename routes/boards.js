const express = require('express');
const Board = require('../models/Board');
const router = express.Router();

// 🔐 Middleware to protect routes
function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) return next();
    res.redirect('/login');
}

// ✅ Create Board
router.post('/create', isLoggedIn, async (req, res) => {
    const { name, description } = req.body;
    const newBoard = new Board({
        name,
        description,
        userId: req.session.userId,
    });
    await newBoard.save();
    res.redirect('/boards/my');
});

// ✅ Show Boards of Logged-In User Only
router.get('/my', isLoggedIn, async (req, res) => {
    const boards = await Board.find({ userId: req.session.userId });
    res.render('dashboard', { boards });
});

module.exports = router;
