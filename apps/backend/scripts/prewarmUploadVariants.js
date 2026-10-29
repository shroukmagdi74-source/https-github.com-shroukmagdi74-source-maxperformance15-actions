#!/usr/bin/env node
'use strict';

/**
 * Idempotent variant prewarming script for uploaded storefront images.
 * Scans apps/backend/uploads/{products,storefront,media} (skipping hidden
 * directories like .variants and .proxy-cache) and generates all standard
 * responsive WebP variants with bounded concurrency.
 *
 * Usage:
 *   node apps/backend/scripts/prewarmUploadVariants.js
 *   PREWARM_CONCURRENCY=4 node apps/backend/scripts/prewarmUploadVariants.js
 */

const fs = require('fs');
const path = require('path');
const {
  COMMON_PREGEN_VARIANTS,
  buildOptimizedVariantPath,
  isOptimizableUploadImage,
  pregenerateCommonUploadVariants,
} = require('../utils/uploadImageOptimizer');

const UPLOADS_ROOT = path.resolve(__dirname, '../uploads');
const TARGET_SUBDIRS = ['products', 'storefront', 'media'];
const DEFAULT_CONCURRENCY = 4;

const resolveConcurrency = (customConcurrency) => {
  const raw = customConcurrency ?? process.env.PREWARM_CONCURRENCY ?? DEFAULT_CONCURRENCY;
  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_CONCURRENCY;
  }
  return Math.min(parsed, 16);
};

const hasAllFreshVariants = (sourceFilePath) => {
  try {
    const sourceStats = fs.statSync(sourceFilePath);
    return COMMON_PREGEN_VARIANTS.every((variant) => {
      try {
        const variantPath = buildOptimizedVariantPath(sourceFilePath, variant);
        const variantStats = fs.statSync(variantPath);
        return variantStats.isFile() && variantStats.mtimeMs >= sourceStats.mtimeMs;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

const collectOptimizableImages = (dirPath, collected = []) => {
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  let entries = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    console.warn(`[PREWARM] Cannot read directory ${dirPath}: ${err.message}`);
    return collected;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.includes('.tmp-')) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectOptimizableImages(fullPath, collected);
    } else if (entry.isFile() && isOptimizableUploadImage(entry.name)) {
      collected.push(fullPath);
    }
  }

  return collected;
};

async function run(options = {}) {
  const concurrency = resolveConcurrency(options.concurrency);
  const uploadsRoot = options.uploadsRoot
    ? path.resolve(options.uploadsRoot)
    : UPLOADS_ROOT;
  const startedAt = Date.now();

  console.log(
    `[PREWARM] Starting upload variant prewarm (concurrency=${concurrency})`,
  );
  console.log(
    `[PREWARM] Target widths: ${COMMON_PREGEN_VARIANTS.map((v) => `${v.width}w@q${v.quality}`).join(', ')}`,
  );

  const filesBySubdir = [];
  for (const subdir of TARGET_SUBDIRS) {
    const dirPath = path.join(uploadsRoot, subdir);
    if (!fs.existsSync(dirPath)) {
      console.log(`[PREWARM] Skipping missing directory: ${dirPath}`);
      continue;
    }
    const files = collectOptimizableImages(dirPath);
    console.log(`[PREWARM] Found ${files.length} optimizable image(s) in ${subdir}/`);
    for (const filePath of files) {
      filesBySubdir.push(filePath);
    }
  }

  const totalFiles = filesBySubdir.length;
  if (totalFiles === 0) {
    console.log('[PREWARM] No optimizable images found. Done.');
    return {
      totalFiles: 0,
      warmedFiles: 0,
      alreadyFreshFiles: 0,
      failedFiles: 0,
      variantsEnsured: 0,
    };
  }

  let cursor = 0;
  let completed = 0;
  let warmedFiles = 0;
  let alreadyFreshFiles = 0;
  let failedFiles = 0;
  let variantsEnsured = 0;

  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= totalFiles) {
        return;
      }

      const filePath = filesBySubdir[index];
      const wasAlreadyFresh = hasAllFreshVariants(filePath);

      try {
        if (wasAlreadyFresh) {
          alreadyFreshFiles++;
          variantsEnsured += COMMON_PREGEN_VARIANTS.length;
        } else {
          const generated = await pregenerateCommonUploadVariants(filePath);
          variantsEnsured += generated.length;
          if (generated.length > 0) {
            warmedFiles++;
          } else {
            failedFiles++;
          }
        }
      } catch (err) {
        failedFiles++;
        console.warn(
          `[PREWARM] Failed ${path.relative(uploadsRoot, filePath)}: ${err.message}`,
        );
      } finally {
        completed++;
        if (completed % 25 === 0 || completed === totalFiles) {
          const pct = Math.round((completed / totalFiles) * 100);
          const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
          console.log(
            `[PREWARM] Progress: ${completed}/${totalFiles} (${pct}%) | newlyWarmed=${warmedFiles} alreadyFresh=${alreadyFreshFiles} failed=${failedFiles} | ${elapsedSec}s`,
          );
        }
      }
    }
  };

  const workerCount = Math.min(concurrency, totalFiles);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const totalSec = ((Date.now() - startedAt) / 1000).toFixed(2);
  console.log(
    `[PREWARM] Complete in ${totalSec}s — total=${totalFiles}, newlyWarmed=${warmedFiles}, alreadyFresh=${alreadyFreshFiles}, failed=${failedFiles}, variantsEnsured=${variantsEnsured}`,
  );

  return {
    totalFiles,
    warmedFiles,
    alreadyFreshFiles,
    failedFiles,
    variantsEnsured,
  };
}

if (require.main === module) {
  run().catch((err) => {
    console.error('[PREWARM] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = {
  collectOptimizableImages,
  hasAllFreshVariants,
  resolveConcurrency,
  run,
};
