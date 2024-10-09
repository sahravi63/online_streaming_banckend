const express = require('express');
const Session = require('../models/Session'); // Import the Session model
const Video = require('../models/Video'); // Import the Video model
const authenticateToken = require('../middleware/authenticateToken'); // Authentication middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/videos/' }); // Destination for uploaded videos

// Create Session
router.post('/create-session', authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    const newSession = new Session({ title });
    await newSession.save();
    res.status(200).json({ message: 'Session created successfully!', newSession });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
});

// Upload Video to Session
router.post('/upload-session-video/:sessionId', authenticateToken, upload.fields([{ name: 'video' }, { name: 'poster' }]), async (req, res) => {
  const { title } = req.body;
  const sessionId = req.params.sessionId;

  try {
    // Move video to the appropriate directory
    const videoFile = req.files.video[0];
    const uploadDir = path.join('uploads/videos/', sessionId);
    fs.mkdirSync(uploadDir, { recursive: true });

    const videoPath = path.join(uploadDir, videoFile.originalname);
    fs.renameSync(videoFile.path, videoPath);

    let posterPath = null;
    if (req.files.poster) {
      const posterFile = req.files.poster[0];
      posterPath = path.join(uploadDir, posterFile.originalname);
      fs.renameSync(posterFile.path, posterPath);
    }

    // Create a new video entry
    const videoData = new Video({
      title,
      path: videoPath.replace(/\\/g, '/'), // Use forward slashes
      poster: posterPath ? posterPath.replace(/\\/g, '/') : null,
      uploadedBy: req.user._id, // Assuming you have user authentication
      session: sessionId, // Associate the video with the session
    });

    await videoData.save();

    // Add video to session's videos array
    await Session.findByIdAndUpdate(sessionId, { $push: { videos: videoData._id } });

    res.status(200).json({ message: 'Video uploaded successfully!', videoData });
  } catch (error) {
    res.status(500).json({ message: 'Error saving session video', error: error.message });
  }
});

module.exports = router;
