const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../modules/db');

const router = express.Router();

router.post('/create-token/', async (req, res) => {
  const { userCred, password } = req.body;

  const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isEmail = regexEmail.test(userCred);
  const user = isEmail ? await db('user').where('email', userCred).first() : await db('user').where('username', userCred).first();

  // const user = username ? await db('user').where('username', username).first() : await db('user').where('email', email).first();

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return res.status(401).json({ message: "Vous n'êtes pas autorizé" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.SECRET,
  );

  return res.status(200).json({ token });
});

router.post('/register', async (req, res) => {
  const { password, username } = req.body;

  const email = req.body.email.toLowerCase();

  if (password === '' || username === '' || email === '') {
    return res.status(400).json({ message: 'Champ(s) vide(s)' });
  }

  const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regexEmail.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const emailExists = await db('user').where('email', email).first();
  const usernameExists = await db('user').where('username', username).first();

  if (emailExists || usernameExists) {
    const msg = emailExists ? 'Email' : 'username';
    return res.status(409).json({ message: `${msg} déjà existant` });
  }

  const userId = await db('user').insert({
    username,
    email,
    password: hashedPassword,
  });

  const playlistId = await db('playlist').insert({
    name: 'favorite',
    description: `playlist de musique favorites de ${username}`,
  });

  await db('users_playlists').insert({
    user_id: userId,
    playlist_id: playlistId,
  });

  return res.status(201).json({ created: true });
});

module.exports = router;
