const express = require('express');

const router = express.Router();
const authMiddleware = require('../../modules/auth-middleware');

const db = require('../../modules/db');

router.post('/', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  
  const playlistId = await db('playlist')
    .insert({
      name,
      description,
    });
   
  const message = musicExists ? 'Successfully replaced file' : 'Successfully uploaded file';

  if (musicExists) {
    await db('music')
      .update({
        duration,
        uploaded: new Date(),
      })
      .where('title', title)
      .where('user_id', userId);

    return res.status(201).send({ message });
  }

  await db('music').insert({
    title,
    duration,
    user_id: userId,
  });

  return res.status(201).send({ message });
});

router.get('/', async (req, res) => {
  const { title } = req.query;

  const searchRelatedExist = await db('music').where('title', 'like', `%${title}%`);

  if (!searchRelatedExist) {
    return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });
  }

  return res.status(201).send({ searchRelatedExist });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const musicArray = await db('music').where('id', id).first();

  if (!musicArray) {
    return res.status(404).send({ message: 'Aucun résultats retourner pour cette recherche' });
  }

  return res.status(201).send({ musicArray });
});

module.exports = router;
const express = re;
