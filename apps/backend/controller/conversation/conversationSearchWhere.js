/**
 * conversationSearchWhere.js
 * Pure helper module for conversation search where-clause generation
 * and content token extraction.
 */

/**
 * Extracts tokens eligible for trigram-indexed message content search (length >= 3).
 * @param {string|unknown} rawTerm
 * @returns {string[]}
 */
function extractContentTokens(rawTerm) {
    const term = String(rawTerm ?? '').trim();
    if (!term) {
        return [];
    }
    return term.split(/\s+/).filter(t => t.length >= 3);
}

/**
 * Builds Prisma where fragment for conversation search across preview, name, and phone.
 * @param {string|unknown} rawTerm
 * @returns {object|null}
 */
function buildConversationSearchWhere(rawTerm) {
    if (rawTerm === null || rawTerm === undefined) {
        return null;
    }
    const term = String(rawTerm).trim();
    if (!term) {
        return null;
    }

    let tokens = term.split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length === 0) {
        tokens = [term];
    }

    const andGroups = tokens.map(token => ({
        OR: [
            { lastMessagePreview: { contains: token, mode: 'insensitive' } },
            { customer: { firstName: { contains: token, mode: 'insensitive' } } },
            { customer: { lastName: { contains: token, mode: 'insensitive' } } },
            { customer: { phone: { contains: token } } },
        ]
    }));

    return { AND: andGroups };
}

module.exports = {
    extractContentTokens,
    buildConversationSearchWhere,
};
