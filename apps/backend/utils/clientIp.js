const net = require("net");

/**
 * Helper to strip port from IPv4 or IPv6 string
 * @param {string} rawIp
 * @returns {string}
 */
function stripPort(rawIp) {
  if (!rawIp || typeof rawIp !== "string") return "";
  let ip = rawIp.trim();

  // Bracketed IPv6 e.g. [2001:db8::1]:8080 or [::1]
  if (ip.startsWith("[")) {
    const closing = ip.indexOf("]");
    if (closing !== -1) {
      ip = ip.substring(1, closing);
    }
  } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(ip)) {
    // IPv4 with port e.g. 192.168.1.1:8080
    ip = ip.split(":")[0];
  }

  return ip.trim();
}

/**
 * Validate and clean an IP candidate
 * @param {string} raw
 * @returns {string|null}
 */
function cleanAndValidateIp(raw) {
  if (!raw || typeof raw !== "string") return null;
  const stripped = stripPort(raw);
  if (net.isIP(stripped)) {
    return stripped;
  }
  return null;
}

/**
 * Extract client IP from request
 * Prefers x-real-ip, then first entry of x-forwarded-for, then req.ip
 * @param {object} req
 * @returns {string|null}
 */
function getClientIp(req) {
  if (!req) return null;
  const headers = req.headers || {};

  // 1. Prefer x-real-ip
  if (headers["x-real-ip"]) {
    const raw = typeof headers["x-real-ip"] === "string"
      ? headers["x-real-ip"]
      : headers["x-real-ip"][0];
    const ip = cleanAndValidateIp(raw);
    if (ip) return ip;
  }

  // 2. First entry of x-forwarded-for
  if (headers["x-forwarded-for"]) {
    const rawXff = headers["x-forwarded-for"];
    const first = (Array.isArray(rawXff) ? rawXff[0] : String(rawXff)).split(",")[0];
    const ip = cleanAndValidateIp(first);
    if (ip) return ip;
  }

  // 3. req.ip
  if (req.ip) {
    const ip = cleanAndValidateIp(req.ip);
    if (ip) return ip;
  }

  // 4. req.socket fallback
  if (req.socket && req.socket.remoteAddress) {
    const ip = cleanAndValidateIp(req.socket.remoteAddress);
    if (ip) return ip;
  }

  return null;
}

/**
 * Detect device type from User-Agent string
 * @param {string} userAgent
 * @returns {"DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN"}
 */
function detectDeviceType(userAgent) {
  if (!userAgent || typeof userAgent !== "string") {
    return "UNKNOWN";
  }
  const ua = userAgent.toLowerCase();

  // Tablets
  if (/ipad|tablet|(android(?!.*mobile))|playbook|silk|kindle/i.test(ua)) {
    return "TABLET";
  }

  // Mobile
  if (/mobi|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(ua)) {
    return "MOBILE";
  }

  // Desktop
  if (/windows nt|macintosh|mac os x|linux|cros|x11/i.test(ua)) {
    return "DESKTOP";
  }

  return "UNKNOWN";
}

module.exports = {
  getClientIp,
  detectDeviceType,
  stripPort,
};
