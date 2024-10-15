const express = require('express');
const multer = require('multer');
const path = require('path');
const TutorialStep = require('../db/TutorialStep'); // Adjust the path to your model

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tutorials'); // Set destination to 'uploads/tutorials' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`); // Example: media-123456789.mp4
  },
});

const upload = multer({ storage });

const { body, validationResult } = require('express-validator');

// Add MCQs to a Tutorial Step
router.post('/tutorial/:id/add-mcq', async (req, res) => {
  const { id } = req.params;
  const { question, options, correctAnswer, duration } = req.body;

  try {
    const tutorialStep = await TutorialStep.findById(id);
    if (!tutorialStep) {
      return res.status(404).json({ message: 'Tutorial step not found' });
    }

    const mcq = { question, options, correctAnswer };
    tutorialStep.mcqs.push(mcq);
    tutorialStep.duration = duration; // Set the time to unlock answers
    await tutorialStep.save();

    res.status(201).json({ message: 'MCQ added successfully', tutorialStep });
  } catch (error) {
    res.status(500).json({ message: 'Error adding MCQ', error });
  }
});


// Upload Meditation Tutorial Step (Local File Storage)
router.post('/upload-tutorial', 
  upload.single('media'), 
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('order').isInt().withMessage('Order must be an integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, order } = req.body;

    // Create a new tutorial step with local media file path
    const tutorialStep = new TutorialStep({
      title,
      description,
      mediaUrl: req.file ? req.file.path : null, // Store the local file path
      order,
    });

    try {
      await tutorialStep.save();
      res.status(201).json({ message: 'Tutorial step uploaded successfully', tutorialStep });
    } catch (error) {
      console.error('Error saving tutorial step:', error);
      res.status(500).json({ message: 'Error saving tutorial step', error });
    }
});


// Get all Tutorial Steps
router.get('/tutorial-steps', async (req, res) => {
  try {
    const steps = await TutorialStep.find({}).sort({ order: 1 });
    
    // Respond with the tutorial steps
    res.json(steps);
  } catch (error) {
    console.error('Error fetching tutorial steps:', error);
    res.status(500).json({ message: 'Error fetching tutorial steps' });
  }
});

// Submit Answers and Calculate Score
router.post('/tutorial/:id/submit-answers', async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body; // Array of user's answers
  const userId = req.user._id;  // Assume authentication middleware provides user ID

  try {
    const tutorialStep = await TutorialStep.findById(id);
    if (!tutorialStep) {
      return res.status(404).json({ message: 'Tutorial step not found' });
    }

    // Only allow answers to be revealed after task time (duration) has passed
    const now = new Date();
    const taskEndTime = new Date(tutorialStep.createdAt.getTime() + tutorialStep.duration * 60000);
    if (now < taskEndTime) {
      return res.status(403).json({ message: 'You cannot view the answers yet. Please wait until the time is up.' });
    }

    // Calculate the score
    let score = 0;
    tutorialStep.mcqs.forEach((mcq, index) => {
      if (answers[index] === mcq.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = tutorialStep.mcqs.length;
    const percentage = (score / totalQuestions) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    // Return score and appreciation message
    res.status(200).json({ score, totalQuestions, grade, message: `Well done! You scored ${score} out of ${totalQuestions}. Your grade is ${grade}.` });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting answers', error });
  }
});


module.exports = router;
