const express = require('express');

const router = express.Router();
const mm = require('music-metadata');
const multer = require('multer');
const fs = require('fs');
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');
const { ownMusic } = require('../../modules/verif');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `|-${req.user.userId}-|--${file.originalname}`);
  },
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
});

const upload = multer({ storage });

// Route pour upload les musiques et les remplacer/modifier
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const metadata = await mm.parseFile(`${req.file.path}`);

  const { originalname } = req.file;
  const { duration } = metadata.format;
  const { userId } = req.user;
  const fileName = `|-${userId}-|--${originalname}`;
  const title = originalname.substring(0, originalname.lastIndexOf('.'));

  const musicExists = await db('music').where('title', title).where('user_id', userId).first();

  const message = musicExists ? 'Successfully replaced file' : 'Successfully uploaded file';

  if (musicExists) {
    await db('music')
      .update({
        duration,
        uploaded: new Date(),
        file_name: fileName,
      })
      .where('title', title)
      .where('user_id', userId);

    return res.status(201).send({ message });
  }

  await db('music').insert({
    title,
    duration,
    user_id: userId,
    file_name: fileName,
  });

  return res.status(201).send({ message });
});

router.get('/', async (req, res) => {
  const { title } = req.query;
  const searchRelatedExist = await db('music').where('title', 'like', `%${title}%`);

  console.log(searchRelatedExist);

  if (!searchRelatedExist) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

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

  return res.status(201).send({ music });
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
