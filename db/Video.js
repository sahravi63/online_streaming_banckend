const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true },
  price: { type: Number, required: false }, // Price in currency units
  discount: { type: Number, default: 0 }, // Discount as a percentage (e.g., 10 for 10%)
  finalPrice: { type: Number, required: false },
  poster: { type: String },
  session: { type: String, default: 'General' }, // Default to 'General' if no session provided
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
