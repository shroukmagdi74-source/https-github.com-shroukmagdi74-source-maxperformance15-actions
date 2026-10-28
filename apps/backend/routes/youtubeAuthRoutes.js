const express = require('express');
const router = express.Router();
const controller = require('../controller/youtubeAuthController');
const verifyToken = require('../utils/verifyToken');
const checkAppAccess = require('../middleware/checkAppAccess');

router.get('/login', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), controller.login);
router.get('/callback', controller.callback);
router.get('/me', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), controller.me);

module.exports = router;
