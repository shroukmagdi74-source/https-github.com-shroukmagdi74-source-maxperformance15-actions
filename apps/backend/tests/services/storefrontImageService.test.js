const path = require('path');
const fs = require('fs');
const os = require('os');
const sharp = require('sharp');
const {
  processStorefrontImage,
  TARGET_WIDTHS,
  DEFAULT_QUALITY,
} = require('../../services/storefrontImageService');

describe('storefrontImageService', () => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const fixture1600 = path.join(fixturesDir, 'sample-1600.png');
  const fixture300 = path.join(fixturesDir, 'sample-300.png');
  const tempOutputDir = path.join(os.tmpdir(), 'storefront-test-' + Date.now());

  beforeAll(() => {
    fs.mkdirSync(tempOutputDir, { recursive: true });
  });

  afterAll(() => {
    try {
      if (fs.existsSync(tempOutputDir)) {
        fs.rmSync(tempOutputDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      }
    } catch {
      // Ignore Windows file lock on temporary test directory
    }
  });

  test('verifies test fixtures exist and are within size limit (<= 50KB)', () => {
    expect(fs.existsSync(fixture1600)).toBe(true);
    expect(fs.existsSync(fixture300)).toBe(true);

    const size1600 = fs.statSync(fixture1600).size;
    const size300 = fs.statSync(fixture300).size;

    expect(size1600).toBeLessThanOrEqual(50 * 1024);
    expect(size300).toBeLessThanOrEqual(50 * 1024);
  });

  test('converts 1600px image to webp with 1440, 960, and 480 variants and smaller byte size', async () => {
    const originalBytes = fs.statSync(fixture1600).size;

    const result = await processStorefrontImage(fixture1600, {
      outputDir: tempOutputDir,
      baseUrl: '/uploads/storefront',
      filename: 'sample-1600',
    });

    // Check return structure
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('webp');
    expect(result).toHaveProperty('width', 1600);
    expect(result).toHaveProperty('height');
    expect(result).toHaveProperty('bytes');

    // 1600px image must output all 3 widths: 1440, 960, 480
    expect(result.webp).toHaveProperty('1440');
    expect(result.webp).toHaveProperty('960');
    expect(result.webp).toHaveProperty('480');

    expect(result.webp[1440]).toContain('sample-1600-1440w.webp');
    expect(result.webp[960]).toContain('sample-1600-960w.webp');
    expect(result.webp[480]).toContain('sample-1600-480w.webp');

    // Converted WebP file bytes must be smaller than the original PNG fixture
    expect(result.bytes).toBeLessThan(originalBytes);

    // Verify generated file exists and format is webp with correct dimensions
    const file1440 = path.join(tempOutputDir, 'sample-1600-1440w.webp');
    const file960 = path.join(tempOutputDir, 'sample-1600-960w.webp');
    const file480 = path.join(tempOutputDir, 'sample-1600-480w.webp');

    expect(fs.existsSync(file1440)).toBe(true);
    expect(fs.existsSync(file960)).toBe(true);
    expect(fs.existsSync(file480)).toBe(true);

    const meta1440 = await sharp(file1440).metadata();
    expect(meta1440.format).toBe('webp');
    expect(meta1440.width).toBe(1440);

    const meta960 = await sharp(file960).metadata();
    expect(meta960.format).toBe('webp');
    expect(meta960.width).toBe(960);

    const meta480 = await sharp(file480).metadata();
    expect(meta480.format).toBe('webp');
    expect(meta480.width).toBe(480);
  });

  test('protection: 300px image does NOT enlarge - 1440 width must NOT be present', async () => {
    const result = await processStorefrontImage(fixture300, {
      outputDir: tempOutputDir,
      baseUrl: '/uploads/storefront',
      filename: 'sample-300',
    });

    expect(result.width).toBe(300);

    // Assert: 1440 must NOT exist because 300 < 1440
    expect(result.webp[1440]).toBeUndefined();
    expect(result.webp).not.toHaveProperty('1440');

    // Also 960 and 480 must NOT exist because 300 is smaller than both
    expect(result.webp[960]).toBeUndefined();
    expect(result.webp[480]).toBeUndefined();

    // The output file for 1440 must not have been created on disk
    const file1440 = path.join(tempOutputDir, 'sample-300-1440w.webp');
    expect(fs.existsSync(file1440)).toBe(false);

    // But the base webp is converted properly
    expect(result.url).toContain('sample-300.webp');
    const baseFile = path.join(tempOutputDir, 'sample-300.webp');
    expect(fs.existsSync(baseFile)).toBe(true);
    const baseMeta = await sharp(baseFile).metadata();
    expect(baseMeta.format).toBe('webp');
    expect(baseMeta.width).toBe(300);
  });

  test('supports Buffer input seamlessly', async () => {
    const buffer = fs.readFileSync(fixture1600);
    const result = await processStorefrontImage(buffer, {
      outputDir: tempOutputDir,
      baseUrl: '/uploads/storefront',
      filename: 'buffer-test',
    });

    expect(result.width).toBe(1600);
    expect(result.webp[1440]).toBeDefined();
    expect(result.webp[960]).toBeDefined();
    expect(result.webp[480]).toBeDefined();
    expect(result.bytes).toBeGreaterThan(0);
  });
});
