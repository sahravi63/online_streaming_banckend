const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct answer
});

const tutorialStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  mediaUrl: { type: String }, // Store file path here
  order: { type: Number, required: true },
  mcqs: [mcqSchema], // Add array of MCQs for each step
  duration: { type: Number }, // Duration to unlock answers
});

module.exports = mongoose.model('TutorialStep', tutorialStepSchema);
