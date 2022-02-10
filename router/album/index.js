const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

// TODO à tester
router.post('/', authMiddleware, async (req, res) => {
  const {
    //
    name,
    genre,
    musicLabel,
    releaseDate,
    musicIds, // [] = list des id des musiques à update
  } = req.body;

  const albumExist = await db('album').where('name', name).first();

  if (albumExist) return res.status(409).send({ message: 'un album ayant ce nom existe déjà' });

  const albumId = await db('album').insert({
    name,
    genre,
    musicLabel,
    releaseDate,
  });

  let whereId;
  const lenght = musicIds.lenght();

  if (lenght > 1) {
    for (let i = 0; i < lenght; i += 1) {
      whereId += `OR WHERE id = ${musicIds[i]}`;
    }
  } else {
    whereId = `WHERE id = ${musicIds[0]}`;
  }

  await db.raw(`UPDATE music SET album_id = ${albumId} ${whereId}`);

  return res.status(201).send({ created: true });
});

// TODO à tester
// TODO à finir
router.get('/', async (req, res) => {
  const { name } = req.query;
  const searchRelatedExist = await db('album').where('name', 'like', `%${name}%`);

  if (!searchRelatedExist) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  return res.status(201).send(searchRelatedExist);
});

// obtient une musique selon son id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const music = await db('music').where('id', id).first();

  if (!music) {
    return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });
  }

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
