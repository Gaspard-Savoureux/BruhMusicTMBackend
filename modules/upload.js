const multer = require('multer');

const audioTypes = /flac|wav/;
const fileTypes = /flac|wav|jpeg|jpg|png|gif/;

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(req, file);
    const filename = audioTypes.test(file.mimetype) ? `|-${req.user.userId}-|--${file.originalname}` : `+-${req.user.userId}-+--${file.originalname}`;
    cb(null, filename);
  },
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
});

const fileFilter = (req, file, cb) => {
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype) return cb(null, true);
  cb(null, false);
  return cb(new Error('INVALID_TYPE'));
};
module.exports = {
  upload: multer({ storage, fileFilter }),
};
