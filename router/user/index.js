const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../modules/db');

const { upload } = require('../../modules/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  const { userId } = req.query.id ? req.query : req.user;

  if (!userId) return res.status(404).json({ msg: 'aucun idée fourni et non authentifier' });

  const user = await db('user').where('id', userId).first();
  delete user.password;
  return res.status(200).json(user);
});

router.put('/', async (req, res) => {
  const { newEmail, newPassword, newUsername } = req.body;
  const id = req.user.userId;

  // Vérifie si le user exist toujours et vérifie l'existance du username et du email d'un user
  const userExist = await db('user').where('id', id).first();
  const userEmail = newEmail ? await db('user').where('email', newEmail).first() : null;
  const usernameExist = newUsername ? await db('user').where('username', newUsername).first() : null;

  // retourne erreur 404 si l'utilisateur est inexistant
  if (!userExist) {
    return res.status(404).json({ message: 'utilisateur non-existant' });
  }
  // retourne erreur 409 si le email exist déjà ou si le email donner est celui du user
  if (userEmail && userEmail.id !== Number(id)) {
    return res.status(409).json({ message: 'Courriel déjà existant' });
  }
  // retourne une erreur 409 si le username est déjà utilisé
  if (usernameExist && usernameExist.id !== Number(id)) {
    return res.status(409).json({ message: 'username déjà employé' });
  }

  const memePasswd = newPassword ? await bcrypt.compare(newPassword, userExist.password) : true;
  const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 8) : null;

  // crée une query avec les éléments données
  const query = {};
  if (newPassword !== '' && memePasswd === false) query.password = hashedPassword;
  if (newEmail && newEmail !== '' && newEmail !== userExist.email) query.email = newEmail;
  if (newUsername && newUsername !== '' && newUsername !== userExist.username) query.username = newUsername;

  // fait la requête uniquement si la query n'est pas vide
  if (Object.entries(query).length !== 0) {
    await db('user').update(query).where('id', id);

    return res.status(200).json({ modified: true });
  }

  return res.status(200).json({ modified: false });
});

router.put('/profileImage', upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  if (!req.files.image) return res.status(400).json({ message: 'aucune image fournis' });
  const file = req.files.image[0];
  const { originalname } = file;
  const { userId } = req.user;
  const image = `+-${userId}-+--${originalname}`;

  await db('user').update({ image }).where('id', userId);
  return res.status(200).json({ modified: true });
});

router.delete('/', async (req, res) => {
  await db.raw(`
    DELETE user,
    users_playlists,
    playlist
    FROM user
    INNER JOIN users_playlists ON user.id = users_playlists.user_id
    INNER JOIN playlist ON users_playlists.playlist_id
    where user.id = ${req.user.userId}
  `);

  return res.status(200).json({ msg: 'utilisateur effacé avec succès' });
});

module.exports = router;
