const Job = require('../models/Job')
const mongoose = require('mongoose');
const archiver = require('archiver')
const JobApplication = require('../models/JobApplication');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Grid = require('gridfs-stream');

let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Upload Resume

const getApplyJobs = async (req, res) => {
  console.log("hey")
  try {
    const jobs = await Job.find({}).sort('createdAt'); // Get all jobs, no user filter
    res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error fetching jobs' });
  }
};


const uploadResume = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  
  // Validate job existence
  const job = await Job.findOne({ _id: jobId});
  if (!job) {
    console.log("lund mera mc");
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  // Create a job application record with GridFS file ID
  const jobApplication = await JobApplication.create({
    user: userId,
    job: jobId,
    resume: req.file.id, // Store the GridFS file ID
  });

  res.status(StatusCodes.CREATED).json({ jobApplication });
};


const downloadResume = async (req, res) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  
  // Find all job applications for the specified job
  const jobApplications = await JobApplication.find({ job: jobId});
  
  if (!jobApplications || jobApplications.length === 0) {
    console.log("what the af is shit");
    throw new NotFoundError(`No job applications found for job with id ${jobId}`);
  }

  // Create a zip stream
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('resumes.zip');
  archive.pipe(res);

  for (const application of jobApplications) {
    const fileId = application.resume;

    const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) });

    if (!file || file.length === 0) {
      continue; // Skip if the file doesn't exist
    }

    const readstream = gfs.createReadStream(file._id);
    archive.append(readstream, { name: file.filename });
  }

  archive.finalize();
};





const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt')
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length })
}
const getJob = async (req, res) => {
  console.log("getJOOOb")
  console.log(req.params);
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  uploadResume,
  downloadResume,
  getApplyJobs
}