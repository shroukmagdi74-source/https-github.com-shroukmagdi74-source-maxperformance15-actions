/**
 * IP Matching Utilities
 * Supports exact IPv4, CIDR (/8.../32), IPv4-mapped IPv6 (::ffff:1.2.3.4)
 * Separators: newline, comma, space. Ignores blanks and '#' comments.
 * Pure functions, zero dependencies.
 */

/**
 * Normalizes an IP string to standard IPv4 representation (e.g. '192.168.1.1').
 * Strips IPv4-mapped IPv6 prefix (::ffff:).
 * Returns null if not a valid IPv4.
 * @param {string} ip
 * @returns {string|null}
 */
function normalizeToIpv4(ip) {
  if (!ip || typeof ip !== "string") return null;
  let s = ip.trim().toLowerCase();

  // Strip brackets if any
  if (s.startsWith("[") && s.endsWith("]")) {
    s = s.slice(1, -1);
  }

  // Handle IPv4-mapped IPv6 e.g. ::ffff:192.168.1.1
  if (s.startsWith("::ffff:")) {
    s = s.substring(7);
  }

  const parts = s.split(".");
  if (parts.length !== 4) return null;

  for (let i = 0; i < 4; i++) {
    const part = parts[i];
    if (!/^\d+$/.test(part)) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
  }

  return parts.map(Number).join(".");
}

/**
 * Convert valid IPv4 string to 32-bit unsigned integer
 * @param {string} ip
 * @returns {number}
 */
function ipv4ToInt(ip) {
  return ip.split(".").reduce((acc, octet) => ((acc << 8) + Number(octet)) >>> 0, 0);
}

/**
 * Parse IP allowlist text into structured rule objects.
 * Separators: newline, comma, space.
 * Ignores empty tokens and '#' comments.
 * @param {string} text
 * @returns {Array<object>}
 */
function parseIpAllowlist(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const rules = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    // Strip comment after '#'
    const commentIdx = line.indexOf("#");
    const cleanLine = commentIdx !== -1 ? line.substring(0, commentIdx) : line;

    // Split by comma and whitespace
    const tokens = cleanLine.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);

    for (const token of tokens) {
      if (token.includes("/")) {
        // CIDR notation
        const [rawBase, rawPrefix] = token.split("/");
        const baseIp = normalizeToIpv4(rawBase);
        const prefix = Number(rawPrefix);

        if (baseIp && Number.isInteger(prefix) && prefix >= 8 && prefix <= 32) {
          const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
          const baseInt = (ipv4ToInt(baseIp) & mask) >>> 0;
          rules.push({
            raw: token,
            type: "CIDR",
            baseIp,
            prefix,
            mask,
            baseInt,
          });
        }
      } else {
        // Exact IP
        const normalized = normalizeToIpv4(token);
        if (normalized) {
          rules.push({
            raw: token,
            type: "EXACT",
            ip: normalized,
            ipInt: ipv4ToInt(normalized),
          });
        }
      }
    }
  }

  return rules;
}

/**
 * Test if an IP matches an allowlist (either raw text or pre-parsed rules).
 * @param {string} ip
 * @param {string|Array<object>} textOrRules
 * @returns {boolean}
 */
function ipMatchesAllowlist(ip, textOrRules) {
  const normalizedIp = normalizeToIpv4(ip);
  if (!normalizedIp) {
    return false;
  }

  const rules = Array.isArray(textOrRules)
    ? textOrRules
    : parseIpAllowlist(textOrRules);

  if (rules.length === 0) {
    return false;
  }

  const testInt = ipv4ToInt(normalizedIp);

  for (const rule of rules) {
    if (rule.type === "EXACT") {
      if (testInt === rule.ipInt) {
        return true;
      }
    } else if (rule.type === "CIDR") {
      if (((testInt & rule.mask) >>> 0) === rule.baseInt) {
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  normalizeToIpv4,
  ipv4ToInt,
  parseIpAllowlist,
  ipMatchesAllowlist,
};
