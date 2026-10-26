/**
 * اختبار منطق التحقق من البصمة (بدون قاعدة بيانات)
 * node apps/backend/tests/attendance_verification.test.js
 */
const assert = require("assert");

process.env.POSTGRES_URL =
  process.env.POSTGRES_URL || "postgresql://u:p@127.0.0.1:5432/maxp_test";
process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.POSTGRES_URL;

const service = require("../services/hr/attendanceService");

const OFFICE = { lat: 31.21155, lng: 29.96625 };

const rows = [];
const fakePrisma = {
  hrAttendanceAttempt: {
    create: async ({ data }) => {
      const row = { id: `attempt-${rows.length + 1}`, ...data };
      rows.push(row);
      return row;
    },
    update: async () => ({}),
  },
};

Object.defineProperty(service, "prisma", {
  value: fakePrisma,
  configurable: true,
});

const baseSettings = {
  geofenceEnabled: true,
  officeLatitude: OFFICE.lat,
  officeLongitude: OFFICE.lng,
  geofenceRadius: 250,
  branchNetworkEnabled: false,
  branchIpAllowlist: null,
  allowRemoteCheckIn: false,
};

const locationAt = (meters, accuracy) => ({
  // ~1 degree latitude = 111_320 m
  latitude: OFFICE.lat + meters / 111320,
  longitude: OFFICE.lng,
  accuracy,
});

const call = ({ hrSettings, ...overrides } = {}) =>
  service._verifyPunch({
    companyId: "c1",
    userId: "u1",
    action: "CHECK_IN",
    data: { method: "self_service", workMode: "OFFICE" },
    context: { ip: "41.33.10.5", userAgent: "Mozilla/5.0 (Windows NT 10.0)", deviceType: "DESKTOP", actorRole: "AGENT" },
    attendanceDate: new Date("2026-10-19T00:00:00.000Z"),
    ...overrides,
    hrSettings: { ...baseSettings, ...(hrSettings || {}) },
  });

(async () => {
  // 1) داخل النطاق → SUCCESS عبر النطاق
  let res = await call({ data: { method: "self_service", workMode: "OFFICE", location: locationAt(80, 100) } });
  assert.strictEqual(res.method, "self_service");
  assert.strictEqual(rows.at(-1).result, "SUCCESS");
  assert.strictEqual(rows.at(-1).reason, "inside_geofence");
  console.log("✅ inside geofence → SUCCESS");

  // 2) بعيد ودقة ضعيفة (2607) → WEAK_ACCURACY + المحاولة متسجلة بالأرقام والـIP
  const farWeak = locationAt(2900, 2607);
  await assert.rejects(
    () => call({ data: { method: "self_service", workMode: "OFFICE", location: farWeak } }),
    (err) => {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.geofenceData.failure, "WEAK_ACCURACY");
      assert.ok(err.geofenceData.attemptId);
      return true;
    },
  );
  const weakRow = rows.at(-1);
  assert.strictEqual(weakRow.result, "WEAK_ACCURACY");
  assert.strictEqual(weakRow.clientIp, "41.33.10.5");
  assert.strictEqual(weakRow.deviceType, "DESKTOP");
  assert.ok(weakRow.distanceMeters >= 2800);
  assert.strictEqual(weakRow.accuracyMeters, 2607);
  console.log("✅ far + weak accuracy → WEAK_ACCURACY logged with distance/accuracy/IP");

  // 3) بعيد بدقة معقولة → GEOFENCE_FAILED + رسالة خارج النطاق
  await assert.rejects(
    () => call({ data: { method: "self_service", workMode: "OFFICE", location: locationAt(1200, 40) } }),
    (err) => {
      assert.strictEqual(err.geofenceData.failure, "OUT_OF_RANGE");
      assert.ok(!/ضعيفة/.test(err.message), "out-of-range message must not mention weak GPS");
      return true;
    },
  );
  assert.strictEqual(rows.at(-1).result, "GEOFENCE_FAILED");
  console.log("✅ far + good accuracy → OUT_OF_RANGE, message has no weak-GPS sentence");

  // 4) شبكة الفرع → SUCCESS عبر الشبكة حتى بدون موقع
  res = await call({
    hrSettings: { branchNetworkEnabled: true, branchIpAllowlist: "41.33.0.0/16\n196.210.10.5" },
  });
  assert.strictEqual(res.method, "network");
  assert.strictEqual(rows.at(-1).branchIpMatch, true);
  console.log("✅ branch network IP → SUCCESS without GPS");

  // 5) HOME بدون سماح → لا يعفي، يتحقق جغرافيًا ويرفض
  await assert.rejects(
    () => call({
      data: { method: "self_service", workMode: "HOME", location: locationAt(3000, 60) },
    }),
    (err) => {
      assert.strictEqual(err.geofenceData.failure, "OUT_OF_RANGE");
      return true;
    },
  );
  console.log("✅ HOME without allowRemoteCheckIn is still geofenced");

  // 6) HOME مع السماح → SUCCESS
  res = await call({
    data: { method: "self_service", workMode: "HOME" },
    hrSettings: { allowRemoteCheckIn: true },
  });
  assert.strictEqual(res.method, "home");
  console.log("✅ HOME with allowRemoteCheckIn → SUCCESS");

  // 7) manual من موظف عادي → لا يعفي
  await assert.rejects(
    () => call({ data: { method: "manual", workMode: "OFFICE", location: locationAt(3000, 60) } }),
    (err) => err.geofenceData?.failure === "OUT_OF_RANGE",
  );
  console.log("✅ manual from non-admin is geofenced (no client-side bypass)");

  // 8) manual من مدير → SUCCESS
  res = await call({
    data: { method: "manual", workMode: "OFFICE" },
    context: { ip: "41.33.10.5", userAgent: "x", deviceType: "DESKTOP", actorRole: "MANAGER" },
  });
  assert.strictEqual(res.method, "manual");
  console.log("✅ manual from MANAGER → SUCCESS");

  // 9) مفيش موقع ودقة غير معروفة → LOCATION_MISSING مع IP
  await assert.rejects(
    () => call({ data: { method: "self_service", workMode: "OFFICE", location: null } }),
    (err) => err.geofenceData?.requiresLocation === true,
  );
  assert.strictEqual(rows.at(-1).result, "LOCATION_MISSING");
  assert.strictEqual(rows.at(-1).clientIp, "41.33.10.5");
  console.log("✅ missing location → LOCATION_MISSING logged");

  console.log("\nAll attendance verification tests passed.");
})().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
