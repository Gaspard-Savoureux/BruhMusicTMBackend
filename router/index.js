const OpenApiValidator = require('express-openapi-validator');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

const { Router } = require('express');

const authMiddleware = require('../modules/auth-middleware');
const auth = require('./auth');
const user = require('./user');
const music = require('./music');
const usersPlaylist = require('./user-playlist');
const playlistsMusic = require('./playlists-music');

const router = Router();

const apiSpec = './specs/api.yaml';

router.use('/doc', swaggerUI.serve, swaggerUI.setup(YAML.load(apiSpec)));
router.use(
  OpenApiValidator.middleware({
    apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

router.use('/auth', auth);

router.use('/user', authMiddleware, user);

router.use('/music', music);

router.use('/user-playlist', usersPlaylist);

router.use('/playlists-music', playlistsMusic);

module.exports = router;
