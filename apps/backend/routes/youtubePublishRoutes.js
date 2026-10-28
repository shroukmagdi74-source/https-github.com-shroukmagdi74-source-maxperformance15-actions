const express = require('express');
const router = express.Router();
const c = require('../controller/youtubePublishController');
const verifyToken = require('../utils/verifyToken');
const checkAppAccess = require('../middleware/checkAppAccess');

router.get('/account', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.getAccountStatus);
router.get('/', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.listVideos);
router.post('/', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.createVideo);
router.get('/:id', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.getVideo);
router.patch('/:id', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.updateScheduledVideo);
router.post('/:id/retry', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.retryVideo);
router.delete('/:id', verifyToken.authenticateToken, checkAppAccess('youtube-publish'), c.cancelVideo);

module.exports = router;
