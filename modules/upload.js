const multer = require('multer');

const audioTypes = /flac|wav/;
const imageTypes = /|jpeg|jpg|png|gif/;
const fileTypes = /flac|wav|jpeg|jpg|png|gif/;

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    let filename;
    console.log(req);
    if (audioTypes.test(file.mimetype)) filename = `|-${req.user.userId}-|--${file.originalname}`;
    if (imageTypes.test(file.mimetype) && req.path === '/profileImage') {
      filename = `++${req.user.userId}++--${file.originalname}`;
    } else if (imageTypes.test(file.mimetype) && req.baseUrl === '/cover') {
      filename = `+-+${req.user.userId}+-+--${file.originalname}`;
    } else if (imageTypes.test(file.mimetype)) {
      filename = `+-${req.user.userId}-+--${file.originalname}`;
    }

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
