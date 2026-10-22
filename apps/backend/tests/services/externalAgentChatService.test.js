/**
 * Tests for externalAgentChatService and Developer API Agent integration.
 */
const externalAgentChatService = require('../../services/externalAgentChatService');
const developerApiService = require('../../services/developerApiService');

describe('External Agent Chat Service & Developer API Scopes', () => {
  describe('Developer API Scope Definitions', () => {
    it('should include agents:read and agents:chat in scope definitions', () => {
      const keys = developerApiService.SCOPE_DEFINITIONS.map((s) => s.key);
      expect(keys).toContain('agents:read');
      expect(keys).toContain('agents:chat');
    });

    it('should include agents:read and agents:chat in default scopes', () => {
      expect(developerApiService.DEFAULT_SCOPE_KEYS).toContain('agents:read');
      expect(developerApiService.DEFAULT_SCOPE_KEYS).toContain('agents:chat');
    });
  });

  describe('listCompanyAgents', () => {
    it('should list agents with baseline specialists and marked default copilot', async () => {
      const result = await externalAgentChatService.listCompanyAgents('test-company-123');
      expect(result).toBeDefined();
      expect(result.defaultAgentSlug).toBeDefined();
      expect(Array.isArray(result.agents)).toBe(true);
      expect(result.agents.length).toBeGreaterThan(0);

      const defaultAgent = result.agents.find((a) => a.isDefault);
      expect(defaultAgent).toBeDefined();
      expect(defaultAgent.slug).toBe(result.defaultAgentSlug);
    });
  });

  describe('sendAgentMessage input validation', () => {
    it('should reject when message and images are both empty', async () => {
      await expect(
        externalAgentChatService.sendAgentMessage({
          companyId: 'test-company-123',
          credential: { id: 'cred_1', name: 'Test Key' },
          message: '   ',
          images: [],
        })
      ).rejects.toThrow('الرسالة أو المرفقات مطلوبة');
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty messages if sessionId is not provided', async () => {
      const result = await externalAgentChatService.getSessionHistory({
        companyId: 'test-company-123',
        sessionId: null,
      });
      expect(result).toEqual({ sessionId: null, messages: [] });
    });
  });
});
