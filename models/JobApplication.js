const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  resume: {
    type: String, // This will store the filename or full URL of the resume file
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
