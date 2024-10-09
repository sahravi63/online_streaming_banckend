// routes/video.js
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
  const { title, session } = req.body;

  // Define the base path for videos
  const basePath = 'uploads/videos/';

  // Create the upload directory
  const uploadDir = session ? path.join(basePath, session) : basePath;
  fs.mkdirSync(uploadDir, { recursive: true });

  const videoFile = req.files.video[0];
  const posterFile = req.files.poster ? req.files.poster[0] : null;

  // Move video to the appropriate directory
  const videoPath = path.join(uploadDir, videoFile.originalname);
  fs.renameSync(videoFile.path, videoPath); // Move the uploaded video file

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
    sessions: session ? [session] : [], // Store session names in an array
    uploadedBy: req.user ? req.user._id : null, // Assuming you have user authentication
  });

  try {
    await videoData.save();
    res.status(200).json({ message: 'Video uploaded successfully!', videoData });
  } catch (err) {
    console.error('Error saving video:', err);
    res.status(500).json({ message: 'Error saving video' });
  }
});


// Video Library Endpoint
router.get('/video-library', authenticateToken, async (req, res) => {
  try {
    const videos = await Video.find({}).select('-__v'); // Exclude the __v field from the response

    if (!videos.length) {
      return res.status(404).json({ message: 'No videos found.' });
    }

    res.status(200).json(videos); // Return the video library
  } catch (error) {
    console.error('Error fetching video library:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error fetching video library', error: error.message });
  }
});

module.exports = router;
