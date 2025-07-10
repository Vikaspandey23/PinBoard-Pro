   const mongoose = require('mongoose');

   const boardSchema = new mongoose.Schema({
       name: { type: String, required: true },
       description: String,
       userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       coverPhoto: String,
       isPrivate: { type: Boolean, default: false },
       pins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pin' }],
       createdAt: { type: Date, default: Date.now },
   });

   module.exports = mongoose.model('Board', boardSchema);
   