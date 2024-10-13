const mongoose = require('mongoose');

// Define the Video sub-schema (used within the Session schema)
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true },
  price: { type: Number, required: false }, // Price in currency units
  discount: { type: Number, default: 0 }, // Discount as a percentage (e.g., 10 for 10%)
  finalPrice: { type: Number, required: false }, // Final price after applying discount
  poster: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
}, { timestamps: true });

// Pre-save middleware to calculate finalPrice based on price and discount
videoSchema.pre('save', function (next) {
  if (this.price) {
    this.finalPrice = this.price - (this.price * (this.discount / 100));
  }
  next();
});

// Define the Session schema, embedding the Video schema
const sessionSchema = new mongoose.Schema({
  sessionName: { type: String, default: 'General' }, // If no session provided, default to 'General'
  videos: [videoSchema], // Array of video objects using the videoSchema
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
