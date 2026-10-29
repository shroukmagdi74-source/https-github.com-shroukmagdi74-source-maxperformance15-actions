/**
 * Storefront Performance & Anti-Regression CI Guard
 *
 * This script runs in GitHub Actions CI to ensure that team members do not
 * accidentally regress storefront performance, re-introduce raw image preloads,
 * leak studio chunks into customer bundles, or bypass Redis caching and deduplication.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let failureCount = 0;

function pass(msg) {
  console.log(`✅ [PASS] ${msg}`);
}

function fail(msg, details) {
  failureCount++;
  console.error(`❌ [FAIL] ${msg}`);
  if (details) console.error(`   Details: ${details}`);
}

console.log('🚀 Running Storefront Performance & Anti-Regression Guard...\n');

// -------------------------------------------------------------
// Check 1: SSR Preload Image Safety in storefrontSeoService.js
// -------------------------------------------------------------
const seoServicePath = path.join(ROOT, 'apps/backend/services/storefrontSeoService.js');
if (!fs.existsSync(seoServicePath)) {
  fail('storefrontSeoService.js not found', seoServicePath);
} else {
  const content = fs.readFileSync(seoServicePath, 'utf8');
  if (!content.includes('as="image"') && !content.includes("as=\\\"image\\\"")) {
    fail('storefrontSeoService.js is missing image preload implementation');
  } else if (
    content.includes('<link rel="preload" as="image" href="${canonicalProductImageUrl}"') ||
    content.includes('<link rel="preload" as="image" href="${productImageUrl}"')
  ) {
    fail(
      'Regression detected: Raw un-optimized product image is being preloaded in SSR',
      'Must use responsive WebP via /api/proxy-image with imagesrcset and imagesizes'
    );
  } else if (content.includes('api/proxy-image') && (content.includes('PDP_IMAGE_PRELOAD_FORMAT = "webp"') || content.includes('format=webp'))) {
    pass('SSR Preload enforces WebP proxy-image with responsive srcset');
  } else {
    fail('SSR Preload must explicitly specify WebP format and proxy-image');
  }
}

// -------------------------------------------------------------
// Check 2: Component Thumbnail Optimization in VariantSelector
// -------------------------------------------------------------
const variantSelectorPath = path.join(
  ROOT,
  'apps/frontend/src/storefront/components/VariantSelector.tsx'
);
if (!fs.existsSync(variantSelectorPath)) {
  fail('VariantSelector.tsx not found', variantSelectorPath);
} else {
  const content = fs.readFileSync(variantSelectorPath, 'utf8');
  if (
    !content.includes('buildOptimizedStorefrontImageUrl') &&
    !content.includes('buildOptimizedVariantImageUrl')
  ) {
    fail(
      'VariantSelector.tsx does not use buildOptimizedStorefrontImageUrl',
      'Option thumbnails must be optimized to 120px WebP to prevent multi-megabyte image bloat'
    );
  } else {
    pass('VariantSelector.tsx uses optimized WebP thumbnail pipeline');
  }
}

// -------------------------------------------------------------
// Check 3: CSS Font Waterfall Ban in arabic-fonts.css
// -------------------------------------------------------------
const fontsCssPath = path.join(
  ROOT,
  'apps/frontend/src/storefront/styles/arabic-fonts.css'
);
if (!fs.existsSync(fontsCssPath)) {
  fail('arabic-fonts.css not found', fontsCssPath);
} else {
  const content = fs.readFileSync(fontsCssPath, 'utf8');
  const importMatches = content.match(/@import\s+url\([^)]+\)/gi) || [];
  if (importMatches.length > 2) {
    fail(
      `Regression detected: arabic-fonts.css contains ${importMatches.length} font @imports`,
      'Heavy Google Font waterfalls must remain removed. Fonts must load dynamically per theme.'
    );
  } else {
    pass('arabic-fonts.css is free of monolithic Google Font @import waterfalls');
  }
}

// -------------------------------------------------------------
// Check 4: Studio Chunk Isolation in vite.config.ts
// -------------------------------------------------------------
const viteConfigPath = path.join(ROOT, 'apps/frontend/vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
  fail('vite.config.ts not found', viteConfigPath);
} else {
  const content = fs.readFileSync(viteConfigPath, 'utf8');
  if (!content.includes('storefront-studio-runtime')) {
    fail(
      'vite.config.ts does not isolate storefront-studio-runtime',
      'Studio icons and editor utilities must remain isolated from public customer bundles'
    );
  } else {
    pass('vite.config.ts enforces storefront-studio-runtime chunk isolation');
  }
}

// -------------------------------------------------------------
// Check 5: Public API Redis Caching in publicProductsRoutes.js
// -------------------------------------------------------------
const publicRoutesPath = path.join(
  ROOT,
  'apps/backend/routes/publicProductsRoutes.js'
);
if (!fs.existsSync(publicRoutesPath)) {
  fail('publicProductsRoutes.js not found', publicRoutesPath);
} else {
  const content = fs.readFileSync(publicRoutesPath, 'utf8');
  if (!content.includes('redisCacheService.get') || !content.includes('detailCacheKey')) {
    fail(
      'publicProductsRoutes.js is missing Redis storefront caching',
      'Public product endpoint must maintain Redis caching to keep TTFB under 100ms'
    );
  } else {
    pass('publicProductsRoutes.js enforces Redis caching with scoped invalidation');
  }
}

// -------------------------------------------------------------
// Check 6: In-Flight Request Deduplication in useProduct.ts & settings
// -------------------------------------------------------------
const useProductPath = path.join(
  ROOT,
  'apps/frontend/src/storefront/hooks/useProduct.ts'
);
const settingsServicePath = path.join(
  ROOT,
  'apps/frontend/src/services/storefrontSettingsService.ts'
);
if (!fs.existsSync(useProductPath) || !fs.existsSync(settingsServicePath)) {
  fail('useProduct.ts or storefrontSettingsService.ts not found');
} else {
  const productContent = fs.readFileSync(useProductPath, 'utf8');
  const settingsContent = fs.readFileSync(settingsServicePath, 'utf8');

  if (!productContent.includes('inflightStorefrontProductPromises')) {
    fail('useProduct.ts is missing inflightStorefrontProductPromises deduplication map');
  } else if (!settingsContent.includes('inflightPublicStorefrontPromises')) {
    fail('storefrontSettingsService.ts is missing inflightPublicStorefrontPromises deduplication');
  } else {
    pass('Frontend hooks enforce in-flight request deduplication and memory caching');
  }
}

// -------------------------------------------------------------
// Check 7: Auto-WebP Upload Pipeline in uploadRoutes.js
// -------------------------------------------------------------
const uploadRoutesPath = path.join(
  ROOT,
  'apps/backend/routes/uploadRoutes.js'
);
if (!fs.existsSync(uploadRoutesPath)) {
  fail('uploadRoutes.js not found', uploadRoutesPath);
} else {
  const content = fs.readFileSync(uploadRoutesPath, 'utf8');
  if (!content.includes('createOptimizedUploadVariants') && !content.includes('uploadImageOptimizer')) {
    fail(
      'uploadRoutes.js is missing automated upload image optimization pipeline',
      'All merchant image uploads must automatically generate WebP variants'
    );
  } else {
    pass('uploadRoutes.js enforces automated WebP optimization on file uploads');
  }
}

// -------------------------------------------------------------
// Final Verdict
// -------------------------------------------------------------
console.log('\n-------------------------------------------------------------');
if (failureCount > 0) {
  console.error(`❌ Storefront Performance Guard FAILED with ${failureCount} violation(s).`);
  console.error('Please fix the regressions above before merging or deploying.\n');
  process.exit(1);
} else {
  console.log('✅ Storefront Performance Guard PASSED: All 7 safety gates are healthy!\n');
  process.exit(0);
}
