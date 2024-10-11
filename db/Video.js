const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true },
  poster: { type: String },
  session: { type: String, default: 'General' }, // Default to 'General' if no session provided
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
