const mockPrisma = {
  whatsAppSession: {
    findFirst: jest.fn()
  },
  whatsAppContact: {
    findFirst: jest.fn()
  }
};

jest.mock('../../../services/sharedDatabase', () => ({
  getSharedPrismaClient: jest.fn(() => mockPrisma),
  safeQuery: jest.fn((op) => op())
}));

const { getOrAssignSession } = require('../../../services/whatsapp/sessionBalancer');

describe('Session Balancer Fallback to Single/Default DB Session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns single connected or default session when connectedSessions is empty', async () => {
    mockPrisma.whatsAppSession.findFirst.mockResolvedValueOnce({ id: 'sess-single-default' });

    const sessionId = await getOrAssignSession({
      companyId: 'comp-single',
      connectedSessions: [],
      settings: {}
    });

    expect(sessionId).toBe('sess-single-default');
    expect(mockPrisma.whatsAppSession.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: 'comp-single', isDefault: true })
      })
    );
  });
});
