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

// تحويل الحروف العربية لاتيني — عشان اسم الشركة العربي يدّي بادئة مفهومة بدل ما ناخدها من الإيميل
const ARABIC_LATIN_MAP = {
  'ا': 'A', 'أ': 'A', 'إ': 'A', 'آ': 'A', 'ٱ': 'A',
  'ب': 'B', 'ت': 'T', 'ث': 'T', 'ج': 'J', 'ح': 'H', 'خ': 'K',
  'د': 'D', 'ذ': 'D', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'SH',
  'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A', 'غ': 'G',
  'ف': 'F', 'ق': 'K', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
  'ه': 'H', 'ة': 'H', 'و': 'W', 'ؤ': 'W', 'ي': 'Y', 'ئ': 'Y',
  'ى': 'A', 'ء': '',
};

const ARABIC_DIACRITICS = /[\u064B-\u0652\u0670\u0640]/g; // تشكيل وتطويل

// كلمات قانونية بتتكرر في أول اسم الشركة ومش مفيدة في الكود
const LEGAL_PREFIXES = ['شركة', 'مؤسسة', 'مؤسسه', 'مصنع', 'متجر', 'محل', 'مركز', 'مطعم', 'كافيه'];

function transliterateArabic(str) {
  if (!str || typeof str !== 'string') return '';
  let text = str.replace(ARABIC_DIACRITICS, '').trim();

  for (const prefix of LEGAL_PREFIXES) {
    if (text.startsWith(prefix)) {
      const rest = text.slice(prefix.length).trim();
      if (rest.length >= 3) { text = rest; break; }
    }
  }
  // أداة التعريف في الأول
  if (text.startsWith('ال') && text.length > 4) text = text.slice(2);
  // أول كلمة بس — بادئة الكود 3-4 حروف، والكلمة الأولى هي اسم العلامة
  text = (text.split(/\s+/)[0] || text);

  let out = '';
  for (const ch of text) {
    if (ARABIC_LATIN_MAP[ch] !== undefined) out += ARABIC_LATIN_MAP[ch];
    else out += ch;
  }
  return out;
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

  const cleanName = sanitizeLetters(transliterateArabic(nameStr));
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
