const mockPrisma = {
  competitor: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn(async (operation) => operation()),
}));

const CompetitorService = require('../../services/competitorService');
const CompetitorEncryptionService = require('../../services/competitorEncryptionService');

describe('Competitor Encrypted Credentials Management (Package E)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encrypts password using AES-GCM and records SET action in auditLog', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: {},
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockImplementation(({ data }) => Promise.resolve({
      id: 'comp-1',
      metadata: data.metadata,
    }));

    const result = await CompetitorService.setCredentials('company-1', 'comp-1', {
      username: 'shopper_agent',
      password: 'superSecretPassword123!',
      notes: 'حساب مراقبة أسعار سري',
    }, { id: 'admin-1', email: 'admin@company.com' });

    expect(result).toBeDefined();
    expect(result.hasCredentials).toBe(true);
    expect(result.username).toBe('shopper_agent');
    // Ensure plain password is NOT returned in result
    expect(result.password).toBeUndefined();

    // Verify database update received encrypted payload (not plain text)
    const updateCall = mockPrisma.competitor.update.mock.calls[0][0];
    const storedCreds = updateCall.data.metadata.credentials;
    expect(storedCreds.encryptedPassword).toBeDefined();
    expect(storedCreds.encryptedPassword).not.toBe('superSecretPassword123!');
    expect(storedCreds.auditLog[0].action).toBe('SET');

    // Server-side decrypt verification
    const decrypted = CompetitorEncryptionService.decryptField(storedCreds.encryptedPassword);
    expect(decrypted).toBe('superSecretPassword123!');
  });

  it('CRITICAL ACCEPTANCE LAW: getCredentials NEVER returns password or encrypted string in response', async () => {
    const encrypted = CompetitorEncryptionService.encryptField('superSecretPassword123!');
    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: {
        credentials: {
          username: 'shopper_agent',
          encryptedPassword: encrypted,
          notes: 'حساب مراقبة أسعار سري',
          lastUsedAt: '2026-11-20T10:00:00.000Z',
          auditLog: [{ action: 'SET', timestamp: '2026-11-20T10:00:00.000Z' }],
        },
      },
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockResolvedValue({ id: 'comp-1' });

    const response = await CompetitorService.getCredentials('company-1', 'comp-1', { id: 'admin-1' });

    expect(response).toBeDefined();
    expect(response.hasCredentials).toBe(true);
    expect(response.username).toBe('shopper_agent');
    expect(response.notes).toBe('حساب مراقبة أسعار سري');
    // STRICT RED LINE CHECK:
    expect(response.password).toBeUndefined();
    expect(response.encryptedPassword).toBeUndefined();
    expect(JSON.stringify(response)).not.toContain('superSecretPassword123!');
    expect(JSON.stringify(response)).not.toContain(encrypted);

    // Verify access audit entry was added
    expect(mockPrisma.competitor.update).toHaveBeenCalled();
  });

  it('deletes credentials and logs DELETE action in audit trail', async () => {
    const mockCompetitor = {
      id: 'comp-1',
      companyId: 'company-1',
      metadata: {
        credentials: {
          username: 'shopper_agent',
          encryptedPassword: 'enc',
          auditLog: [],
        },
      },
    };

    mockPrisma.competitor.findFirst.mockResolvedValue(mockCompetitor);
    mockPrisma.competitor.update.mockResolvedValue({ id: 'comp-1' });

    const ok = await CompetitorService.deleteCredentials('company-1', 'comp-1', { id: 'admin-1' });

    expect(ok).toBe(true);
    const updateCall = mockPrisma.competitor.update.mock.calls[0][0];
    expect(updateCall.data.metadata.credentials.hasCredentials).toBe(false);
    expect(updateCall.data.metadata.credentials.encryptedPassword).toBeUndefined();
    expect(updateCall.data.metadata.credentials.auditLog).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: 'DELETE' })])
    );
  });
});
