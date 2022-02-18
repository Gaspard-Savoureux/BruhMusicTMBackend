const express = require('express');

const router = express.Router();
const mm = require('music-metadata');
const multer = require('multer');
const fs = require('fs');
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');
const { upload } = require('../../modules/upload');
const { ownMusic } = require('../../modules/verif');

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     cb(null, `|-${req.user.userId}-|--${file.originalname}`);
//   },
//   destination: (req, file, cb) => {
//     cb(null, 'public/uploads');
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const fileTypes = /flac|wav/;
//   const mimetype = fileTypes.test(file.mimetype);
//   if (mimetype) return cb(null, true);
//   cb(null, false);
//   return cb(new Error('INVALID_TYPE'));
// };

// const upload = multer({ storage, fileFilter });

// Route pour upload les musiques et les remplacer/modifier
router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    const { files } = req;
    const music = files.music[0];
    const image = files.image[0];
    const metadata = await mm.parseFile(`${music.path}`);

    const { originalname } = music;
    const { duration } = metadata.format;
    const { userId } = req.user;
    const fileName = `|-${userId}-|--${originalname}`;
    const title = originalname.substring(0, originalname.lastIndexOf('.'));

    const musicExists = await db('music').where('title', title).where('user_id', userId).first();

    const message = musicExists ? 'Successfully replaced file' : 'Successfully uploaded file';

    // Query initial
    let query = {
      //
      title,
      duration,
      user_id: userId,
      file_name: fileName,
    };

    // Query si aucun photo donnée
    if (image.filename) query = { ...query, image: image.filename };

    if (musicExists) {
      await db('music').update(query).where('title', title).where('user_id', userId);

      return res.status(201).send({ message });
    }

    await db('music').insert({
      ...query,
      uploaded: new Date(),
    });

    return res.status(201).send({ message });
  },
);

router.get('/', async (req, res) => {
  const { title } = req.query;
  const searchRelatedExist = await db('music').where('title', 'like', `%${title}%`);

  return res.status(201).send(searchRelatedExist);
});

// obtient une musique selon son id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const music = await db('music').where('id', id).first();

  if (!music) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  return res.status(201).send({ music });
});

// obtient toute les chansons liées à un user selon son id.
// si aucun id ne lui est données renvoi les chansons liées à son propres id
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params.userId ? req.params : req.user.userId;

  const music = await db('music').where('user_id', userId);

  if (!music) {
    return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });
  }

  return res.status(201).json(music);
});

// supprime une chanson en prenant son id comme paramètre
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const music = await db('music').where('id', id).first();

  const { status, message } = await ownMusic(id, req.user.userId);
  if (status) return res.status(status).send({ message });

  await db('music').where('id', id).del();

  fs.unlink(`public/uploads/${music.file_name}`, (err) => {
    if (err) {
      throw err;
    }

    console.log('File is deleted.');
  });
  return res.status(200).send({ deleted: true });
});

module.exports = router;
