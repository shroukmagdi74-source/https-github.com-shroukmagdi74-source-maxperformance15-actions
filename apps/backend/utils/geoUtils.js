/**
 * Geolocation Utilities
 * دوال مساعدة للتعامل مع المواقع الجغرافية
 */

/**
 * حساب المسافة بين نقطتين جغرافيتين باستخدام Haversine Formula
 * Calculate distance between two geographic points using Haversine Formula
 * 
 * @param {number} lat1 - خط العرض للنقطة الأولى (Latitude of first point)
 * @param {number} lon1 - خط الطول للنقطة الأولى (Longitude of first point)
 * @param {number} lat2 - خط العرض للنقطة الثانية (Latitude of second point)
 * @param {number} lon2 - خط الطول للنقطة الثانية (Longitude of second point)
 * @returns {number} - المسافة بالمتر (Distance in meters)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // نصف قطر الأرض بالمتر
  // Earth's radius in meters
  const R = 6371e3;

  // تحويل الدرجات إلى راديان
  // Convert degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // المسافة بالمتر
  // Distance in meters
  const distance = R * c;

  return distance;
}

/**
 * التحقق من وجود موقع داخل نطاق معين
 * Check if a location is within a specific radius
 * 
 * @param {number} userLat - خط عرض الموظف (User latitude)
 * @param {number} userLon - خط طول الموظف (User longitude)
 * @param {number} officeLat - خط عرض المكتب (Office latitude)
 * @param {number} officeLon - خط طول المكتب (Office longitude)
 * @param {number} radius - نصف القطر المسموح بالمتر (Allowed radius in meters)
 * @param {number} [userAccuracy=0] - دقة جهاز الموظف بالمتر
 * @returns {Object} - نتيجة التحقق (Validation result)
 */
function isWithinGeofence(userLat, userLon, officeLat, officeLon, radius, userAccuracy = 0) {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
  
  // To handle indoor GPS inaccuracies, we consider the accuracy radius reported by the device.
  // We cap the tolerated accuracy to 1500 meters to prevent spoofing with artificially huge accuracy values.
  const MAX_TOLERATED_ACCURACY = 1500;
  const effectiveAccuracy = Math.min(Number(userAccuracy) || 0, MAX_TOLERATED_ACCURACY);
  
  // The user could realistically be anywhere within 'effectiveAccuracy' meters of the reported point.
  // We check if the office falls within that circle. So we deduct effectiveAccuracy from the distance.
  const effectiveDistance = Math.max(0, distance - effectiveAccuracy);
  
  const isWithin = effectiveDistance <= radius;

  return {
    isWithin,
    distance: distance,
    effectiveDistance: effectiveDistance,
    allowedRadius: radius,
    accuracy: userAccuracy,
    message: isWithin 
      ? `داخل النطاق المسموح (${Math.round(effectiveDistance)} متر)`
      : `خارج النطاق المسموح (${Math.round(effectiveDistance)} متر من ${radius} متر)`
  };
}

/**
 * تنسيق رسالة خطأ عند البصمة خارج النطاق (بدون جملة دقة الـ GPS)
 * Format error message for out-of-range attendance
 * 
 * @param {number} distance - المسافة الحالية (Current distance)
 * @param {number} allowedRadius - النطاق المسموح (Allowed radius)
 * @returns {string} - رسالة الخطأ (Error message)
 */
function formatGeofenceError(distance, allowedRadius, accuracy = 0) {
  const roundedDistance = Math.round(distance);
  const extraDistance = Math.max(0, roundedDistance - allowedRadius);
  
  return `أنت خارج النطاق المسموح للبصمة.\n` +
         `المسافة الحالية: ${roundedDistance} متر\n` +
         `المسافة المسموحة: ${allowedRadius} متر\n` +
         `يجب أن تقترب ${extraDistance} متر من المكتب للبصمة.`;
}

/**
 * تنسيق رسالة خطأ عند ضعف دقة تحديد الموقع GPS
 * Format error message for weak GPS accuracy
 * 
 * @param {number} accuracy - دقة الموقع بالمتر (Accuracy in meters)
 * @returns {string} - رسالة الخطأ (Error message)
 */
function formatWeakAccuracyMessage(accuracy = 0) {
  const roundedAccuracy = Math.round(accuracy || 0);
  return `موقع جهازك تقريبي جدًا (دقة GPS ضعيفة: ${roundedAccuracy} متر).\n` +
         `قد يكون الجهاز مكتبيًا بدون GPS أو خدمة الموقع مقفولة أو غير دقيقة.\n` +
         `يرجى تشغيل الـ Wi-Fi، أو السماح بتحديد الموقع بدقة، أو استخدام تطبيق الموبايل.`;
}

/**
 * تصنيف نوع فشل البصمة الجغرافية
 * Classify geofence failure reason
 * 
 * @param {object} params
 * @param {number} [params.distance]
 * @param {number} [params.effectiveDistance]
 * @param {number} [params.allowedRadius]
 * @param {number} [params.accuracy]
 * @returns {"WEAK_ACCURACY" | "OUT_OF_RANGE"}
 */
function classifyGeofenceFailure({ distance, effectiveDistance, allowedRadius, accuracy } = {}) {
  if (Number(accuracy) > 500) {
    return "WEAK_ACCURACY";
  }
  return "OUT_OF_RANGE";
}

/**
 * التحقق من صحة الإحداثيات الجغرافية
 * Validate geographic coordinates
 * 
 * @param {number} lat - خط العرض (Latitude)
 * @param {number} lon - خط الطول (Longitude)
 * @returns {boolean} - صحة الإحداثيات (Validity)
 */
function isValidCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

module.exports = {
  calculateDistance,
  isWithinGeofence,
  formatGeofenceError,
  formatWeakAccuracyMessage,
  classifyGeofenceFailure,
  isValidCoordinates
};
