const express = require('express');
const fs = require('fs');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

// Route pour ajouter un album.
router.post('/', authMiddleware, async (req, res) => {
  const {
    //
    name,
    genre,
    releaseDate,
    musicIds, // [] = list des id des musiques à update
  } = req.body;

  const albumExist = await db('album').where('name', name).first();

  // vérification
  if (albumExist) return res.status(409).send({ message: 'un album ayant ce nom existe déjà' });
  if (musicIds.length === 0) return res.status(400).send({ message: 'aucun id de music fournis' });

  const albumId = await db('album').insert({
    name,
    genre,
    release_date: releaseDate,
    user_id: req.user.userId,
  });

  // concatene les requestes de WHERE id pour éviter différente request(pour optimiser en gros).
  let whereId = '';
  musicIds.forEach((id) => {
    whereId += id === musicIds[0] ? `WHERE id = ${id} ` : `OR id = ${id} `;
  });

  await db.raw(`UPDATE music SET album_id = ${albumId} ${whereId}`);

  return res.status(201).send({ created: true });
});

// Route retournant les albums correspondants à un nom donné.
router.get('/', async (req, res) => {
  const { name } = req.query;
  const searchRelatedExist = await db('album').where('name', 'like', `%${name}%`);
  if (!name) {
    const topAlbum = await db('album').orderBy('consulted').limit(20);
    return res.status(200).json(topAlbum);
  }
  return res.status(200).json(searchRelatedExist);
});

// Route retournant les informations d'un album ainsi
// que son contenu correspondant selon le id fournis.
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const album = await db('album').where('id', id).first();
  if (!album) return res.status(404).send({ message: "Aucun album ne correspond à l'id donné" });

  console.log(album);
  const musicList = await db('music').where('album_id', id);
  if (musicList.length === 0) return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });

  const infoAlbum = { ...album, musicList };
  console.log(infoAlbum);

  return res.status(200).json(infoAlbum);
});

// obtient toute les albums liées à un user selon son id.
// si aucun id ne lui est données renvoi les albums liées à son propres id
router.get('/user/:userId', authMiddleware, async (req, res) => {
  // const { userId } = req.params.userId ? req.params : req.user.userId;
  const userId = parseInt(req.params.userId, 10);
  const id = userId === 0 ? req.user.userId : userId;

  const album = await db('album').where('user_id', id);
  if (!album) return res.status(404).send({ message: "Aucun album ne correspond à l'id donné" });

  return res.status(200).json(album);
});

// supprime une chanson en prenant son id comme paramètre
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const album = await db('album').where('id', id).first();

  if (!album) return res.status(404).send({ message: 'album inexistant' });
  if (req.user.userId !== album.user_id) return res.status(401).send({ message: 'ne possède pas les permissions pour supprimer cet album' });

  await db('album').where('id', id).del();

  await db('music').update('album_id', null).where('id', id);

  fs.unlink(`public/uploads/${album.cover}`, (err) => {
    if (err) {
      throw err;
    }

    console.log('File is deleted.');
  });

  return res.status(200).send({ deleted: true });
});

module.exports = router;
