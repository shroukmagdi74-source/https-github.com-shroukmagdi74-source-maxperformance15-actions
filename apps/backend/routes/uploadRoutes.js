const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require("../utils/verifyToken");
const { pregenerateCommonUploadVariants } = require("../utils/uploadImageOptimizer");
const { processStorefrontImage } = require("../services/storefrontImageService");

const RASTER_OPTIMIZABLE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const optimizeUploadedRasterImage = async (req, file, targetDir, urlPrefix) => {
  const originalFilename = file.filename;
  const originalFilePath = file.path || path.join(targetDir, originalFilename);
  const originalUrl = `${urlPrefix}/${originalFilename}`;
  const rawExtension = path.extname(originalFilename);
  const ext = rawExtension.toLowerCase();
  const isImageMime =
    typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');

  if (!isImageMime || !RASTER_OPTIMIZABLE_EXTENSIONS.has(ext)) {
    return {
      filename: originalFilename,
      size: file.size,
      url: originalUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${originalUrl}`,
      filePath: originalFilePath,
    };
  }

  const baseName = path.basename(originalFilename, rawExtension);
  const webpFilename = `${baseName}.webp`;
  const webpFilePath = path.join(targetDir, webpFilename);
  const tempFilePath = `${webpFilePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const pipeline = sharp(originalFilePath, { sequentialRead: true })
      .rotate()
      .resize(1600, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 4,
      });

    const outputInfo = await pipeline.toFile(tempFilePath);
    pipeline.destroy();

    fs.renameSync(tempFilePath, webpFilePath);

    if (webpFilePath !== originalFilePath && fs.existsSync(originalFilePath)) {
      try {
        fs.unlinkSync(originalFilePath);
      } catch (unlinkErr) {
        setTimeout(() => {
          fs.promises.unlink(originalFilePath).catch(() => {});
        }, 150);
      }
    }

    const finalSize = outputInfo?.size ?? fs.statSync(webpFilePath).size;
    const finalUrl = `${urlPrefix}/${webpFilename}`;

    return {
      filename: webpFilename,
      size: finalSize,
      url: finalUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${finalUrl}`,
      filePath: webpFilePath,
    };
  } catch (error) {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
    }

    console.warn(
      `[UPLOAD] WebP conversion skipped for ${originalFilename}, keeping original:`,
      error.message,
    );

    return {
      filename: originalFilename,
      size: file.size,
      url: originalUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${originalUrl}`,
      filePath: originalFilePath,
    };
  }
};

const router = express.Router();

// All upload routes require authentication
router.use(verifyToken.authenticateToken);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const productsDir = path.join(uploadsDir, 'products');
const conversationsDir = path.join(uploadsDir, 'conversations');
const storefrontDir = path.join(uploadsDir, 'storefront');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

if (!fs.existsSync(conversationsDir)) {
  fs.mkdirSync(conversationsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Create tasks attachments directory
const tasksDir = path.join(uploadsDir, 'tasks');
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// Configure multer for task attachments (any file type)
const taskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tasksDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `task-${uniqueSuffix}${extension}`);
  }
});

const taskUpload = multer({
  storage: taskStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for task attachments
  }
});

// General upload endpoint (for task attachments)
router.post('/', taskUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/tasks/${req.file.filename}`;
    
    res.json({
      success: true,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: fileUrl,
      fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

// Upload single image
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const optimized = await optimizeUploadedRasterImage(
      req,
      req.file,
      productsDir,
      '/uploads/products',
    );
    const finalFilePath = optimized.filePath;
    setImmediate(() => {
      pregenerateCommonUploadVariants(finalFilePath).catch((err) => {
        console.warn('[UPLOAD] Background variant generation failed:', err.message);
      });
    });

    res.json({
      success: true,
      data: {
        filename: optimized.filename,
        originalName: req.file.originalname,
        size: optimized.size,
        url: optimized.url,
        fullUrl: optimized.fullUrl
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const optimized = await optimizeUploadedRasterImage(
          req,
          file,
          productsDir,
          '/uploads/products',
        );
        const finalFilePath = optimized.filePath;
        setImmediate(() => {
          pregenerateCommonUploadVariants(finalFilePath).catch((err) => {
            console.warn('[UPLOAD] Background variant generation failed:', err.message);
          });
        });
        return {
          filename: optimized.filename,
          originalName: file.originalname,
          size: optimized.size,
          url: optimized.url,
          fullUrl: optimized.fullUrl
        };
      }),
    );

    //console.log(`${uploadedFiles.length} images uploaded successfully`);

    res.json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
});

// Configure memory storage for storefront webp processing
const storefrontUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

// Upload storefront image: converts to webp (quality ~82) and generates 480/960/1440 responsive variants
router.post('/storefront-image', storefrontUpload.any(), async (req, res) => {
  try {
    const file = (req.files && req.files[0]) || req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const result = await processStorefrontImage(file.buffer, {
      outputDir: storefrontDir,
      baseUrl: '/uploads/storefront',
      filename: file.originalname,
    });

    res.json({
      success: true,
      url: result.url,
      webp: result.webp,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      data: result,
    });
  } catch (error) {
    console.error('Error uploading storefront image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process storefront image',
    });
  }
});

// Delete image
router.delete('/file/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(productsDir, filename);

    if (path.resolve(filePath).startsWith(path.resolve(productsDir)) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    error: error.message || 'Upload failed'
  });
});

// Configure multer for conversation images
const conversationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, conversationsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `conversation-${uniqueSuffix}${extension}`);
  }
});

const conversationUpload = multer({
  storage: conversationStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Create media directory for general media uploads (images and videos)
const mediaDir = path.join(uploadsDir, 'media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Configure multer for media uploads (images and videos)
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `media-${uniqueSuffix}${extension}`);
  }
});

const mediaFileFilter = (req, file, cb) => {
  // Accept images, videos, and audio files
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('audio/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image, video, and audio files are allowed!'), false);
  }
};

const mediaUpload = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for media files
    files: 10
  }
});

// Upload single media file (image, video, or audio)
router.post('/media', mediaUpload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const isAudio = req.file.mimetype.startsWith('audio/');
    const mediaType = isVideo ? 'video' : (isAudio ? 'audio' : 'image');

    let finalFilename = req.file.filename;
    let finalSize = req.file.size;
    let mediaUrl = `/uploads/media/${req.file.filename}`;
    let fullUrl = `${req.protocol}://${req.get('host')}${mediaUrl}`;

    if (!isVideo && !isAudio) {
      const optimized = await optimizeUploadedRasterImage(
        req,
        req.file,
        mediaDir,
        '/uploads/media',
      );
      finalFilename = optimized.filename;
      finalSize = optimized.size;
      mediaUrl = optimized.url;
      fullUrl = optimized.fullUrl;
      const finalFilePath = optimized.filePath;
      setImmediate(() => {
        pregenerateCommonUploadVariants(finalFilePath).catch((err) => {
          console.warn('[UPLOAD] Background media variant generation failed:', err.message);
        });
      });
    }

    res.json({
      success: true,
      data: {
        filename: finalFilename,
        originalName: req.file.originalname,
        size: finalSize,
        url: mediaUrl,
        fullUrl,
        type: mediaType
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload media'
    });
  }
});

// Upload image for conversation
router.post('/conversation-image', conversationUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image uploaded'
      });
    }

    const optimized = await optimizeUploadedRasterImage(
      req,
      req.file,
      conversationsDir,
      '/uploads/conversations',
    );
    const finalFilePath = optimized.filePath;
    setImmediate(() => {
      pregenerateCommonUploadVariants(finalFilePath).catch((err) => {
        console.warn('[UPLOAD] Background conversation variant generation failed:', err.message);
      });
    });

    res.json({
      success: true,
      data: {
        filename: optimized.filename,
        originalName: req.file.originalname,
        size: optimized.size,
        url: optimized.url,
        fullUrl: optimized.fullUrl,
        type: 'image'
      }
    });
  } catch (error) {
    console.error('Error uploading conversation image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Create service files directory
const serviceFilesDir = path.join(uploadsDir, 'services');
if (!fs.existsSync(serviceFilesDir)) {
  fs.mkdirSync(serviceFilesDir, { recursive: true });
}

const serviceFileStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, serviceFilesDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, `service-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const serviceFileUpload = multer({
  storage: serviceFileStorage,
  limits: { fileSize: 100 * 1024 * 1024, files: 10 }
});

router.post('/service-file', serviceFileUpload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const fileUrl = `/uploads/services/${req.file.filename}`;
    const isAudio = req.file.mimetype.startsWith('audio/');
    const isVideo = req.file.mimetype.startsWith('video/');
    const isImage = req.file.mimetype.startsWith('image/');
    res.json({
      success: true, data: {
        filename: req.file.filename, originalName: req.file.originalname,
        size: req.file.size, url: fileUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
        type: isAudio ? 'audio' : isVideo ? 'video' : isImage ? 'image' : 'file'
      }
    });
  } catch (error) {
    console.error('Error uploading service file:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

module.exports = router;
