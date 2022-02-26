const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');
const { playlistsMusic } = require('../../modules/verif');

// Ajoute une musique à une playlist
router.post('/', authMiddleware, async (req, res) => {
  const { playlistId, musicId } = req.body;

  const { status, message } = await playlistsMusic(playlistId, musicId, req.user.userId);
  if (status) return res.status(status).send({ message });

  await db('playlists_music').insert({ playlist_id: playlistId, music_id: musicId });

  return res.status(201).json({ added: true });
});

// Route pour obtenir toute les musiques d'une playlist
router.get('/:playlistId', async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await db('playlists_music') //
    .join('playlist', 'playlists_music.playlist_id', 'playlist.id')
    .join('music', 'playlists_music.music_id', 'music.id')
    .where('playlist.id', playlistId);

  if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

  return res.status(200).json(playlist);
});

// Ajoute une musique à une playlist
router.delete('/', authMiddleware, async (req, res) => {
  const { playlistId, musicId } = req.body;

  // vérifie si la playlist existe
  const playlistExist = await db('playlist').where('id', playlistId).first();
  const inPlaylist = await db('playlists_music') //
    .where('music_id', musicId)
    .where('playlist_id', playlistId)
    .first();

  if (!playlistExist) return res.status(404).json({ message: 'une playlist porte déjà ce nom' });
  if (!inPlaylist) return res.status(404).json({ message: "La musique n'est pas dans cette playlist" });

  await db('playlists_music') //
    .where('playlist_id', playlistId)
    .where('music_id', musicId)
    .del();

  return res.status(200).json({ deleted: true });
});

// pour pour obtenir une playlist selon son id
// TODO à compléter
router.get('/:id', async (req, res) => {
  const { id } = req.params;

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

// Route pour supprimer une playlistsMusic
// TODO à revérifier
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
