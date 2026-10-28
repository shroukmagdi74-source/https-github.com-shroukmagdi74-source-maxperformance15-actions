const {
  validateAndroidVersionConfig,
  compareSemver,
  FIELDS,
} = require('../../utils/appVersionConfig');

describe('appVersionConfig Unit Tests', () => {
  describe('compareSemver', () => {
    it('returns 0 for identical versions', () => {
      expect(compareSemver('1.2.0', '1.2.0')).toBe(0);
      expect(compareSemver('v1.2.0', '1.2.0')).toBe(0);
    });

    it('returns -1 when v1 is smaller than v2', () => {
      expect(compareSemver('1.0.8', '1.2.0')).toBe(-1);
      expect(compareSemver('1.1.9', '1.2.0')).toBe(-1);
    });

    it('returns 1 when v1 is greater than v2', () => {
      expect(compareSemver('1.2.1', '1.2.0')).toBe(1);
      expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    });
  });

  describe('validateAndroidVersionConfig', () => {
    // A2: Valid configuration payload
    it('accepts a fully valid configuration payload (A2)', () => {
      const payload = {
        latestVersion: '1.2.1',
        latestVersionCode: 13,
        minRequiredVersion: '1.0.8',
        minRequiredVersionCode: 8,
        forceUpdate: false,
        isEnabled: true,
      };

      const result = validateAndroidVersionConfig(payload);
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value.latestVersion).toBe('1.2.1');
      expect(result.value.latestVersionCode).toBe(13);
      expect(result.value.minRequiredVersion).toBe('1.0.8');
      expect(result.value.minRequiredVersionCode).toBe(8);
      expect(result.value.forceUpdate).toBe(false);
      expect(result.value.isEnabled).toBe(true);
    });

    // A4: Rejects non-semver version string
    it('rejects invalid SemVer format in latestVersion (A4)', () => {
      const result = validateAndroidVersionConfig({ latestVersion: '1.2' });
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('SemVer'))).toBe(true);
    });

    it('rejects invalid SemVer format in minRequiredVersion', () => {
      const result = validateAndroidVersionConfig({ minRequiredVersion: 'v1.2' });
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('SemVer'))).toBe(true);
    });

    // A5: Rejects minRequiredVersionCode > latestVersionCode
    it('rejects when minRequiredVersionCode is greater than latestVersionCode (A5)', () => {
      const result = validateAndroidVersionConfig({
        latestVersion: '1.2.1',
        latestVersionCode: 13,
        minRequiredVersionCode: 99,
      });
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('minRequiredVersionCode'))).toBe(true);
    });

    it('rejects when minRequiredVersion is higher than latestVersion', () => {
      const result = validateAndroidVersionConfig({
        latestVersion: '1.2.0',
        minRequiredVersion: '1.3.0',
      });
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('minRequiredVersion'))).toBe(true);
    });

    // A6: Rejects / strips keys outside FIELDS (e.g. fileSizeBytes, releaseDate)
    it('strips disallowed/computed fields such as fileSizeBytes and releaseDate (A6)', () => {
      const result = validateAndroidVersionConfig({
        latestVersion: '1.2.1',
        latestVersionCode: 13,
        fileSizeBytes: 1,
        releaseDate: '2026-10-28',
        maliciousKey: 'attack',
      });
      expect(result.ok).toBe(true);
      expect(result.value.latestVersion).toBe('1.2.1');
      expect(result.value.fileSizeBytes).toBeUndefined();
      expect(result.value.releaseDate).toBeUndefined();
      expect(result.value.maliciousKey).toBeUndefined();
    });

    it('allows valid https and http://127.0.0.1 URLs', () => {
      const result = validateAndroidVersionConfig({
        downloadUrl: 'https://maxp.online/download/maxp.apk',
        directApkUrl: 'http://127.0.0.1:3100/download/maxp.apk',
      });
      expect(result.ok).toBe(true);
      expect(result.value.downloadUrl).toBe('https://maxp.online/download/maxp.apk');
      expect(result.value.directApkUrl).toBe('http://127.0.0.1:3100/download/maxp.apk');
    });

    it('rejects insecure or invalid URL schemes', () => {
      const result = validateAndroidVersionConfig({
        downloadUrl: 'ftp://example.com/maxp.apk',
      });
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('downloadUrl'))).toBe(true);
    });

    it('validates boolean types for forceUpdate and isEnabled', () => {
      const result = validateAndroidVersionConfig({
        forceUpdate: 'invalid',
        isEnabled: 123,
      });
      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});
