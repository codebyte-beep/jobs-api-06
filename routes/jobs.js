const express = require('express')
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const path = require('path');
const router = express.Router()
const {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  uploadResume,
  downloadResume,
  getApplyJobs
} = require('../controllers/jobs')

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      filename: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`,
      bucketName: 'uploads', // The collection where files will be stored
    };
  },
});

const upload = multer({ storage: storage });

router.route('/').post(createJob).get(getAllJobs)

router.route('/apply-jobs').get(getApplyJobs);
router.route('/:id').get(getJob).delete(deleteJob).patch(updateJob)


// Route for uploading a resume
router.route('/:id/upload').post(upload.single('resume'), uploadResume);

// Route for downloading a resume
router.route('/:id/download').get(downloadResume);

module.exports = router