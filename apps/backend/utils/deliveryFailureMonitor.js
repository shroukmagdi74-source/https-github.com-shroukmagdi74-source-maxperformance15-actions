/**
 * deliveryFailureMonitor.js
 * مراقبة معدل فشل تسليم الرسائل الصادرة على فيسبوك وإرسال تنبيهات تلقائية
 */

const telegramAlertService = require('../services/telegramAlertService');

class DeliveryFailureMonitor {
  constructor() {
    this.attempts = []; // Sliding window of attempts: { timestamp, success, error, companyId }
    this.windowMs = 60 * 60 * 1000; // 1 hour sliding window
    this.minAttemptsForAlert = 10; // Minimum attempts before triggering alerts
    this.failureRateThreshold = 0.01; // 1% threshold
    this.lastAlertAt = 0;
    this.alertCooldownMs = 30 * 60 * 1000; // Alert at most once per 30 minutes
  }

  /**
   * Prunes attempts older than the sliding window (1 hour)
   */
  _prune() {
    const cutoff = Date.now() - this.windowMs;
    this.attempts = this.attempts.filter((a) => a.timestamp >= cutoff);
  }

  /**
   * Record a delivery attempt (accepts either an object or positional arguments)
   * @param {Object|string|boolean} param0 Options object or companyId or success boolean
   * @param {boolean|string} [arg1] success boolean or error string
   * @param {string} [arg2] error string or companyId
   * @param {string} [arg3] messageId
   */
  recordDeliveryAttempt(param0, arg1, arg2, arg3) {
    let channel = 'FACEBOOK';
    let success = false;
    let error = null;
    let companyId = null;
    let messageId = null;

    if (param0 && typeof param0 === 'object' && !Array.isArray(param0)) {
      channel = param0.channel || 'FACEBOOK';
      success = Boolean(param0.success);
      error = param0.error;
      companyId = param0.companyId;
      messageId = param0.messageId;
    } else if (typeof param0 === 'boolean') {
      success = param0;
      error = arg1;
      companyId = arg2;
      messageId = arg3;
    } else {
      companyId = param0;
      success = Boolean(arg1);
      error = arg2;
      messageId = arg3;
    }

    const normalizedChannel = String(channel || 'FACEBOOK').toUpperCase();
    if (normalizedChannel !== 'FACEBOOK') {
      return;
    }

    const now = Date.now();
    this.attempts.push({
      timestamp: now,
      success: Boolean(success),
      error: error ? String(error) : null,
      companyId: companyId || null,
      messageId: messageId || null,
    });

    this._prune();

    // Check failure rate
    this._checkAndAlert();
  }

  /**
   * Check failure rate and send Telegram alert if threshold exceeded
   */
  async _checkAndAlert() {
    const stats = this.getDeliveryStats();
    if (stats.totalAttempts < this.minAttemptsForAlert) {
      return;
    }

    if (stats.failureRate > this.failureRateThreshold) {
      const now = Date.now();
      if (now - this.lastAlertAt < this.alertCooldownMs) {
        // In cooldown period
        return;
      }

      this.lastAlertAt = now;
      const ratePct = (stats.failureRate * 100).toFixed(2);
      const alertMsg = [
        `⚠️ *ارتفاع نسبة فشل تسليم رسائل فيسبوك*`,
        `• نسبة الفشل في آخر ساعة: *${ratePct}%* (الحد الأقصى المسموح: 1%)`,
        `• إجمالي المحاولات: ${stats.totalAttempts}`,
        `• الرسائل الفاشلة: ${stats.failedAttempts}`,
        `• الرسائل الناجحة: ${stats.successfulAttempts}`,
        stats.lastError ? `• آخر خطأ مسجل: \`${stats.lastError}\`` : null,
        `• الوقت: ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`
      ].filter(Boolean).join('\n');

      try {
        console.warn(`🚨 [DELIVERY-MONITOR] High delivery failure rate (${ratePct}%). Sending Telegram alert...`);
        await telegramAlertService.sendAlert(alertMsg);
      } catch (err) {
        console.error('❌ [DELIVERY-MONITOR] Failed to send Telegram alert:', err.message);
      }
    }
  }

  /**
   * Get current delivery statistics for the last 1 hour
   */
  getDeliveryStats() {
    this._prune();
    const totalAttempts = this.attempts.length;
    const failedAttempts = this.attempts.filter((a) => !a.success).length;
    const successfulAttempts = totalAttempts - failedAttempts;
    const failureRate = totalAttempts > 0 ? failedAttempts / totalAttempts : 0;
    const lastFailed = [...this.attempts].reverse().find((a) => !a.success);

    return {
      totalAttempts,
      failedAttempts,
      successfulAttempts,
      failureRate,
      failureRatePercentage: (failureRate * 100).toFixed(2),
      lastError: lastFailed?.error || null,
      windowMinutes: 60,
    };
  }

  /**
   * Reset stats (for testing)
   */
  reset() {
    this.attempts = [];
    this.lastAlertAt = 0;
  }
}

const deliveryFailureMonitor = new DeliveryFailureMonitor();

module.exports = {
  deliveryFailureMonitor,
  DeliveryFailureMonitor,
};
