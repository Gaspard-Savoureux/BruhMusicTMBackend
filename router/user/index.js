const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../modules/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const user = await db('user').where('id', req.user.userId).first();
  return res.status(200).json(user);
});

router.put('/', async (req, res) => {
  const { newEmail, newPassword, newUsername } = req.body;
  const { id } = req.user.userId;

  const employeExist = await db('employe').where('id', id).first();
  if (!employeExist) {
    return res.status(404).json({ message: 'utilisateur non-existant' });
  }

  const userEmail = await db('employe').where('email', newEmail).first();
  if (userEmail && userEmail.id !== Number(id)) {
    return res.status(409).json({ message: 'Courriel déjà existant' });
  }

  const usernameExists = await db('employe').where('username', newUsername).first();
  if (usernameExists && usernameExists.id !== Number(id)) {
    return res.status(409).json({ message: 'username déjà employé' });
  }

  let modified = false;
  const hashedPassword = await bcrypt.hash(newPassword, 8);
  const memePasswd = await bcrypt.compare(newPassword, employeExist.password);

  if (newPassword !== '' && memePasswd === false) {
    await db('employe').update({ password: hashedPassword }).where('id', id);
    modified = true;
  }

  if (newEmail !== '' && newEmail !== employeExist.email) {
    await db('employe')
      .update({
        email: newEmail,
      })
      .where('id', id);
    modified = true;
  }

  return res.status(200).json({ modified });
});

router.delete('/', async (req, res) => {
  await db('user').where('id', req.user.userId).del();
  return res.status(200).json({ msg: 'utilisateur effacé avec succès' });
});
k;

module.exports = router;
