const assert = require("assert");
const { parseIpAllowlist, ipMatchesAllowlist } = require("../utils/ipMatch");
const { classifyGeofenceFailure } = require("../utils/geoUtils");

console.log("Running IP Match and Geofence Failure tests...");

// 1. Exact IP match
const allowlistExact = "192.168.1.50\n10.0.0.1";
assert.strictEqual(ipMatchesAllowlist("192.168.1.50", allowlistExact), true, "Exact IP should match");
assert.strictEqual(ipMatchesAllowlist("10.0.0.1", allowlistExact), true, "Second exact IP should match");

// 2. /24 CIDR match
const allowlistCidr = "192.168.1.0/24\n172.16.0.0/16";
assert.strictEqual(ipMatchesAllowlist("192.168.1.1", allowlistCidr), true, "IP inside /24 subnet should match");
assert.strictEqual(ipMatchesAllowlist("192.168.1.254", allowlistCidr), true, "IP at end of /24 subnet should match");
assert.strictEqual(ipMatchesAllowlist("172.16.50.12", allowlistCidr), true, "IP inside /16 subnet should match");

// 3. Non-match
assert.strictEqual(ipMatchesAllowlist("192.168.2.1", allowlistCidr), false, "IP outside /24 subnet should not match");
assert.strictEqual(ipMatchesAllowlist("10.0.0.5", allowlistExact), false, "Unlisted IP should not match");

// 4. IPv4-mapped ::ffff:1.2.3.4
assert.strictEqual(ipMatchesAllowlist("::ffff:192.168.1.50", allowlistExact), true, "IPv4-mapped IPv6 should match exact IPv4 allowlist");
assert.strictEqual(ipMatchesAllowlist("::ffff:192.168.1.25", allowlistCidr), true, "IPv4-mapped IPv6 should match CIDR allowlist");

const allowlistMapped = "::ffff:1.2.3.4, 10.10.10.0/24";
assert.strictEqual(ipMatchesAllowlist("1.2.3.4", allowlistMapped), true, "IPv4 should match IPv4-mapped allowlist entry");
assert.strictEqual(ipMatchesAllowlist("::ffff:1.2.3.4", allowlistMapped), true, "IPv4-mapped should match IPv4-mapped allowlist entry");

// 5. Invalid input
assert.strictEqual(ipMatchesAllowlist(null, allowlistExact), false, "null IP should return false");
assert.strictEqual(ipMatchesAllowlist("", allowlistExact), false, "empty IP should return false");
assert.strictEqual(ipMatchesAllowlist("not-an-ip", allowlistExact), false, "invalid string IP should return false");
assert.strictEqual(ipMatchesAllowlist("192.168.1.1", null), false, "null allowlist should return false");
assert.strictEqual(ipMatchesAllowlist("192.168.1.1", ""), false, "empty allowlist should return false");
assert.strictEqual(ipMatchesAllowlist("192.168.1.1", "# only comments\n   "), false, "comments-only allowlist should return false");

// 6. classifyGeofenceFailure
const weakResult = classifyGeofenceFailure({
  distance: 3000,
  effectiveDistance: 1500,
  allowedRadius: 200,
  accuracy: 2607,
});
assert.strictEqual(weakResult, "WEAK_ACCURACY", "accuracy 2607 should classify as WEAK_ACCURACY");

const outOfRangeResult = classifyGeofenceFailure({
  distance: 400,
  effectiveDistance: 280,
  allowedRadius: 200,
  accuracy: 120,
});
assert.strictEqual(outOfRangeResult, "OUT_OF_RANGE", "accuracy 120 should classify as OUT_OF_RANGE");

console.log("All tests passed successfully!");
