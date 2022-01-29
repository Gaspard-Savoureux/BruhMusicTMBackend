const express = require('express');
const multer = require('multer');
const db = require('../../modules/db');

const router = express.Router();

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  destination: (req, file, cb) => {
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
