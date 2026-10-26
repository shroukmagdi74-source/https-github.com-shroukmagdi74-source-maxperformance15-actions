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

// Cloudflare edge ranges (https://www.cloudflare.com/ips/).
// Used to recognise that the LAST X-Forwarded-For hop is Cloudflare's edge,
// which means the real client is the first hop Cloudflare wrote.
const CLOUDFLARE_V4 = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

const CLOUDFLARE_V6 = [
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

function ipv4ToInt(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function ipv6ToBigInt(ip) {
  const addr = ip;
  if (addr.includes(".")) return null;
  const halves = addr.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 ? (halves[1] ? halves[1].split(":") : []) : null;
  let parts;
  if (tail === null) {
    parts = head;
  } else {
    const missing = 8 - head.length - tail.length;
    if (missing < 0) return null;
    parts = [...head, ...Array(missing).fill("0"), ...tail];
  }
  if (parts.length !== 8) return null;
  let value = 0n;
  for (const part of parts) {
    const n = parseInt(part, 16);
    if (Number.isNaN(n) || n < 0 || n > 0xffff) return null;
    value = (value << 16n) + BigInt(n);
  }
  return value;
}

function ipv4InCidr(ip, cidr) {
  const [base, bitsRaw] = cidr.split("/");
  const bits = Number(bitsRaw);
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~(0xffffffff >>> bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

function ipv6InCidr(ip, cidr) {
  const [base, bitsRaw] = cidr.split("/");
  const bits = Number(bitsRaw);
  const ipInt = ipv6ToBigInt(ip);
  const baseInt = ipv6ToBigInt(base);
  if (ipInt === null || baseInt === null) return false;
  if (bits === 0) return true;
  const shift = BigInt(128 - bits);
  return ipInt >> shift === baseInt >> shift;
}

/**
 * Is this address a Cloudflare edge/proxy address?
 * @param {string} ip
 * @returns {boolean}
 */
function isCloudflareIp(ip) {
  const clean = cleanAndValidateIp(ip);
  if (!clean) return false;
  const version = net.isIP(clean);
  if (version === 4) {
    return CLOUDFLARE_V4.some((cidr) => ipv4InCidr(clean, cidr));
  }
  if (version === 6) {
    const mapped = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i.exec(clean);
    if (mapped) {
      return CLOUDFLARE_V4.some((cidr) => ipv4InCidr(mapped[1], cidr));
    }
    return CLOUDFLARE_V6.some((cidr) => ipv6InCidr(clean, cidr));
  }
  return false;
}

function firstHeaderValue(value) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Extract the real client IP from a request that sits behind nginx and (usually)
 * Cloudflare.
 *
 * Chain: client -> Cloudflare edge -> nginx -> node.
 *  - nginx appends the address it actually saw ($proxy_add_x_forwarded_for),
 *    so the LAST X-Forwarded-For hop is the trustworthy one.
 *  - When that last hop is a Cloudflare address, the real client is the first
 *    hop Cloudflare wrote (or cf-connecting-ip).
 *  - Otherwise the request reached nginx directly, so the last hop IS the client.
 *
 * @param {object} req
 * @returns {string|null}
 */
function getClientIp(req) {
  if (!req) return null;
  const headers = req.headers || {};

  const xffRaw = headers["x-forwarded-for"];
  const xff = String(Array.isArray(xffRaw) ? xffRaw.join(",") : xffRaw || "")
    .split(",")
    .map((value) => cleanAndValidateIp(value))
    .filter(Boolean);

  if (xff.length > 0) {
    const lastHop = xff[xff.length - 1];

    if (isCloudflareIp(lastHop)) {
      const cfIp = cleanAndValidateIp(firstHeaderValue(headers["cf-connecting-ip"]));
      if (cfIp && !isCloudflareIp(cfIp)) return cfIp;
      if (xff.length > 1) return xff[0];
      return lastHop;
    }

    return lastHop;
  }

  const realIp = cleanAndValidateIp(firstHeaderValue(headers["x-real-ip"]));
  if (realIp) return realIp;

  if (req.ip) {
    const ip = cleanAndValidateIp(req.ip);
    if (ip) return ip;
  }

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

  if (/ipad|tablet|(android(?!.*mobile))|playbook|silk|kindle/i.test(ua)) {
    return "TABLET";
  }

  if (/mobi|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop|windows phone/i.test(ua)) {
    return "MOBILE";
  }

  if (/windows nt|macintosh|mac os x|linux|cros|x11/i.test(ua)) {
    return "DESKTOP";
  }

  return "UNKNOWN";
}

module.exports = {
  getClientIp,
  detectDeviceType,
  stripPort,
  isCloudflareIp,
};
