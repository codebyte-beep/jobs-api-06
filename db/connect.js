const mongoose = require('mongoose')
const Grid = require('gridfs-stream');
const connectDB = async (url) => {
  const conn = await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Initialize GridFS
  const gfs = Grid(conn.connection.db, mongoose.mongo);
  gfs.collection('uploads'); // The collection name for storing files

  return conn;
}

module.exports = connectDB