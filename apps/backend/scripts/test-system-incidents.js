/**
 * 🧪 Test Runner for System Incident Alert Service
 */

const assert = require('assert');
const systemIncidentAlertService = require('../services/systemIncidentAlertService');

async function runTests() {
    console.log('🧪 Starting System Incident Alert Service Verification...');

    // 1. Verify Exports & Enums
    assert(systemIncidentAlertService.INCIDENT_TYPES, 'INCIDENT_TYPES should be defined');
    assert(systemIncidentAlertService.SEVERITIES, 'SEVERITIES should be defined');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE, 'ORDER_SYNC_STOPPAGE');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.AD_CAMPAIGN_STOPPED, 'AD_CAMPAIGN_STOPPED');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE, 'AD_ACCOUNT_ISSUE');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.AUTOMATION_ENDED, 'AUTOMATION_ENDED');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.AUTOMATION_STEP_FAILED, 'AUTOMATION_STEP_FAILED');
    assert.strictEqual(systemIncidentAlertService.INCIDENT_TYPES.WHATSAPP_DISCONNECTED, 'WHATSAPP_DISCONNECTED');
    console.log('✅ 1. Enums and constants verified.');

    // 2. Test Missing companyId
    const missingCompResult = await systemIncidentAlertService.dispatchIncident({
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: 'تجربة',
        message: 'رسالة'
    });
    assert.strictEqual(missingCompResult.sent, false);
    assert.strictEqual(missingCompResult.reason, 'missing_company_id');
    console.log('✅ 2. Guard for missing companyId verified.');

    // 3. Test Cooldown Mechanism
    systemIncidentAlertService.cooldowns.clear();
    const isCool1 = systemIncidentAlertService.isCoolingDown('comp_test', 'ORDER_SYNC_STOPPAGE', 'entity_1');
    assert.strictEqual(isCool1, false, 'Should not be cooling down initially');

    systemIncidentAlertService.markIncidentSent('comp_test', 'ORDER_SYNC_STOPPAGE', 'entity_1');
    const isCool2 = systemIncidentAlertService.isCoolingDown('comp_test', 'ORDER_SYNC_STOPPAGE', 'entity_1');
    assert.strictEqual(isCool2, true, 'Should be cooling down immediately after sent');

    const isCoolDifferentEntity = systemIncidentAlertService.isCoolingDown('comp_test', 'ORDER_SYNC_STOPPAGE', 'entity_2');
    assert.strictEqual(isCoolDifferentEntity, false, 'Different entity should not be cooled down');
    console.log('✅ 3. Cooldown deduplication logic verified.');

    // 4. Test Telegram Text Builder
    const tgText = systemIncidentAlertService.buildTelegramAlertText({
        companyName: 'متجر سوان',
        title: '⚠️ تعطل مزامنة أوردرات WooCommerce',
        message: 'توقفت الأوردرات عن النزول بسبب خطأ 500',
        incidentType: 'ORDER_SYNC_STOPPAGE',
        severity: 'CRITICAL',
        url: '/orders',
        metadata: { storeUrl: 'https://swan.com', errorCount: 3 }
    });
    assert(tgText.includes('[SYSTEM ALERT - ORDER_SYNC_STOPPAGE]'), 'Should contain alert tag');
    assert(tgText.includes('متجر سوان'), 'Should contain company name');
    assert(tgText.includes('تعطل مزامنة'), 'Should contain title');
    assert(tgText.includes('https://maxp.online/orders'), 'Should contain absolute url');
    assert(tgText.includes('storeUrl: https://swan.com'), 'Should contain metadata');
    console.log('✅ 4. Telegram Alert text formatting verified.');

    // 5. Test Notification Preferences Service Integration
    const { DEFAULT_NOTIFICATION_TYPES } = require('../services/notificationPreferencesService');
    const hasIncident = DEFAULT_NOTIFICATION_TYPES.some(t => t.id === 'system_incident');
    const hasOrderStoppage = DEFAULT_NOTIFICATION_TYPES.some(t => t.id === 'order_sync_stoppage');
    const hasAdStoppage = DEFAULT_NOTIFICATION_TYPES.some(t => t.id === 'ad_campaign_stoppage');
    const hasAutomation = DEFAULT_NOTIFICATION_TYPES.some(t => t.id === 'automation_lifecycle');

    assert(hasIncident, 'system_incident must be in DEFAULT_NOTIFICATION_TYPES');
    assert(hasOrderStoppage, 'order_sync_stoppage must be in DEFAULT_NOTIFICATION_TYPES');
    assert(hasAdStoppage, 'ad_campaign_stoppage must be in DEFAULT_NOTIFICATION_TYPES');
    assert(hasAutomation, 'automation_lifecycle must be in DEFAULT_NOTIFICATION_TYPES');
    console.log('✅ 5. Notification types registration verified.');

    // 6. Test 2026 Batch/Storm Protection on automation step failures
    systemIncidentAlertService.cooldowns.clear();
    const metaReason = { reason: 'meta_template_not_approved' };
    const step1Cool = systemIncidentAlertService.isCoolingDown('comp_storm', 'AUTOMATION_STEP_FAILED', 'journey_1', 30, metaReason);
    assert.strictEqual(step1Cool, false, 'First failure in batch should not be cooled down');

    systemIncidentAlertService.markIncidentSent('comp_storm', 'AUTOMATION_STEP_FAILED', 'journey_1', metaReason);
    // Second failure for a DIFFERENT customer/journey but SAME reason should be cooled down!
    const step2Cool = systemIncidentAlertService.isCoolingDown('comp_storm', 'AUTOMATION_STEP_FAILED', 'journey_2', 30, metaReason);
    assert.strictEqual(step2Cool, true, 'Second failure with same reason should be cooled down (storm protection)');

    // Different reason should NOT be cooled down
    const differentReasonCool = systemIncidentAlertService.isCoolingDown('comp_storm', 'AUTOMATION_STEP_FAILED', 'journey_3', 30, { reason: 'phone_invalid' });
    assert.strictEqual(differentReasonCool, false, 'Different failure reason should not be cooled down');
    console.log('✅ 6. Batch storm protection for automation failures verified.');

    // 7. Test WhatsApp Alert Text Builder
    const waText = systemIncidentAlertService.buildWhatsAppAlertText({
        companyName: 'متجر التميز',
        title: '🚨 انقطاع جلسة الواتساب',
        message: 'تم انقطاع الجلسة الإدارية الرئيسية للرقم',
        incidentType: 'WHATSAPP_DISCONNECTED',
        severity: 'CRITICAL',
        url: '/whatsapp',
        metadata: { sessionId: 'wa_123', reason: 'qr_timeout' }
    });
    assert(waText.includes('[عطل حرج - WHATSAPP_DISCONNECTED]'), 'Should contain Arabic severity and type');
    assert(waText.includes('متجر التميز'), 'Should contain company name');
    assert(waText.includes('انقطاع جلسة الواتساب'), 'Should contain title');
    assert(waText.includes('https://maxp.online/whatsapp'), 'Should contain url');
    assert(waText.includes('sessionId: wa_123'), 'Should include metadata');
    console.log('✅ 7. WhatsApp Alert text formatting verified.');

    // 8. Test WhatsApp Dedupe Key = (type + companyId) for 30 minutes
    systemIncidentAlertService.whatsAppCooldowns.clear();
    const waDedupeKey = systemIncidentAlertService.getWhatsAppDedupeKey('ORDER_SYNC_STOPPAGE', 'comp_wa_test');
    assert.strictEqual(waDedupeKey, 'ORDER_SYNC_STOPPAGE:comp_wa_test', 'Dedupe key must equal (type + companyId)');

    const isWaCool1 = systemIncidentAlertService.isWhatsAppCoolingDown('ORDER_SYNC_STOPPAGE', 'comp_wa_test', 30);
    assert.strictEqual(isWaCool1, false, 'Should not be cooling down initially');

    systemIncidentAlertService.markWhatsAppIncidentSent('ORDER_SYNC_STOPPAGE', 'comp_wa_test');
    const isWaCool2 = systemIncidentAlertService.isWhatsAppCoolingDown('ORDER_SYNC_STOPPAGE', 'comp_wa_test', 30);
    assert.strictEqual(isWaCool2, true, 'Should be cooling down immediately after sent');

    // A different incident type for the SAME company should NOT be cooling down
    const isWaDifferentType = systemIncidentAlertService.isWhatsAppCoolingDown('AD_CAMPAIGN_STOPPED', 'comp_wa_test', 30);
    assert.strictEqual(isWaDifferentType, false, 'Different incident type should not be cooled down');

    // The SAME incident type for a DIFFERENT company should NOT be cooling down
    const isWaDifferentCompany = systemIncidentAlertService.isWhatsAppCoolingDown('ORDER_SYNC_STOPPAGE', 'comp_wa_other', 30);
    assert.strictEqual(isWaDifferentCompany, false, 'Different company should not be cooled down');
    console.log('✅ 8. WhatsApp dedupe key = (type + companyId) per 30 minutes verified.');

    // 9. Test Per-Company WhatsApp Channel Settings Override
    systemIncidentAlertService.companyWhatsAppEnabledOverrides.clear();
    systemIncidentAlertService.setCompanyWhatsAppEnabled('comp_settings_test', false);
    const isEnabledFalse = await systemIncidentAlertService.isWhatsAppAlertsEnabled('comp_settings_test');
    assert.strictEqual(isEnabledFalse, false, 'Should be disabled when per-company setting is false');

    systemIncidentAlertService.setCompanyWhatsAppEnabled('comp_settings_test', true);
    const isEnabledTrue = await systemIncidentAlertService.isWhatsAppAlertsEnabled('comp_settings_test');
    assert.strictEqual(isEnabledTrue, true, 'Should be enabled when per-company setting is true');
    console.log('✅ 9. Per-company WhatsApp settings control verified.');

    // 10. Generate Test Incident across Channels (توليد عطل تجريبي)
    const WhatsAppNotificationService = require('../services/whatsapp/WhatsAppNotificationService');
    const originalSendNotification = WhatsAppNotificationService.sendNotification;
    let dispatchedWhatsAppPayload = null;
    WhatsAppNotificationService.sendNotification = async (payload) => {
        dispatchedWhatsAppPayload = payload;
        return { success: true, messageId: 'msg_test_wa_123' };
    };

    systemIncidentAlertService.whatsAppCooldowns.clear();
    systemIncidentAlertService.setCompanyWhatsAppEnabled('comp_test_live', true);
    process.env.INCIDENT_ALERT_WHATSAPP_PHONE = '201000000001';

    const testIncident1 = await systemIncidentAlertService.dispatchIncident({
        companyId: 'comp_test_live',
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: '🚨 عطل تجريبي: توقف مزامنة أوردرات المتجر',
        message: 'تم إطلاق هذا العطل التجريبي لاختبار قنوات الإنذار الفوري وتنبيهات الواتساب وتليجرام',
        severity: systemIncidentAlertService.SEVERITIES.WARNING,
        entityId: 'test_order_1001',
        url: '/orders',
        force: true
    });

    assert.strictEqual(testIncident1.sent, true, 'Test incident dispatch must succeed');
    assert.strictEqual(testIncident1.dispatchResults.whatsapp, true, 'WhatsApp alert must be dispatched');
    assert.strictEqual(testIncident1.dispatchResults.whatsappMode, 'immediate', 'WhatsApp mode must be immediate');
    assert(dispatchedWhatsAppPayload, 'WhatsApp payload must have been passed to sendNotification');
    assert.strictEqual(dispatchedWhatsAppPayload.recipientPhone, '201000000001', 'Recipient phone must match');
    assert(dispatchedWhatsAppPayload.contentOverride.includes('توقف مزامنة أوردرات'), 'Alert content must contain incident title');

    // Second dispatch for SAME incident type and company (even with different entityId) without force
    dispatchedWhatsAppPayload = null;
    const testIncident2 = await systemIncidentAlertService.dispatchIncident({
        companyId: 'comp_test_live',
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: '🚨 عطل تجريبي: توقف أوردر آخر',
        message: 'عطل آخر مكرر',
        severity: systemIncidentAlertService.SEVERITIES.WARNING,
        entityId: 'test_order_1002',
        url: '/orders'
    });

    // WhatsApp must be suppressed by dedupe key (type + companyId)
    assert.strictEqual(testIncident2.dispatchResults.whatsapp, false, 'WhatsApp duplicate alert must be suppressed');
    assert.strictEqual(testIncident2.dispatchResults.whatsappDeduplicated, true, 'Must indicate WhatsApp deduplication');
    assert.strictEqual(testIncident2.dispatchResults.whatsappReason, 'in_cooldown');
    assert.strictEqual(dispatchedWhatsAppPayload, null, 'No new WhatsApp message should be dispatched on deduplication');

    // Third dispatch with force: true must bypass dedupe
    const testIncident3 = await systemIncidentAlertService.dispatchIncident({
        companyId: 'comp_test_live',
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: '🚨 عطل تجريبي: توقف قسري متكرر',
        message: 'إرسال قسري',
        severity: systemIncidentAlertService.SEVERITIES.WARNING,
        entityId: 'test_order_1003',
        url: '/orders',
        force: true
    });
    assert.strictEqual(testIncident3.dispatchResults.whatsapp, true, 'Force dispatch must bypass WhatsApp cooldown');

    // Restore original handler
    WhatsAppNotificationService.sendNotification = originalSendNotification;
    console.log('✅ 10. Test incident generation & WhatsApp deduplication verification complete.');

    console.log('🎉 ALL SYSTEM INCIDENT ALERT TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
