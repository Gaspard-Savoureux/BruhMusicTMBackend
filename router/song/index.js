 // nst express = require('express');
// const db = require('../../modules/db');

// const router = express.Router();

// router.get('/', async (req, res) => {
//   const { username, email, password } = req.body;

//   const user = username ? await db('user').where('username', username).first() : await db('user').where('email', email).first();
//   if (!user) {
//     return res.status(404).json({ message: 'Utilisateur non trouvé' });
//   }

//   return res.status(200).json({ token });
// });

// router.post('/register', async (req, res) => {
//   const { password, username } = req.body;

//   const email = req.body.email.toLowerCase();

//   if (password === '' || username === '' || email === '') {
//     return res.status(400).json({ message: 'Champ(s) vide(s)' });
//   }

//   const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   if (!regexEmail.test(email)) {
//     return res.status(400).json({ message: 'Email invalide' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 8);

//   const emailExists = await db('user').where('email', email).first();
//   const usernameExists = await db('user').where('username', username).first();

//   if (emailExists || usernameExists) {
//     const msg = emailExists ? 'Email' : 'username';
//     return res.status(409).json({ message: `${msg} déjà existant` });
//   }

//   await db('user').insert({
//     username,
//     email,
//     password: hashedPassword,
//   });

//   return res.status(201).json({ created: true });
// });

// mod
ule.exports = router;
