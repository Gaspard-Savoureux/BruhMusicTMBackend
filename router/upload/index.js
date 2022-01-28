const express = require('express');

const router = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log('filename');
    cb(null, file.originalname);
  },
  destination: (req, file, cb) => {
    console.log('storage');
    cb(null, 'uploads');
  },
});

const upload = multer({ storage });
router.post('/', upload.single('file'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.status(201).send({ message: 'Successfully uploaded files' });
});

module.exports = router;
