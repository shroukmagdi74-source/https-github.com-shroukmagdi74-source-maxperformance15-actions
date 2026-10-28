const SEMVER = /^\d+\.\d+\.\d+$/;

const FIELDS = [
  'latestVersion',
  'latestVersionCode',
  'minRequiredVersion',
  'minRequiredVersionCode',
  'forceUpdate',
  'downloadUrl',
  'directApkUrl',
  'storeUrl',
  'releaseNotesAr',
  'releaseNotesEn',
  'featuresAr',
  'featuresEn',
  'isEnabled'
];

/**
 * Compare two SemVer strings (e.g. "1.2.0" vs "1.0.8")
 * Returns:
 *   -1 if v1 < v2
 *    0 if v1 === v2
 *    1 if v1 > v2
 */
function compareSemver(v1, v2) {
  const cleanV1 = (v1 || '').replace(/^[vV]/, '').trim();
  const cleanV2 = (v2 || '').replace(/^[vV]/, '').trim();

  const baseV1 = cleanV1.split('-')[0].split('+')[0];
  const baseV2 = cleanV2.split('-')[0].split('+')[0];

  const parts1 = baseV1.split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = baseV2.split('.').map((p) => parseInt(p, 10) || 0);

  const maxLength = Math.max(parts1.length, parts2.length, 3);
  while (parts1.length < maxLength) parts1.push(0);
  while (parts2.length < maxLength) parts2.push(0);

  for (let i = 0; i < maxLength; i++) {
    if (parts1[i] < parts2[i]) return -1;
    if (parts1[i] > parts2[i]) return 1;
  }

  return 0;
}

/**
 * Validates and sanitizes Android Version configuration input.
 * Strips any keys outside FIELDS to prevent injecting computed properties (e.g. releaseDate, fileSizeBytes).
 *
 * @param {object} input
 * @returns {{ ok: boolean, errors: string[], value: object }}
 */
function validateAndroidVersionConfig(input) {
  const errors = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      ok: false,
      errors: ['يجب إرسال كائن إعدادات صالح'],
      value: {}
    };
  }

  // 1. latestVersion
  if (input.latestVersion !== undefined) {
    if (typeof input.latestVersion !== 'string' || !SEMVER.test(input.latestVersion.trim())) {
      errors.push('رقم الإصدار الأحدث latestVersion غير صالح، يجب أن يطابق نمط SemVer (مثل 1.2.0)');
    }
  }

  // 2. minRequiredVersion
  if (input.minRequiredVersion !== undefined) {
    if (typeof input.minRequiredVersion !== 'string' || !SEMVER.test(input.minRequiredVersion.trim())) {
      errors.push('رقم الحد الأدنى للإصدار minRequiredVersion غير صالح، يجب أن يطابق نمط SemVer (مثل 1.0.8)');
    }
  }

  // 3. latestVersionCode
  if (input.latestVersionCode !== undefined) {
    const code = Number(input.latestVersionCode);
    if (!Number.isInteger(code) || code <= 0) {
      errors.push('كود الإصدار الأحدث latestVersionCode يجب أن يكون عدداً صحيحاً أكبر من الصفر');
    }
  }

  // 4. minRequiredVersionCode
  if (input.minRequiredVersionCode !== undefined) {
    const minCode = Number(input.minRequiredVersionCode);
    if (!Number.isInteger(minCode) || minCode <= 0) {
      errors.push('كود الحد الأدنى للإصدار minRequiredVersionCode يجب أن يكون عدداً صحيحاً أكبر من الصفر');
    }
  }

  // 5. Cross validation: minRequiredVersionCode <= latestVersionCode
  if (input.latestVersionCode !== undefined && input.minRequiredVersionCode !== undefined) {
    const code = Number(input.latestVersionCode);
    const minCode = Number(input.minRequiredVersionCode);
    if (Number.isInteger(code) && Number.isInteger(minCode) && minCode > code) {
      errors.push('كود الحد الأدنى minRequiredVersionCode لا يمكن أن يكون أكبر من كود الإصدار الأحدث latestVersionCode');
    }
  }

  // 6. Cross validation: compareSemver(minRequiredVersion, latestVersion) <= 0
  if (input.latestVersion !== undefined && input.minRequiredVersion !== undefined) {
    const vLatest = String(input.latestVersion).trim();
    const vMin = String(input.minRequiredVersion).trim();
    if (SEMVER.test(vLatest) && SEMVER.test(vMin)) {
      if (compareSemver(vMin, vLatest) > 0) {
        errors.push('الحد الأدنى للإصدار minRequiredVersion لا يمكن أن يكون أحدث من الإصدار الأحدث latestVersion');
      }
    }
  }

  // 7. URLs: downloadUrl, directApkUrl, storeUrl
  const urlFields = ['downloadUrl', 'directApkUrl', 'storeUrl'];
  for (const field of urlFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      const url = String(input[field]).trim();
      const isValid =
        url.startsWith('https://') ||
        url.startsWith('http://127.0.0.1') ||
        url.startsWith('http://localhost');
      if (!isValid) {
        errors.push(`رابط ${field} غير صالح، يجب أن يبدأ بـ https:// أو http://127.0.0.1`);
      }
    }
  }

  // 8. Booleans: forceUpdate, isEnabled
  if (input.forceUpdate !== undefined && typeof input.forceUpdate !== 'boolean') {
    errors.push('قيمة forceUpdate يجب أن تكون منطقية (true أو false)');
  }
  if (input.isEnabled !== undefined && typeof input.isEnabled !== 'boolean') {
    errors.push('قيمة isEnabled يجب أن تكون منطقية (true أو false)');
  }

  // 9. Sanitized value: ONLY keys from FIELDS are copied
  const value = {};
  for (const key of FIELDS) {
    if (input[key] !== undefined) {
      if (key === 'latestVersion' || key === 'minRequiredVersion') {
        value[key] = String(input[key]).trim();
      } else if (key === 'latestVersionCode' || key === 'minRequiredVersionCode') {
        value[key] = Number(input[key]);
      } else if (key === 'downloadUrl' || key === 'directApkUrl' || key === 'storeUrl') {
        value[key] = input[key] ? String(input[key]).trim() : '';
      } else if (key === 'featuresAr' || key === 'featuresEn') {
        if (Array.isArray(input[key])) {
          value[key] = input[key].map((item) => String(item).trim()).filter(Boolean);
        } else if (typeof input[key] === 'string') {
          value[key] = input[key]
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else {
        value[key] = input[key];
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    value
  };
}

module.exports = {
  SEMVER,
  FIELDS,
  compareSemver,
  validateAndroidVersionConfig
};
