// models/Pin.js
const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Pin', pinSchema);
