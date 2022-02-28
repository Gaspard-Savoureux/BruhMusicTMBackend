const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

// Route pour ajouter une musique dans favorite
router.post('/', authMiddleware, async (req, res) => {
  const { musicId } = req.query;
  const { favoriteId } = req.user;

  const musicExist = await db('music').where('id', musicId).first();
  if (!musicExist) return res.status(404).json({ message: 'musique inexistante' });

  const entryExist = await db('playlists_music') //
    .where('music_id', musicId)
    .where('playlist_id', favoriteId)
    .first();
  if (entryExist) return res.status(409).json({ message: 'music déjà dans playlists' });

  await db('playlists_music').insert({
    //
    music_id: musicId,
    playlist_id: favoriteId,
  });

  return res.status(200).json({ added: true });
});

// Route toute les musiques favorites d'un utilisateur authentifier
router.get('/', authMiddleware, async (req, res) => {
  const { favoriteId } = req.user;

  const playlist = await db('playlists_music') //
    .select('music.*', 'playlists_music.*', 'user.username')
    .join('music', 'playlists_music.music_id', 'music.id')
    .join('user', 'user.id', 'music.user_id')
    .where('playlists_music.playlist_id', favoriteId);

  return res.status(200).json(playlist);
});

// efface une musique des favoris selon son id
router.delete('/', authMiddleware, async (req, res) => {
  const { musicId } = req.query;
  const { favoriteId } = req.user;

  const musicInPlaylist = await db('playlists_music') //
    .where('music_id', musicId)
    .where('playlist_id', favoriteId)
    .first();
  if (!musicInPlaylist) return res.status(404).json({ message: 'music non présente dans les favoris' });

  await db.raw(`
    DELETE FROM playlists_music
    WHERE playlist_id = ${favoriteId} AND music_id = ${musicId}
  `);

  return res.status(200).send({ deleted: true });
});

module.exports = router;
