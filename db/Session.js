const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Session name (e.g., "Math Session 1")
  price: { type: Number, required: true }, // Price for the entire session
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }], // Array of video IDs
  discount: { type: Number, default: 0 }, // Optional discount for the session
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
