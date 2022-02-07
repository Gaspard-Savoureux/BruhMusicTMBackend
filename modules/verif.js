const db = require('./db');

module.exports = {
  // fonction vérifiant si un user possède une playlist et si celle-ci existe
  async ownPlaylist(userId) {
    let status;
    let message;

    const cible = await db('playlist') //
      .join('users_playlists', 'playlist.id', 'users_playlists.playlist_id')
      .where('playlist.id', userId)
      .first();

    if (!cible) {
      status = 404;
      message = 'Playlist introuvable';
      return { status, message };
    }

    if (userId !== cible.user_id) return { status: 401, message: 'Pas les permissions pour accéder à cette playlist' };
    return { status, message };
  },
  // verif pour post dans playlists-music
  async playlistsMusic(playlistId, musicId, userId) {
    const playlistExist = await db('playlist').where('id', playlistId).first();

    const musicExist = await db('music').where('id', musicId).first();

    const alreadyInPlaylist = await db('playlists_music') //
      .where('music_id', musicId)
      .where('playlist_id', playlistId)
      .first();

    const goodUser = await db('playlist') //
      .join('users_playlists', 'playlist.id', 'users_playlists.playlist_id')
      .where('playlist.id', playlistId)
      .first();

    if (!playlistExist || !musicExist) {
      const message = playlistExist ? 'playlist introuvable' : 'musique introuvable';
      return { status: 404, message };
    }

    if (userId !== goodUser.user_id) return { status: 401, message: 'Pas les permissions pour ajouter une musique à cette playlist' };

    if (alreadyInPlaylist) return { status: 409, message: 'musique déjà existante dans la playlist' };

    return null;
  },

  // fonction vérifiant si un user possède une musique et si celle-ci existe
  async ownMusic(id, userId) {
    let status;
    let message;

    const cible = await db('music').where('id', id).first();

    if (!cible) {
      status = 404;
      message = 'musique introuvable';
      return { status, message };
    }

    if (userId !== cible.user_id) return { status: 401, message: 'Pas les permissions pour obtenir accéder à cette playlist' };
    return { status, message };
  },
};
