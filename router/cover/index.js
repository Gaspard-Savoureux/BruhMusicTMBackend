const express = require('express');

const router = express.Router();

const { upload } = require('../../modules/upload');
const db = require('../../modules/db');

// Route pour changer le cover d'un album
router.put('/:albumId', upload.fields([{ name: 'cover', maxCount: 1 }]), async (req, res) => {
  if (!req.files.cover) return res.status(400).json({ message: 'aucune image fournis' });
  const { albumId } = req.params;
  const file = req.files.cover[0];
  const { originalname } = file;
  const { userId } = req.user;
  const cover = `+-+${userId}+-+--${originalname}`;

  await db('album') //
    .update({ cover })
    .where('user_id', userId)
    .where('id', albumId);
  return res.status(200).json({ modified: true });
});

module.exports = router;
