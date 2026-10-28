/**
 * Public Sample Share Routes (Wave 5 / T05)
 *
 * Public unauthenticated endpoints for viewing and acknowledging sample orders via share token.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const controller = require('../controller/publicSampleShareController');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '../uploads/manufacturing');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = uuidv4();
    cb(null, `sample-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /^(jpe?g|png|webp)$/i;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = (file.mimetype || '').toLowerCase();

  const isImageMime = mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp' || mime === 'image/pjpeg';
  const isImageExt = allowedExts.test(ext);

  if (isImageExt && isImageMime) {
    cb(null, true);
  } else {
    const err = new Error('نوع الملف غير مدعوم. المسموح: صور فقط (JPG, PNG, WebP)');
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware to catch Multer errors (e.g. invalid file type or size) and return 400 cleanly
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'خطأ أثناء رفع الملف',
      });
    }
    next();
  });
};

router.get('/:token', controller.getPublic);
router.post('/:token/factory-ack', handleUpload, controller.factoryAck);

module.exports = router;
