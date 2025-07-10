const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Pin = require('../models/Pin'); // Use the model here

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });

// Auth middleware
function isLoggedIn(req, res, next) {
  if (req.user || req.session.userId) return next();
  return res.status(401).send('Unauthorized');
}

// Upload route
router.post('/upload', isLoggedIn, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const newPin = new Pin({
      title,
      description,
      image: '/uploads/' + req.file.filename,
      userId: req.user?._id || req.session.userId
    });

    await newPin.save();

    return res.status(200).json({
      success: true,
      message: 'Pin uploaded',
      pin: newPin
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete route
router.post('/delete/:id', async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).send('Pin not found');

    const imagePath = path.join(__dirname, '..', 'public', pin.image);
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Failed to delete image:', err);
    });

    await Pin.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
