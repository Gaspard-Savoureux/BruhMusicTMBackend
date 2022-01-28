const jwt = require('jsonwebtoken');
const db = require('./db');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const { headers } = req;
    const authHeader = headers.authorization; // retourne => "Bearer dfgdhjfdghjfdgdhjfdghjfdgjdh"
    if (!authHeader) throw new Error('Header missing');
    if (!authHeader.startsWith('Bearer ')) throw new Error('Bearer malformed');
    const secret = process.env.SECRET;
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, secret);

    const user = await db('user').where('id', req.user.userId).first();

    if (!user) throw new Error("L'utilisateur n'existe plus.");
    return next();
  } catch (error) {
    console.log("Une erreur s'est produite", error);
    return res.status(401).send('Not authorized');
  }
};
