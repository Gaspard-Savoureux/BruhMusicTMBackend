const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');
const { ownPlaylist } = require('../../modules/verif');

// Route pour crée une playlist
router.post('/', authMiddleware, async (req, res) => {
  const { name, description } = req.body;

  const playlistExist = await db('playlist').where('name', name).first();

  if (playlistExist) return res.status(409).json({ message: 'une playlist porte déjà ce nom' });

  const playlistId = await db('playlist').insert({ name, description });

  await db('users_playlists').insert({ user_id: req.user.userId, playlist_id: playlistId });

  return res.status(201).json({ created: true });
});

// Route pour obtenir toute les playlists de l'utilisateur fesant la demande
router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req.user.userId ? req.user : req.query;

  const playlist = await db('users_playlists') //
    .join('playlist', 'users_playlists.playlist_id', 'playlist.id')
    .where('users_playlists.user_id', userId);

  return res.status(200).json(playlist);
});

// Route pour obtenir les informations d'une playlist selon son id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const playlist = await db('playlist').where('id', id).first();

  if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

  return res.status(200).json(playlist);
});

// efface playlist selon son id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { status, message } = ownPlaylist(req.user.userId);
  if (status) return res.status(status).send({ message });

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
