const {
  resolveAudience,
  resolveFixedAudience,
  resolveDynamicAudience,
  previewAudience,
} = require('../../services/broadcastAudienceResolver');
const { toCanonicalE164 } = require('../../utils/phoneNormalization');

describe('broadcastAudienceResolver', () => {
  const companyId = 'comp_test_123';

  describe('dynamic + onlyNew', () => {
    it('returns only new recipients and excludes already sent recipients', async () => {
      const reachedPhones = ['01011111111', '01022222222', '01033333333']; // A, B, C
      const newPhones = ['01044444444', '01055555555']; // D, E
      const allCustomers = [
        { id: 'c1', phone: '01011111111', firstName: 'Customer', lastName: 'A' },
        { id: 'c2', phone: '01022222222', firstName: 'Customer', lastName: 'B' },
        { id: 'c3', phone: '01033333333', firstName: 'Customer', lastName: 'C' },
        { id: 'c4', phone: '01044444444', firstName: 'Customer', lastName: 'D' },
        { id: 'c5', phone: '01055555555', firstName: 'Customer', lastName: 'E' },
      ];

      const mockPrisma = {
        broadcastRecipient: {
          findMany: jest.fn().mockResolvedValue(
            reachedPhones.map((p) => ({ customerPhone: p }))
          ),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(allCustomers),
        },
      };

      const campaign = {
        id: 'camp_dyn_1',
        audienceMode: 'dynamic',
        onlyNew: true,
        maxRecipientsPerRun: 100,
      };

      const result = await resolveAudience({
        prisma: mockPrisma,
        campaign,
        companyId,
      });

      expect(result.excludedCount).toBe(3);
      expect(result.phones).toHaveLength(2);

      const returnedPhones = result.phones.map((p) => p.phone);
      // Assertion must be: "none of A,B,C appear", not just a count
      expect(returnedPhones).not.toContain('01011111111');
      expect(returnedPhones).not.toContain('01022222222');
      expect(returnedPhones).not.toContain('01033333333');
      expect(returnedPhones).toEqual(expect.arrayContaining(['01044444444', '01055555555']));
    });
  });

  describe('fixed audience', () => {
    it('returns the identical phone set on two consecutive resolutions', async () => {
      const fixedSnapshots = [
        { phone: '01011111111', phoneNormalized: '+201011111111', customerId: 'c1', customerName: 'User 1' },
        { phone: '01022222222', phoneNormalized: '+201022222222', customerId: 'c2', customerName: 'User 2' },
        { phone: '01033333333', phoneNormalized: '+201033333333', customerId: 'c3', customerName: 'User 3' },
      ];

      const mockPrisma = {
        broadcastCampaignSnapshot: {
          findMany: jest.fn().mockResolvedValue(fixedSnapshots),
        },
      };

      const campaign = {
        id: 'camp_fixed_1',
        audienceMode: 'fixed',
        onlyNew: false,
        maxRecipientsPerRun: 100,
      };

      const run1 = await resolveAudience({ prisma: mockPrisma, campaign, companyId });
      const run2 = await resolveAudience({ prisma: mockPrisma, campaign, companyId });

      expect(run1.phones).toEqual(run2.phones);
      expect(run1.phones.map((p) => p.phone)).toEqual(['01011111111', '01022222222', '01033333333']);
      expect(run1.totalMatched).toBe(3);
      expect(run1.cappedCount).toBe(0);
      expect(run1.excludedCount).toBe(0);
    });
  });

  describe('capping and precedence over onlyNew', () => {
    it('applies maxRecipientsPerRun cap AFTER onlyNew exclusion (2 of 5 -> 2 phones + cappedCount 3)', async () => {
      // 5 candidates, none excluded -> 2 accepted, 3 capped
      const customers = [
        { id: 'c1', phone: '01011111111', firstName: 'C1' },
        { id: 'c2', phone: '01022222222', firstName: 'C2' },
        { id: 'c3', phone: '01033333333', firstName: 'C3' },
        { id: 'c4', phone: '01044444444', firstName: 'C4' },
        { id: 'c5', phone: '01055555555', firstName: 'C5' },
      ];

      const mockPrisma = {
        broadcastRecipient: {
          findMany: jest.fn().mockResolvedValue([]), // no previous sends
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(customers),
        },
      };

      const campaign = {
        id: 'camp_cap_1',
        audienceMode: 'dynamic',
        onlyNew: true,
        maxRecipientsPerRun: 2,
      };

      const result = await resolveAudience({
        prisma: mockPrisma,
        campaign,
        companyId,
        maxRecipients: 2,
      });

      expect(result.phones).toHaveLength(2);
      expect(result.cappedCount).toBe(3);
      expect(result.excludedCount).toBe(0);
      expect(result.totalMatched).toBe(5);
    });

    it('applies cap AFTER exclusion when some candidates are excluded', async () => {
      // 5 candidates, 1 excluded (c1), cap = 2 -> 2 accepted, 2 capped
      const customers = [
        { id: 'c1', phone: '01011111111', firstName: 'C1' },
        { id: 'c2', phone: '01022222222', firstName: 'C2' },
        { id: 'c3', phone: '01033333333', firstName: 'C3' },
        { id: 'c4', phone: '01044444444', firstName: 'C4' },
        { id: 'c5', phone: '01055555555', firstName: 'C5' },
      ];

      const mockPrisma = {
        broadcastRecipient: {
          findMany: jest.fn().mockResolvedValue([{ customerPhone: '01011111111' }]),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(customers),
        },
      };

      const campaign = {
        id: 'camp_cap_2',
        audienceMode: 'dynamic',
        onlyNew: true,
        maxRecipientsPerRun: 2,
      };

      const result = await resolveAudience({
        prisma: mockPrisma,
        campaign,
        companyId,
        maxRecipients: 2,
      });

      expect(result.excludedCount).toBe(1);
      expect(result.phones).toHaveLength(2);
      expect(result.cappedCount).toBe(2);
      expect(result.totalMatched).toBe(5);
    });
  });

  describe('deduplication', () => {
    it('collapses duplicate phones in source data into one recipient', async () => {
      // Two entries with differing formats of the same Egyptian number
      const customers = [
        { id: 'c1', phone: '01012345678', firstName: 'First' },
        { id: 'c2', phone: '+201012345678', firstName: 'Duplicate' },
        { id: 'c3', phone: '01099999999', firstName: 'Unique' },
      ];

      const mockPrisma = {
        broadcastRecipient: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        customer: {
          findMany: jest.fn().mockResolvedValue(customers),
        },
      };

      const campaign = {
        id: 'camp_dedup_1',
        audienceMode: 'dynamic',
        onlyNew: false,
        maxRecipientsPerRun: 10,
      };

      const result = await resolveAudience({
        prisma: mockPrisma,
        campaign,
        companyId,
      });

      expect(result.phones).toHaveLength(2);
      expect(result.totalMatched).toBe(2);
      const phones = result.phones.map((p) => toCanonicalE164(p.phone));
      expect(new Set(phones).size).toBe(2);
    });
  });

  describe('legacy fallback', () => {
    it('reports source: legacy when no snapshot exists for a fixed campaign', async () => {
      const mockPrisma = {
        broadcastCampaignSnapshot: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      const campaign = {
        id: 'camp_legacy_1',
        audienceMode: 'fixed',
      };

      const result = await resolveAudience({
        prisma: mockPrisma,
        campaign,
        companyId,
      });

      expect(result.source).toBe('legacy');
      expect(result.phones).toHaveLength(0);
    });
  });
});
