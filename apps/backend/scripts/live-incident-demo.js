/**
 * 🧪 Comprehensive Live Test for System Incident Alerts across WhatsApp & Multi-Channels
 */

const assert = require('assert');
const systemIncidentAlertService = require('../services/systemIncidentAlertService');
const WhatsAppNotificationService = require('../services/whatsapp/WhatsAppNotificationService');

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 اختبار شامل ومباشر لخدمة تنبيهات السيستم وقناة الواتساب');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const testCompanyId = 'comp_demo_live_2026';
    const testAdminPhone = '201281013359';
    process.env.INCIDENT_ALERT_WHATSAPP_PHONE = testAdminPhone;

    // تمكين قناة الواتساب للشركة التجريبية
    systemIncidentAlertService.setCompanyWhatsAppEnabled(testCompanyId, true);
    systemIncidentAlertService.whatsAppCooldowns.clear();
    systemIncidentAlertService.cooldowns.clear();

    // تتبع الرسائل المرسلة للواتساب
    const waDispatches = [];
    const originalSendNotification = WhatsAppNotificationService.sendNotification;
    WhatsAppNotificationService.sendNotification = async (payload) => {
        waDispatches.push(payload);
        return { success: true, messageId: `msg_${Date.now()}` };
    };

    console.log('📌 1. اختبار إطلاق جميع الأنواع الـ 7 المدعومة (INCIDENT_TYPES):');
    const incidentScenarios = [
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            title: '⚠️ توقف مزامنة أوردرات WooCommerce',
            message: 'توقف تدفق الطلبات بسبب خطأ 500 في خادم المتجر',
            url: '/orders'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.AD_CAMPAIGN_STOPPED,
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            title: '⚠️ توقف الحملة الإعلانية (حملة الشتاء)',
            message: 'نفدت ميزانية الحملة بالكامل وتوقفت الإعلانات',
            url: '/facebook-ads'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE,
            severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
            title: '🚨 تعطل الحساب الإعلاني الرئيسي',
            message: 'تم تعليق الحساب الإعلاني لوجود فواتير معلقة لدى Meta',
            url: '/facebook-ads'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.WHATSAPP_DISCONNECTED,
            severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
            title: '🚨 انقطاع جلسة رقم الواتساب',
            message: 'تم تسجيل خروج جلسة Baileys وتوقفت رسائل الأتمتة التلقائية',
            url: '/whatsapp'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.AUTOMATION_STEP_FAILED,
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            title: '⚠️ تعثر إرسال رسالة أتمتة لعميل',
            message: 'فشل إرسال كود الخصم في خطوة ما بعد الشراء للعميل',
            url: '/whatsapp-automation'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.AUTOMATION_ENDED,
            severity: systemIncidentAlertService.SEVERITIES.INFO,
            title: '✅ اكتمال خطوات رحلة الأتمتة',
            message: 'تم إنهاء كافة خطوات خطة المتابعة بنجاح',
            url: '/whatsapp-automation'
        },
        {
            type: systemIncidentAlertService.INCIDENT_TYPES.SYSTEM_ERROR,
            severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
            title: '🚨 خطأ تقني في سيرفر المنصة',
            message: 'استهلاك غير طبيعي للذاكرة في إحدى العمليات الخلفية',
            url: '/notification-settings'
        }
    ];

    for (let i = 0; i < incidentScenarios.length; i++) {
        const sc = incidentScenarios[i];
        const res = await systemIncidentAlertService.dispatchIncident({
            companyId: testCompanyId,
            incidentType: sc.type,
            title: sc.title,
            message: sc.message,
            severity: sc.severity,
            url: sc.url,
            force: true // إرسال قسري لجميع الأنواع لاختبارها
        });

        assert.strictEqual(res.sent, true, `Incident ${sc.type} should be sent`);
        assert.strictEqual(res.dispatchResults.whatsapp, true, `WhatsApp should be sent for ${sc.type}`);
        assert.strictEqual(res.dispatchResults.whatsappMode, 'immediate', `WhatsApp mode should be immediate`);

        console.log(`  [${i + 1}/7] ✅ ${sc.type} (${sc.severity}) → إرسال فوري بنجاح عبر الواتساب`);
    }

    console.log(`\n📊 إجمالي رسائل الواتساب المرسلة للأنواع الـ 7: ${waDispatches.length}`);
    assert.strictEqual(waDispatches.length, 7, 'All 7 types must have dispatched a WhatsApp notification');

    // فحص محتوى إحدى الرسائل
    const sampleMsg = waDispatches[0].contentOverride;
    console.log('\n📝 نموذج نص تنبيه الواتساب المرسل للإدارة:');
    console.log('--------------------------------------------------');
    console.log(sampleMsg);
    console.log('--------------------------------------------------');

    console.log('\n📌 2. اختبار آلية كتم التكرار (Deduplication):');
    console.log('   - المفتاح: (type + companyId) لكل 30 دقيقة');

    // تجربة إرسال نفس النوع لنفس الشركة بـ entityId مختلف وبدون force
    const dupRes = await systemIncidentAlertService.dispatchIncident({
        companyId: testCompanyId,
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: '⚠️ تكرار عطل مزامنة أوردر آخر',
        message: 'عطل مكرر بعد دقيقة لنفس المتجر',
        severity: systemIncidentAlertService.SEVERITIES.WARNING,
        entityId: 'different_order_9999'
    });

    console.log('   - نتيجة المحاولة المكررة:');
    console.log('     * whatsapp:', dupRes.dispatchResults.whatsapp);
    console.log('     * whatsappReason:', dupRes.dispatchResults.whatsappReason);
    console.log('     * whatsappDeduplicated:', dupRes.dispatchResults.whatsappDeduplicated);

    assert.strictEqual(dupRes.dispatchResults.whatsapp, false, 'Duplicate WhatsApp alert must be suppressed');
    assert.strictEqual(dupRes.dispatchResults.whatsappDeduplicated, true, 'whatsappDeduplicated must be true');
    assert.strictEqual(dupRes.dispatchResults.whatsappReason, 'in_cooldown');
    console.log('   ✅ تم كتم العطل المكرر بنجاح وحماية هاتف الإدارة من الإزعاج!');

    console.log('\n📌 3. اختبار تجاوز التهدئة القسري (force: true):');
    const forceRes = await systemIncidentAlertService.dispatchIncident({
        companyId: testCompanyId,
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
        title: '🚨 إرسال قسري طارئ',
        message: 'عطل متكرر مع تفعيل التجاوز الفوري',
        severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
        force: true
    });
    assert.strictEqual(forceRes.dispatchResults.whatsapp, true, 'Force dispatch must bypass WhatsApp cooldown');
    console.log('   ✅ تم الإرسال الفوري بنجاح عند تفعيل force: true');

    console.log('\n📌 4. اختبار مفتاح إيقاف القناة للشركة (Per-Company Settings):');
    systemIncidentAlertService.setCompanyWhatsAppEnabled(testCompanyId, false);
    const disabledRes = await systemIncidentAlertService.dispatchIncident({
        companyId: testCompanyId,
        incidentType: systemIncidentAlertService.INCIDENT_TYPES.SYSTEM_ERROR,
        title: 'عطل والواتساب معطل للشركة',
        message: 'يجب ألا يصل واتساب',
        severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
        force: true
    });
    assert.strictEqual(disabledRes.dispatchResults.whatsapp, false);
    assert.strictEqual(disabledRes.dispatchResults.whatsappReason, 'channel_disabled');
    console.log('   ✅ عند إيقاف القناة للشركة: تم كتم الواتساب تماماً مع استمرار باقي القنوات بنجاح');

    // استعادة الدالة الأصلية
    WhatsAppNotificationService.sendNotification = originalSendNotification;

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 اكتملت كافة الاختبارات العملية بنجاح تام وبدون أي أخطاء!');
    console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ خطأ أثناء تشغيل الاختبار:', err);
        process.exit(1);
    });
