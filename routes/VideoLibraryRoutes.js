const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../db/Video'); // Adjust the path if necessary

const router = express.Router();
const upload = multer({ dest: 'uploads/videos/' }); // Destination for uploaded videos

// Video Library Endpoint
router.get('/video-library', async (req, res) => {
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

// Upload Video Endpoint
router.post('/upload-video', upload.fields([{ name: 'video' }, { name: 'poster' }]), async (req, res) => {
  const { title, session } = req.body;

  // Define the base path for videos
  const basePath = 'uploads/videos/';
  
  // Determine the upload directory
  let uploadDir = basePath;
  if (session) {
    uploadDir = path.join(basePath, session); // Create a subdirectory for the session
  }

  // Create the session directory if it doesn't exist
  if (session) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

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

  // Save video details to your database here (add your code for saving video metadata)
  const videoData = {
    title,
    path: videoPath.replace(/\\/g, '/'), // Ensure the path uses forward slashes
    poster: posterPath ? posterPath.replace(/\\/g, '/') : null,
    session: session || null, // Store the session name for reference
  };

  // Example saving logic - replace this with your actual save logic
  const newVideo = new Video(videoData);
  await newVideo.save();

  res.status(200).json({ message: 'Video uploaded successfully!', videoData });
});

// Export the router
module.exports = router;
