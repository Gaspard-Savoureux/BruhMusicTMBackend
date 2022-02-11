const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

// TODO ajouter les vérifications au routes

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
  if (musicIds.length === 0) return res.status(400).send({ message: 'aucun id de music fournis' });

  const albumId = await db('album').insert({
    name,
    genre,
    release_date: releaseDate,
    user_id: req.user.userId,
  });

  let whereId = '';

  musicIds.forEach((id) => {
    whereId += id === musicIds[0] ? `WHERE id = ${id} ` : `OR id = ${id} `;
  });

  console.log(whereId);
  await db.raw(`UPDATE music SET album_id = ${albumId} ${whereId}`);

  return res.status(201).send({ created: true });
});

// Route retournant les albums correspondant à un nom donné
router.get('/', async (req, res) => {
  const { name } = req.query;
  const searchRelatedExist = await db('album').where('name', 'like', `%${name}%`);

  if (searchRelatedExist.length === 0) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  return res.status(200).send(searchRelatedExist);
});

// Route retournant les information d'un album ainsi que son contenu correspondant au id
// TODO à terminer
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const album = await db('album').where('id', id);
  if (!album) return res.status(404).send({ message: "Aucun album ne correspond à l'id donné" });

  const musicList = await db('music').where('album_id', id);
  if (musicIds.length === 0) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  const infoAlbum = { ...album, musicList };

  return res.status(200).send({ infoAlbum });
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
