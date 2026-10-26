/**
 * اختبار استخراج IP العميل خلف nginx + Cloudflare
 * node apps/backend/tests/client_ip.test.js
 */
const assert = require("assert");
const { getClientIp, isCloudflareIp } = require("../utils/clientIp");

const req = (headers, extra = {}) => ({ headers, ...extra });

// 1) Cloudflare edge in front: last hop is CF, real client is the first hop
assert.strictEqual(
  getClientIp(req({ "x-forwarded-for": "154.180.55.239, 172.71.141.30" })),
  "154.180.55.239",
);
console.log("✅ CF chain → real client (first hop)");

// 2) cf-connecting-ip wins when present and not a CF address
assert.strictEqual(
  getClientIp(
    req({
      "x-forwarded-for": "154.180.55.239, 162.159.122.193",
      "cf-connecting-ip": "154.180.55.239",
    }),
  ),
  "154.180.55.239",
);
console.log("✅ cf-connecting-ip used behind CF");

// 3) Direct request straight to nginx: last hop is the real client
assert.strictEqual(
  getClientIp(req({ "x-forwarded-for": "41.33.10.5" })),
  "41.33.10.5",
);
console.log("✅ direct → last hop");

// 4) Spoofed XFF with a non-CF last hop must not win
assert.strictEqual(
  getClientIp(req({ "x-forwarded-for": "154.180.55.239, 41.33.10.5" })),
  "41.33.10.5",
);
console.log("✅ spoofed first hop ignored (last hop is not Cloudflare)");

// 5) No XFF → x-real-ip
assert.strictEqual(
  getClientIp(req({ "x-real-ip": "154.180.55.239" })),
  "154.180.55.239",
);
console.log("✅ no XFF → x-real-ip");

// 6) IPv6 Cloudflare edge as last hop → first hop is the client
assert.strictEqual(
  getClientIp(req({ "x-forwarded-for": "154.180.55.239, 2606:4700::6810:1234" })),
  "154.180.55.239",
);
console.log("✅ IPv6 CF edge recognised");

// 7) Ranges
assert.strictEqual(isCloudflareIp("172.71.141.30"), true);
assert.strictEqual(isCloudflareIp("162.159.122.193"), true);
assert.strictEqual(isCloudflareIp("154.180.55.239"), false);
assert.strictEqual(isCloudflareIp("2606:4700::1"), true);
console.log("✅ Cloudflare range detection");

console.log("\nAll client IP tests passed.");
