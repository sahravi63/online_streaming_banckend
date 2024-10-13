const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../db/Video'); // Assuming the video model is in models folder
const authenticateToken = require('../middleware/authenticateToken'); // Add your authentication middleware

const router = express.Router();
const upload = multer({ dest: 'uploads/videos/' }); // Destination for uploaded videos

// Upload Video Endpoint
router.post('/upload-video', authenticateToken, upload.fields([{ name: 'video' }, { name: 'poster' }]), async (req, res) => {
  const { title, session, price } = req.body; // Extract session and price from request body
  
  // Default to 'General' if no session is provided
  const videoSession = session ? session : 'General'; 

  // Define the base path for videos
  const basePath = 'uploads/videos/';

  // Create the upload directory for the session, or use the default
  const uploadDir = path.join(basePath, videoSession);
  fs.mkdirSync(uploadDir, { recursive: true });

  const videoFile = req.files.video[0];
  const posterFile = req.files.poster ? req.files.poster[0] : null;

  // Move video to the appropriate directory
  const videoPath = path.join(uploadDir, videoFile.originalname);
  fs.renameSync(videoFile.path, videoPath);

  let posterPath = null;
  if (posterFile) {
    // Move poster file if it exists
    posterPath = path.join(uploadDir, posterFile.originalname);
    fs.renameSync(posterFile.path, posterPath);
  }

  // Save video details to the database
  const videoData = new Video({
    title,
    path: videoPath.replace(/\\/g, '/'), // Ensure the path uses forward slashes
    poster: posterPath ? posterPath.replace(/\\/g, '/') : null,
    session: videoSession, // Set session to either provided or defaulted 'General'
    uploadedBy: req.user ? req.user._id : null, // Assuming user authentication
    price: price ? parseFloat(price) : 0, // Parse price, default to 0 if not provided
  });

  try {
    await videoData.save();
    res.status(200).json({ message: 'Video uploaded successfully!', videoData });
  } catch (err) {
    console.error('Error saving video:', err);
    res.status(500).json({ message: 'Error saving video' });
  }
});

// Video Library Endpoint (same as before)
router.get('/video-library', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user has an active subscription
    const currentDate = new Date();
    const subscription = user.subscriptions;

    if (!subscription || subscription.status !== 'Active' || subscription.endDate < currentDate) {
      return res.status(403).json({ message: 'Your subscription is inactive or has expired.' });
    }

    const videos = await Video.find({}).select('-__v'); // Exclude __v field

    if (!videos.length) {
      return res.status(404).json({ message: 'No videos found.' });
    }

    res.status(200).json({ videos, isSubscribed: true }); // Send subscription status
  } catch (error) {
    console.error('Error fetching video library:', error);
    res.status(500).json({ message: 'Error fetching video library', error: error.message });
  }
});

module.exports = router;
