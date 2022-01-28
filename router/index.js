const OpenApiValidator = require('express-openapi-validator');

const { Router } = require('express');

const authMiddleware = require('../modules/auth-middleware');
const auth = require('./auth');
const user = require('./user');
const upload = require('./upload');

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

// router.use('/upload', authMiddleware, upload); A REMETTRE
router.use('/upload', upload);

module.exports = router;
