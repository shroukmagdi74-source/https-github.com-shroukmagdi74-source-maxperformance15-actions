const {
  deterministicStringify,
  hashSnapshot,
  recordRevision,
  getRevisions,
  getRevisionById,
  restoreRevision,
  MAX_RETAINED_REVISIONS,
} = require('../../services/storefrontSettingsRevisionService');

describe('Ticket HIST-1: StorefrontSettingsRevision Service & Integrity Guard', () => {
  let mockRevisions = [];
  let mockStorefrontSettings = {};
  let mockUsers = [
    { id: 'user-admin-1', email: 'admin@example.com', name: 'محمد' },
    { id: 'user-editor-2', email: 'editor@example.com', name: 'سارة' },
  ];

  let mockPrisma;

  beforeEach(() => {
    mockRevisions = [];
    mockStorefrontSettings = {};

    mockPrisma = {
      storefrontSettingsRevision: {
        findFirst: jest.fn(async ({ where, orderBy }) => {
          let filtered = mockRevisions.filter((r) => {
            if (where.companyId && r.companyId !== where.companyId) return false;
            if (where.id && r.id !== where.id) return false;
            return true;
          });
          if (orderBy?.revisionNumber === 'desc') {
            filtered.sort((a, b) => b.revisionNumber - a.revisionNumber);
          }
          return filtered[0] || null;
        }),
        findMany: jest.fn(async ({ where, orderBy, take, skip }) => {
          let filtered = mockRevisions.filter((r) => {
            if (where?.companyId && r.companyId !== where.companyId) return false;
            return true;
          });
          if (orderBy?.revisionNumber === 'desc') {
            filtered.sort((a, b) => b.revisionNumber - a.revisionNumber);
          }
          if (skip) {
            filtered = filtered.slice(skip);
          }
          if (take) {
            filtered = filtered.slice(0, take);
          }
          return filtered;
        }),
        create: jest.fn(async ({ data }) => {
          const record = {
            id: `rev-${mockRevisions.length + 1}-${Date.now()}`,
            companyId: data.companyId,
            revisionNumber: data.revisionNumber,
            snapshot: data.snapshot,
            createdBy: data.createdBy || null,
            note: data.note || null,
            createdAt: new Date(),
          };
          mockRevisions.push(record);
          return record;
        }),
        deleteMany: jest.fn(async ({ where }) => {
          const idsToDelete = new Set(where.id?.in || []);
          const count = mockRevisions.filter((r) => idsToDelete.has(r.id)).length;
          mockRevisions = mockRevisions.filter((r) => !idsToDelete.has(r.id));
          return { count };
        }),
      },
      storefrontSettings: {
        upsert: jest.fn(async ({ where, update, create }) => {
          const companyId = where.companyId;
          const existing = mockStorefrontSettings[companyId];
          const next = existing
            ? { ...existing, ...update }
            : { companyId, ...create };
          mockStorefrontSettings[companyId] = next;
          return next;
        }),
      },
      user: {
        findMany: jest.fn(async ({ where }) => {
          const ids = new Set(where?.id?.in || []);
          return mockUsers.filter((u) => ids.has(u.id));
        }),
      },
    };
  });

  test('1. Deterministic hashing ignores key order and accurately hashes snapshots', () => {
    const snap1 = { themeId: 'modern-minimal', designTokens: { a: 1, b: 2 } };
    const snap2 = { designTokens: { b: 2, a: 1 }, themeId: 'modern-minimal' };

    expect(hashSnapshot(snap1)).toBe(hashSnapshot(snap2));
    expect(hashSnapshot(snap1)).toHaveLength(64);
  });

  test('2. recordRevision creates a new revision with revisionNumber = 1 for first save', async () => {
    const snapshot = {
      themeId: 'khemet-fashion-eg',
      designTokens: { colors: { primary: '#000000' } },
    };

    const result = await recordRevision({
      companyId: 'company-a',
      snapshot,
      userId: 'user-admin-1',
      note: 'حفظ أولي للألوان',
      client: mockPrisma,
    });

    expect(result.created).toBe(true);
    expect(result.revision.revisionNumber).toBe(1);
    expect(result.revision.companyId).toBe('company-a');
    expect(result.revision.createdBy).toBe('user-admin-1');
    expect(result.revision.note).toBe('حفظ أولي للألوان');
    expect(mockRevisions).toHaveLength(1);
  });

  test('3. recordRevision ignores identical snapshots and does NOT increment revisionNumber', async () => {
    const snapshot1 = {
      themeId: 'khemet-fashion-eg',
      designTokens: { colors: { primary: '#000000' } },
    };

    const first = await recordRevision({
      companyId: 'company-a',
      snapshot: snapshot1,
      userId: 'user-admin-1',
      client: mockPrisma,
    });
    expect(first.created).toBe(true);
    expect(first.revision.revisionNumber).toBe(1);

    // Identical save
    const second = await recordRevision({
      companyId: 'company-a',
      snapshot: { ...snapshot1 },
      userId: 'user-admin-1',
      client: mockPrisma,
    });

    expect(second.created).toBe(false);
    expect(second.reason).toBe('identical');
    expect(mockRevisions).toHaveLength(1);
    expect(mockRevisions[0].revisionNumber).toBe(1);
  });

  test('4. recordRevision creates sequential revisionNumber on distinct saves', async () => {
    const res1 = await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: { version: 1 } },
      userId: 'user-admin-1',
      client: mockPrisma,
    });
    const res2 = await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: { version: 2 } },
      userId: 'user-editor-2',
      client: mockPrisma,
    });

    expect(res1.revision.revisionNumber).toBe(1);
    expect(res2.revision.revisionNumber).toBe(2);
    expect(mockRevisions).toHaveLength(2);
  });

  test('5. Trimming retention at 30: deletes oldest revisions when count exceeds 30', async () => {
    for (let i = 1; i <= 35; i++) {
      await recordRevision({
        companyId: 'company-a',
        snapshot: { themeId: 'khemet', designTokens: { changeIndex: i } },
        userId: 'user-admin-1',
        client: mockPrisma,
      });
    }

    expect(mockRevisions.length).toBe(MAX_RETAINED_REVISIONS); // 30
    // Oldest retained should be revisionNumber 6, latest should be 35
    const numbers = mockRevisions.map((r) => r.revisionNumber).sort((a, b) => a - b);
    expect(numbers[0]).toBe(6);
    expect(numbers[numbers.length - 1]).toBe(35);
  });

  test('6. getRevisions returns summary list ordered descending by revisionNumber with resolved createdByEmail', async () => {
    await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: { step: 1 } },
      userId: 'user-admin-1',
      note: 'إصدار أول',
      client: mockPrisma,
    });
    await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: { step: 2 } },
      userId: 'user-editor-2',
      note: 'إصدار ثان',
      client: mockPrisma,
    });

    const list = await getRevisions({
      companyId: 'company-a',
      limit: 10,
      client: mockPrisma,
    });

    expect(list).toHaveLength(2);
    expect(list[0].revisionNumber).toBe(2);
    expect(list[0].note).toBe('إصدار ثان');
    expect(list[0].createdByEmail).toBe('editor@example.com');
    expect(list[0].createdByName).toBe('سارة');
    expect(list[0]).not.toHaveProperty('snapshot'); // Lightweight summary without full snapshot

    expect(list[1].revisionNumber).toBe(1);
    expect(list[1].createdByEmail).toBe('admin@example.com');
  });

  test('7. getRevisionById returns full revision for owner company, returns null for different company', async () => {
    const revA = await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: { secret: 'a-tokens' } },
      userId: 'user-admin-1',
      client: mockPrisma,
    });

    const foundForA = await getRevisionById({
      companyId: 'company-a',
      id: revA.revision.id,
      client: mockPrisma,
    });
    expect(foundForA).not.toBeNull();
    expect(foundForA.id).toBe(revA.revision.id);
    expect(foundForA.snapshot).toEqual({
      themeId: 'khemet',
      designTokens: { secret: 'a-tokens' },
    });

    // Cross-tenant access must return null (404)
    const crossCompanyAccess = await getRevisionById({
      companyId: 'company-b',
      id: revA.revision.id,
      client: mockPrisma,
    });
    expect(crossCompanyAccess).toBeNull();
  });

  test('8. restoreRevision writes snapshot to current designTokens AND creates a new revision with note="restore of #N"', async () => {
    // Initial revision #1
    const rev1 = await recordRevision({
      companyId: 'company-a',
      snapshot: {
        themeId: 'khemet-initial',
        designTokens: { header: 'Header v1', sections: ['hero-1'] },
      },
      userId: 'user-admin-1',
      note: 'حالة أولية',
      client: mockPrisma,
    });

    // Revision #2 (broken changes)
    await recordRevision({
      companyId: 'company-a',
      snapshot: {
        themeId: 'broken-theme',
        designTokens: { header: 'Header v2 (broken)', sections: [] },
      },
      userId: 'user-admin-1',
      note: 'تعديلات خاطئة',
      client: mockPrisma,
    });

    expect(mockRevisions).toHaveLength(2);

    // Restore to revision #1
    const restoreResult = await restoreRevision({
      companyId: 'company-a',
      id: rev1.revision.id,
      userId: 'user-admin-1',
      client: mockPrisma,
    });

    expect(restoreResult.ok).toBe(true);
    expect(restoreResult.targetRevision.revisionNumber).toBe(1);

    // Current designTokens must match rev1 designTokens
    expect(mockStorefrontSettings['company-a'].designTokens).toEqual(
      rev1.revision.snapshot.designTokens
    );

    // A new revision (#3) must be created
    expect(mockRevisions).toHaveLength(3);
    const latestRev = mockRevisions[mockRevisions.length - 1];
    expect(latestRev.revisionNumber).toBe(3);
    expect(latestRev.note).toBe('restore of #1');
    expect(latestRev.snapshot).toEqual(rev1.revision.snapshot);
  });

  test('9. restoreRevision rejects cross-company restore with status 404', async () => {
    const revA = await recordRevision({
      companyId: 'company-a',
      snapshot: { themeId: 'khemet', designTokens: {} },
      userId: 'user-admin-1',
      client: mockPrisma,
    });

    const crossRestore = await restoreRevision({
      companyId: 'company-b',
      id: revA.revision.id,
      userId: 'user-admin-2',
      client: mockPrisma,
    });

    expect(crossRestore.ok).toBe(false);
    expect(crossRestore.status).toBe(404);
    expect(crossRestore.message).toBe('Revision not found');
  });
});
