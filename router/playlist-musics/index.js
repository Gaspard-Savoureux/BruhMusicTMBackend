const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

// Ajoute une musique à une playlist
// TODO à tester
router.post('/', authMiddleware, async (req, res) => {
  const { playlistId, musicId } = req.body;

  // vérifie si la playlist à ajouter existe
  const playlistExist = await db('playlist').where('id', playlistId).first();
  const musicExist = await db('music').where('id', musicId).first();
  const alreadyInPlaylist = await db('playlists_music') //
    .where('id', musicId)
    .where('id', playlistId);

  if (!playlistExist) return res.status(404).json({ message: 'une playlist porte déjà ce nom' });
  if (!musicExist) return res.status(404).json({ message: 'une playlist porte déjà ce nom' });
  if (alreadyInPlaylist) return res.status(409).json({ message: 'La musique existe déjà dans cette playlist' });

  await db('userplaylists_music').insert({ playlistId, musicExist });

  return res.status(201).json({ created: true });
});

// Route pour obtenir toute les musiques d'une playlist
// TODO tester
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const playlist = await db('playlists_music') //
    .join('playlist', 'playlists_music.playlist_id', 'playlist.id')
    .where('id', id);

  if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

  return res.status(200).send({ playlist });
});

router.get('/', async (req, res) => {
  const { userId } = req.query.userId ? req.query.userId : req.user.userId;

  const playlist = await db('playlists_music') //
    .join('playlist', 'playlists_music.playlist_id', 'playlist.id')
    .where('id', id);

  if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

  return res.status(200).send({ playlist });
});

// Route pour obtenir les informations d'une playlist selon son id
// TODO mettre la fonction en dessu dans users-playlists
// router.get('/playlist', authMiddleware, async (req, res) => {
//   const { userId } = req.user.userId ? req.user.userId : req.query.userId;

//  const playlist = await db('playlists_music') //
//     .join('playlist', 'playlists_music.playlist_id', 'playlist.id')
//     .where('id', id);

//   if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

//   return res.status(200).json(playlist);
// });

// obtient toute les playlists liées à un user selon son id.
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const playlist = await db('users_playlists') //
    .join('playlist', 'users_playlists.playlist_id', 'playlist.id')
    .where('id', userId);

  return res.status(200).send({ playlist });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const playlist = await db('playlist') //
    .join('users_playlists', 'playlist.id', 'users_playlists.playlist_id')
    .where('playlist.id', id)
    .first();

  if (!playlist) return res.status(404).send({ deleted: 'non existant' });
  if (req.user.userId !== playlist.user_id) return res.status(401).send({ msg: 'Pas les permissions nécessaire pour supprimer cette musique' });

  await db.raw(`
    DELETE playlist,
    users_playlists
    FROM playlist
    INNER JOIN users_playlists ON users_playlists.playlist_id
    where playlist.id = ${id}
  `);

  return res.status(200).send({ deleted: true });
});

module.exports = router;
