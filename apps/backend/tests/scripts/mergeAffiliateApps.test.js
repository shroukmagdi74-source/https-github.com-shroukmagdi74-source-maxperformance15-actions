const {
  LEGACY_SLUG,
  TARGET_SLUG,
  parseSettings,
  resolveBestStatus,
} = require('../../scripts/one-off/merge-affiliate-apps');

describe('merge-affiliate-apps migration script logic', () => {
  test('constants define correct legacy and target slugs', () => {
    expect(LEGACY_SLUG).toBe('affiliate-program');
    expect(TARGET_SLUG).toBe('affiliate-pro');
  });

  describe('resolveBestStatus', () => {
    test('ACTIVE wins over everything', () => {
      expect(resolveBestStatus('INACTIVE', 'ACTIVE')).toBe('ACTIVE');
      expect(resolveBestStatus('ACTIVE', 'INACTIVE')).toBe('ACTIVE');
      expect(resolveBestStatus('ACTIVE', 'TRIAL')).toBe('ACTIVE');
      expect(resolveBestStatus('EXPIRED', 'ACTIVE')).toBe('ACTIVE');
    });

    test('TRIAL wins when neither is ACTIVE', () => {
      expect(resolveBestStatus('INACTIVE', 'TRIAL')).toBe('TRIAL');
      expect(resolveBestStatus('TRIAL', 'INACTIVE')).toBe('TRIAL');
    });

    test('retains existing status if non-empty', () => {
      expect(resolveBestStatus('INACTIVE', 'INACTIVE')).toBe('INACTIVE');
      expect(resolveBestStatus('SUSPENDED', 'INACTIVE')).toBe('SUSPENDED');
    });

    test('falls back to legacy status when existing is empty', () => {
      expect(resolveBestStatus(null, 'ACTIVE')).toBe('ACTIVE');
      expect(resolveBestStatus('', 'TRIAL')).toBe('TRIAL');
      expect(resolveBestStatus(null, null)).toBe('INACTIVE');
    });
  });

  describe('parseSettings', () => {
    test('returns object unchanged when already object', () => {
      const obj = { foo: 'bar' };
      expect(parseSettings(obj)).toEqual({ foo: 'bar' });
    });

    test('parses JSON string correctly', () => {
      expect(parseSettings('{"theme":"dark","installedBy":"seed"}')).toEqual({
        theme: 'dark',
        installedBy: 'seed',
      });
    });

    test('returns empty object for null, undefined, invalid JSON, or arrays', () => {
      expect(parseSettings(null)).toEqual({});
      expect(parseSettings(undefined)).toEqual({});
      expect(parseSettings('invalid-json')).toEqual({});
      expect(parseSettings('[1, 2, 3]')).toEqual({});
    });

    test('merges settings without overwriting existing keys', () => {
      const legacySettings = {
        installedBy: 'marketplaceSeed',
        sharedKey: 'legacyValue',
      };
      const existingProSettings = {
        customSetting: true,
        sharedKey: 'existingValue',
      };
      const merged = { ...legacySettings, ...existingProSettings };

      expect(merged).toEqual({
        installedBy: 'marketplaceSeed',
        customSetting: true,
        sharedKey: 'existingValue', // existing wins!
      });
    });
  });
});
