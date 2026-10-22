"use strict";

const INVALID_SLUG_ERROR_MESSAGE =
  "رابط المنتج (Slug) غير صالح: يجب ألا يحتوي على مسافات أو رموز مشفرة أو أرقام فقط";

/**
 * Validates a product slug.
 * Returns true if invalid (contains spaces, percent-encoded characters, or only digits).
 */
function isInvalidProductSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return false;
  }
  // 1. Contains whitespace (including leading, trailing, or internal)
  if (/\s/u.test(slug)) {
    return true;
  }

  const trimmed = slug.trim();
  if (!trimmed) {
    return false;
  }

  // 2. Contains percent-encoded sequences or %
  if (/%[0-9a-fA-F]{2}/.test(trimmed) || trimmed.includes("%")) {
    return true;
  }

  // 3. Consists only of digits
  if (/^\d+$/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Normalizes a product slug for canonical SEO URLs.
 * Replaces spaces and underscores with hyphens, decodes URI components, and strips extraneous hyphens.
 */
function getCanonicalProductSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return "";
  }
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // ignore
  }
  return decoded
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The storefront resolves a product only by: its stored slug, `-` -> space
 * alias, and space -> `-` alias (see storefrontHtmlController product lookup).
 * It never resolves an underscore variant.
 *
 * Always emitting `getCanonicalProductSlug` for links is therefore unsafe:
 * a stored slug like `Hagar_Khfaf` canonicalises to `Hagar-Khfaf`, which no
 * lookup can resolve -> 301 to a 404 page, a sitemap full of dead URLs and a
 * canonical tag pointing at a missing document.
 *
 * Use this helper (not the raw canonicaliser) whenever a slug becomes a public
 * URL: canonical tag / og:url, sitemap entries and the 301 canonical redirect.
 * It only returns the normalised form when that form is actually reachable.
 */
function getPublicProductSlug(slug) {
  const raw = typeof slug === "string" ? slug.trim() : "";
  if (!raw) {
    return "";
  }
  let stored = raw;
  try {
    stored = decodeURIComponent(raw).trim();
  } catch {
    // ignore malformed encodings — fall back to the raw stored value
  }
  const canonical = getCanonicalProductSlug(stored);
  if (!canonical) {
    return stored;
  }
  const reachableAliases = new Set([
    stored,
    stored.replace(/-/g, " "),
    stored.replace(/\s+/g, "-"),
  ]);
  return reachableAliases.has(canonical) ? canonical : stored;
}

/**
 * Normalizes a slug on save (create / update).
 * Replaces underscores with hyphens, collapses duplicate hyphens, and trims hyphens from ends.
 * Does NOT remove spaces (so invalid slugs with spaces are still caught by isInvalidProductSlug).
 */
function normalizeProductSlugForSave(slug) {
  if (!slug || typeof slug !== "string") {
    return "";
  }
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // ignore
  }
  return decoded
    .trim()
    .replace(/_+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  INVALID_SLUG_ERROR_MESSAGE,
  isInvalidProductSlug,
  getCanonicalProductSlug,
  getPublicProductSlug,
  normalizeProductSlugForSave,
};
