const OpenApiValidator = require('express-openapi-validator');

const { Router } = require('express');

const authMiddleware = require('../modules/auth-middleware');
const auth = require('./auth');
const user = require('./user');
const music = require('./music');
const usersPlaylist = require('./user-playlist');

const router = Router();

router.use(
  OpenApiValidator.middleware({
    apiSpec: './specs/api.yaml',
    validateRequests: true,
    validateResponses: true,
  }),
);

router.use('/auth', auth);

router.use('/user', authMiddleware, user);

router.use('/music', music);

router.use('/user-playlist', usersPlaylist);

module.exports = router;
