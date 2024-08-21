const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
      console.log("File received:", file);
      return {
        filename: `${Date.now()}-${file.originalname}`,
        bucketName: 'resumes',
      };
    },
  });

const upload = multer({
    storage,
    onError: (err, req, res, next) => {
      console.error('Error during file upload:', err);
      res.status(500).json({ msg: 'Error during file upload', error: err });
    }
  });


module.exports = upload;


