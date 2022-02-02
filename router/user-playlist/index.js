const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

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
  const playlist = await db('users_playlists') //
    .join('playlist', 'users_playlists.playlist_id', 'playlist.id')
    .where('id', req.user.userId);

  return res.status(200).send({ playlist });
});

// Route pour obtenir les informations d'une playlist selon son id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const playlist = await db('playlist').where('id', id).first();

  if (!playlist) return res.status(404).send({ message: 'Playlist inexistante' });

  return res.status(200).json(playlist);
});

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
