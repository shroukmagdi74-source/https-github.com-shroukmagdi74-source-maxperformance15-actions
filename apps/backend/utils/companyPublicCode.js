const crypto = require('crypto');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars: A–Z minus O,I,L + 2–9
const PREFIX_RE = /^[A-HJ-KM-NP-Z]{3,4}$/;
const CODE_RE   = /^[A-HJ-KM-NP-Z]{3,4}-[A-HJ-KM-NP-Z2-9]{6}$/;

/**
 * Lazy-load shared prisma client to avoid top-level require in environments
 * without node_modules.
 */
function getPrismaClient() {
  const { getSharedPrismaClient } = require('../services/sharedDatabase');
  return getSharedPrismaClient();
}

/**
 * Sanitize input to latin uppercase letters excluding O, I, L.
 */
function sanitizeLetters(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .replace(/[OIL]/g, '');
}

/**
 * Pure, deterministic prefix builder (3–4 letters).
 * - Takes name/slug/email.
 * - Filters to uppercase latin letters without O, I, L.
 * - If < 3 letters, appends unconsumed letters from slug, then email local-part.
 * - If still < 3, pads with 'X'.
 * - 3 letters only when source really has just 3; otherwise takes first 4.
 */
function buildPublicCodePrefix(source) {
  let nameStr = '';
  let slugStr = '';
  let emailStr = '';

  if (typeof source === 'string') {
    nameStr = source;
  } else if (source && typeof source === 'object') {
    nameStr = source.name || '';
    slugStr = source.slug || '';
    emailStr = source.email || '';
  }

  const cleanName = sanitizeLetters(nameStr);
  let letters = cleanName;

  if (letters.length < 3 && slugStr) {
    const cleanSlug = sanitizeLetters(slugStr);
    let unconsumedSlug = cleanSlug;
    if (unconsumedSlug.startsWith(cleanName)) {
      unconsumedSlug = unconsumedSlug.slice(cleanName.length);
    }
    letters += unconsumedSlug;
  }

  if (letters.length < 3 && emailStr) {
    const localPart = String(emailStr).split('@')[0] || '';
    const cleanEmail = sanitizeLetters(localPart);
    let unconsumedEmail = cleanEmail;
    if (unconsumedEmail.startsWith(cleanName)) {
      unconsumedEmail = unconsumedEmail.slice(cleanName.length);
    }
    letters += unconsumedEmail;
  }

  while (letters.length < 3) {
    letters += 'X';
  }

  if (letters.length === 3) {
    return letters;
  }
  return letters.slice(0, 4);
}

/**
 * Generate a random 6-character body from ALPHABET.
 */
function generateRandomBody(length = 6) {
  let body = '';
  for (let i = 0; i < length; i += 1) {
    const idx = crypto.randomInt(ALPHABET.length);
    body += ALPHABET[idx];
  }
  return body;
}

/**
 * Pure function returning a complete public code: ${prefix}-${body}.
 */
function generatePublicCode(nameOrSlug) {
  const prefix = buildPublicCodePrefix(nameOrSlug);
  const body = generateRandomBody(6);
  return `${prefix}-${body}`;
}

/**
 * Generate a unique public code with DB pre-check and up to 12 retries.
 */
async function generateUniqueCompanyPublicCode(
  nameOrSlug,
  {
    prisma,
    excludeCompanyId
  } = {}
) {
  const client = prisma || getPrismaClient();
  const prefix = buildPublicCodePrefix(nameOrSlug);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const body = generateRandomBody(6);
    const candidate = `${prefix}-${body}`;

    const where = { publicCode: candidate };
    if (excludeCompanyId) {
      where.NOT = { id: excludeCompanyId };
    }

    const existing = await client.company.findFirst({
      where,
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error('تعذر إنشاء رمز فريد للشركة');
}

/**
 * Ensure company has a publicCode; generates and updates if missing.
 */
async function ensureCompanyPublicCode(
  companyOrId,
  {
    prisma
  } = {}
) {
  if (!companyOrId) {
    return null;
  }

  const client = prisma || getPrismaClient();

  let company =
    typeof companyOrId === 'string'
      ? await client.company.findUnique({
          where: { id: companyOrId },
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            publicCode: true
          }
        })
      : companyOrId;

  if (!company) {
    return null;
  }

  if (company.publicCode && String(company.publicCode).trim().length > 0) {
    return company;
  }

  const publicCode = await generateUniqueCompanyPublicCode(company, {
    prisma: client,
    excludeCompanyId: company.id
  });

  const updatedCompany = await client.company.update({
    where: { id: company.id },
    data: { publicCode }
  });

  return typeof companyOrId === 'string'
    ? updatedCompany
    : {
        ...company,
        publicCode: updatedCompany.publicCode
      };
}

module.exports = {
  ALPHABET,
  PREFIX_RE,
  CODE_RE,
  buildPublicCodePrefix,
  generatePublicCode,
  generateUniqueCompanyPublicCode,
  ensureCompanyPublicCode
};
