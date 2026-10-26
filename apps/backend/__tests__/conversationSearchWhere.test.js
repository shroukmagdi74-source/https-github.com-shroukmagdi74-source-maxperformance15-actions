const {
  extractContentTokens,
  buildConversationSearchWhere,
} = require('../controller/conversation/conversationSearchWhere');

describe('conversationSearchWhere', () => {
  describe('buildConversationSearchWhere', () => {
    it("buildConversationSearchWhere('') and ('   ') → null", () => {
      expect(buildConversationSearchWhere('')).toBeNull();
      expect(buildConversationSearchWhere('   ')).toBeNull();
      expect(buildConversationSearchWhere(null)).toBeNull();
      expect(buildConversationSearchWhere(undefined)).toBeNull();
    });

    it("buildConversationSearchWhere('ahmed') → one OR group with exactly 4 branches; the three text branches carry mode: 'insensitive', the phone branch does not", () => {
      const result = buildConversationSearchWhere('ahmed');
      expect(result).toBeDefined();
      expect(result.AND).toBeDefined();
      expect(result.AND).toHaveLength(1);

      const orBranches = result.AND[0].OR;
      expect(orBranches).toHaveLength(4);

      const preview = orBranches.find((b) => b.lastMessagePreview);
      const firstName = orBranches.find((b) => b.customer && b.customer.firstName);
      const lastName = orBranches.find((b) => b.customer && b.customer.lastName);
      const phone = orBranches.find((b) => b.customer && b.customer.phone);

      expect(preview).toEqual({
        lastMessagePreview: { contains: 'ahmed', mode: 'insensitive' },
      });
      expect(firstName).toEqual({
        customer: { firstName: { contains: 'ahmed', mode: 'insensitive' } },
      });
      expect(lastName).toEqual({
        customer: { lastName: { contains: 'ahmed', mode: 'insensitive' } },
      });
      expect(phone).toEqual({
        customer: { phone: { contains: 'ahmed' } },
      });
      expect(phone.customer.phone.mode).toBeUndefined();
    });

    it("buildConversationSearchWhere('Menna Mansour') → two OR groups inside AND (firstName Menna, lastName Mansour)", () => {
      const result = buildConversationSearchWhere('Menna Mansour');
      expect(result).toBeDefined();
      expect(result.AND).toHaveLength(2);

      const group1 = result.AND[0].OR;
      const group2 = result.AND[1].OR;

      expect(group1).toHaveLength(4);
      expect(group2).toHaveLength(4);

      expect(group1.some((b) => b.customer?.firstName?.contains === 'Menna' && b.customer?.firstName?.mode === 'insensitive')).toBe(true);
      expect(group2.some((b) => b.customer?.lastName?.contains === 'Mansour' && b.customer?.lastName?.mode === 'insensitive')).toBe(true);
    });

    it('no branch anywhere is a messages relation filter', () => {
      const result1 = buildConversationSearchWhere('ahmed');
      const result2 = buildConversationSearchWhere('Menna Mansour');

      const containsMessagesRelation = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        if (Object.prototype.hasOwnProperty.call(obj, 'messages')) return true;
        return Object.values(obj).some((val) => containsMessagesRelation(val));
      };

      expect(containsMessagesRelation(result1)).toBe(false);
      expect(containsMessagesRelation(result2)).toBe(false);
      expect(JSON.stringify(result2)).not.toContain('"messages"');
    });
  });

  describe('extractContentTokens', () => {
    it("extractContentTokens('ab cd') → []", () => {
      expect(extractContentTokens('ab cd')).toEqual([]);
    });

    it("extractContentTokens drops tokens under 3 chars ('ahmed mo') → ['ahmed'] and keeps 3+ chars for pg_trgm", () => {
      expect(extractContentTokens('ahmed mo')).toEqual(['ahmed']);
      // 'moh' has length 3, fulfilling the pg_trgm >= 3 requirement
      const mohResult = extractContentTokens('ahmed moh');
      expect(mohResult).toEqual(['ahmed', 'moh']);
    });

    it("extractContentTokens('menna mansour') → both", () => {
      expect(extractContentTokens('menna mansour')).toEqual(['menna', 'mansour']);
    });

    it('returns empty array for empty / whitespace / non-string input', () => {
      expect(extractContentTokens('')).toEqual([]);
      expect(extractContentTokens('   ')).toEqual([]);
      expect(extractContentTokens(null)).toEqual([]);
      expect(extractContentTokens(undefined)).toEqual([]);
    });
  });
});
