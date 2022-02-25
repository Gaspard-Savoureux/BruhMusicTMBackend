const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const { upload } = require('../../modules/upload');
const db = require('../../modules/db');

// TODO ajouter les vérifications au routes
// Genre les shits des erreurs 400, quoi que optionnel

router.post('/', authMiddleware, async (req, res) => {
  const {
    //
    name,
    genre,
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

  await db.raw(`UPDATE music SET album_id = ${albumId} ${whereId}`);

  return res.status(201).send({ created: true });
});

// Route retournant les albums correspondant à un nom donné
router.get('/', async (req, res) => {
  const { name } = req.query;
  const searchRelatedExist = await db('album').where('name', 'like', `%${name}%`);
  if (!name) {
    const topAlbum = await db('album').orderBy('consulted').limit(20);
    return res.status(200).send(topAlbum);
  }
  return res.status(200).send(searchRelatedExist);
});

// Route retournant les information d'un album ainsi que son contenu correspondant au id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const album = await db('album').where('id', id);
  if (!album) return res.status(404).send({ message: "Aucun album ne correspond à l'id donné" });

  const musicList = await db('music').where('album_id', id);
  if (musicList.length === 0) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  const infoAlbum = { ...album, musicList };

  return res.status(200).send({ infoAlbum });
});

// obtient toute les albums liées à un user selon son id.
// si aucun id ne lui est données renvoi les albums liées à son propres id
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params.userId ? req.params : req.user.userId;

  const album = await db('album').where('user_id', userId);
  if (!album) return res.status(404).send({ message: "Aucun album ne correspond à l'id donné" });

  return res.status(200).json(album);
});

//TODO finish this atrocity
router.put('/cover/', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  if (!req.files.image) return res.status(400).json({ message: 'aucune image fournis' });
  const file = req.files.image[0];
  const { originalname } = file;
  const { userId } = req.user;
  const image = `+-${userId}-+--${originalname}`;

  await db('album').update({ image }).where('id', userId);
  return res.status(200).json({ modified: true });
});

// supprime une chanson en prenant son id comme paramètre
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const album = await db('album').where('id', id).first();

  if (!album) return res.status(404).send({ message: 'album inexistant' });
  if (req.user.userId !== album.user_id) return res.status(401).send({ message: 'ne possède pas les permissions pour supprimer cet album' });

  await db('album').where('id', id).del();

  await db('music').update('album_id', null).where('id', id);

  return res.status(200).send({ deleted: true });
});

module.exports = router;
