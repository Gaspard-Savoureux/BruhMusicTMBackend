const express = require('express');

const router = express.Router();
const mm = require('music-metadata');
const multer = require('multer');

const db = require('../../modules/db');

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
  console.log(req.file);

  const metadata = await mm.parseFile(`${req.file.path}`);
  const { duration } = metadata.format;

  await db('music').insert({
    title: req.file.originalname,
    duration,
  });

  res.status(201).send({ message: 'Successfully uploaded files' });
});

module.exports = router;
