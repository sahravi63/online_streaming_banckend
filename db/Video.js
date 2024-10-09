const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true },
  poster: { type: String },
  session: { type: String, default: 'General' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If you have user authentication
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
