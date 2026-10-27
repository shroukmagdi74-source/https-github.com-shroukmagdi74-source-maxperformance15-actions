const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const TARGET_WIDTHS = [480, 960, 1440];
const DEFAULT_QUALITY = 82;

/**
 * Process a storefront image:
 * - Converts to WebP (quality ~82)
 * - Generates 3 responsive widths (480, 960, 1440) WITHOUT enlarging beyond original
 * - Returns { url, webp: { 480?, 960?, 1440? }, width, height, bytes, originalBytes }
 *
 * @param {Buffer|string} input - Image buffer or path to image file
 * @param {Object} [options]
 * @param {string} [options.outputDir] - Directory where converted webp images will be written
 * @param {string} [options.baseUrl] - Base URL prefix for served uploads (default: '/uploads/storefront')
 * @param {string} [options.filename] - Custom base filename (without extension)
 * @param {number} [options.quality] - WebP quality (default: 82)
 * @returns {Promise<{ url: string, webp: Record<number, string>, width: number, height: number, bytes: number, originalBytes?: number }>}
 */
async function processStorefrontImage(input, options = {}) {
  const quality = typeof options.quality === 'number' ? options.quality : DEFAULT_QUALITY;
  const baseUrl = options.baseUrl !== undefined ? options.baseUrl : '/uploads/storefront';
  const defaultDir = path.resolve(__dirname, '../uploads/storefront');
  const outputDir = options.outputDir || defaultDir;

  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Calculate original input byte size
  let originalBytes = 0;
  if (Buffer.isBuffer(input)) {
    originalBytes = input.length;
  } else if (typeof input === 'string' && fs.existsSync(input)) {
    try {
      originalBytes = fs.statSync(input).size;
    } catch {
      originalBytes = 0;
    }
  }

  // Inspect image metadata
  const imageInstance = sharp(input);
  const metadata = await imageInstance.metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  const baseIdentifier = options.filename
    ? path.basename(options.filename, path.extname(options.filename))
    : `storefront-${Date.now()}-${uuidv4().substring(0, 8)}`;

  // Convert main image to webp (quality 82)
  const mainFilename = `${baseIdentifier}.webp`;
  const mainWebpBuffer = await sharp(input)
    .webp({ quality })
    .toBuffer();

  const mainFilePath = path.join(outputDir, mainFilename);
  fs.writeFileSync(mainFilePath, mainWebpBuffer);

  const mainUrl = `${baseUrl.replace(/\/+$/, '')}/${mainFilename}`;
  const webpVariants = {};

  // Generate responsive variants: 480, 960, 1440
  // RULE: strictly NO enlargement above original width
  for (const targetWidth of TARGET_WIDTHS) {
    if (originalWidth >= targetWidth) {
      const variantFilename = `${baseIdentifier}-${targetWidth}w.webp`;
      const variantFilePath = path.join(outputDir, variantFilename);
      const variantBuffer = await sharp(input)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      fs.writeFileSync(variantFilePath, variantBuffer);
      webpVariants[targetWidth] = `${baseUrl.replace(/\/+$/, '')}/${variantFilename}`;
    }
  }

  return {
    url: mainUrl,
    webp: webpVariants,
    width: originalWidth,
    height: originalHeight,
    bytes: mainWebpBuffer.length,
    originalBytes,
  };
}

module.exports = {
  processStorefrontImage,
  TARGET_WIDTHS,
  DEFAULT_QUALITY,
};
