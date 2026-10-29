jest.mock('../../services/sharedDatabase', () => ({
    getSharedPrismaClient: jest.fn()
}));

jest.mock('../../services/socketService', () => ({
    getIO: jest.fn()
}));

jest.mock('../../services/browserPushService', () => ({
    sendBrowserPushToCompany: jest.fn()
}));

jest.mock('../../services/telegramAlertService', () => ({
    sendAlert: jest.fn()
}));

jest.mock('../../services/whatsapp/WhatsAppNotificationService', () => ({
    sendNotification: jest.fn()
}));

const systemIncidentAlertService = require('../../services/systemIncidentAlertService');
const socketService = require('../../services/socketService');
const { sendBrowserPushToCompany } = require('../../services/browserPushService');
const telegramAlertService = require('../../services/telegramAlertService');
const WhatsAppNotificationService = require('../../services/whatsapp/WhatsAppNotificationService');
const { getSharedPrismaClient } = require('../../services/sharedDatabase');

describe('SystemIncidentAlertService - Comprehensive Multi-Channel Tests', () => {
    let mockPrisma;
    let mockIo;

    beforeEach(() => {
        jest.clearAllMocks();

        mockPrisma = {
            company: {
                findUnique: jest.fn().mockResolvedValue({ id: 'comp_1', name: 'متجر تجريبي' })
            },
            notification: {
                create: jest.fn().mockResolvedValue({
                    id: 'notif_123',
                    title: 'تنبيه تجريبي',
                    message: 'تفاصيل المشكلة',
                    companyId: 'comp_1',
                    createdAt: new Date()
                })
            },
            whatsAppNotificationSettings: {
                findUnique: jest.fn().mockResolvedValue({
                    isEnabled: true,
                    companyLifecycleAdminPhones: '201000000001'
                })
            },
            notificationPreference: {
                findFirst: jest.fn().mockResolvedValue({
                    companyId: 'comp_1',
                    settings: {
                        globalEnabled: true,
                        channels: {
                            whatsapp: {
                                enabled: true,
                                phoneNumber: '201000000001'
                            }
                        }
                    }
                })
            },
            user: {
                findMany: jest.fn().mockResolvedValue([
                    { phone: '201000000001' }
                ])
            }
        };
        getSharedPrismaClient.mockReturnValue(mockPrisma);

        mockIo = {
            to: jest.fn().mockReturnValue({
                emit: jest.fn()
            })
        };
        socketService.getIO.mockReturnValue(mockIo);

        sendBrowserPushToCompany.mockResolvedValue({ attempted: 2, sent: 2, failed: 0 });
        telegramAlertService.sendAlert.mockResolvedValue(true);
        WhatsAppNotificationService.sendNotification.mockResolvedValue({ success: true, messageId: 'msg_wa_123' });

        // Reset cooldowns, queue, and overrides
        systemIncidentAlertService.cooldowns.clear();
        systemIncidentAlertService.whatsAppCooldowns.clear();
        systemIncidentAlertService.hourlyDigestQueue.clear();
        systemIncidentAlertService.companyWhatsAppEnabledOverrides.clear();
    });

    afterAll(() => {
        systemIncidentAlertService.stopHourlyDigestTimer();
    });

    test('should reject dispatch if companyId is missing', async () => {
        const result = await systemIncidentAlertService.dispatchIncident({
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.ORDER_SYNC_STOPPAGE,
            title: 'تنبيه',
            message: 'رسالة'
        });

        expect(result.sent).toBe(false);
        expect(result.reason).toBe('missing_company_id');
        expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    test('Acceptance 1: Critical incident (WHATSAPP_DISCONNECTED) reaches Telegram AND WhatsApp immediately in the same minute', async () => {
        const result = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.WHATSAPP_DISCONNECTED,
            title: '🚨 انقطاع جلسة الواتساب',
            message: 'تم رصد انقطاع الاتصال بين الخادم ورقم الواتساب الرئيسي',
            severity: systemIncidentAlertService.SEVERITIES.CRITICAL,
            entityId: 'wa_sess_1',
            url: '/whatsapp'
        });

        expect(result.sent).toBe(true);
        expect(result.dispatchResults.telegram).toBe(true);
        expect(result.dispatchResults.whatsapp).toBe(true);
        expect(result.dispatchResults.whatsappMode).toBe('immediate');

        // Verify Telegram alert text was sent
        expect(telegramAlertService.sendAlert).toHaveBeenCalledWith(
            expect.stringContaining('[SYSTEM ALERT - WHATSAPP_DISCONNECTED]')
        );

        // Verify WhatsApp alert was sent immediately via WhatsAppNotificationService with fallback strategy
        expect(WhatsAppNotificationService.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({
                companyId: 'comp_1',
                recipientPhone: '201000000001',
                category: 'SYSTEM',
                eventType: 'SYSTEM_INCIDENT',
                deliveryStrategy: 'platform-fallback',
                contentOverride: expect.stringContaining('انقطاع جلسة الواتساب')
            })
        );
    });

    test('Acceptance 2: Duplicate incident within 30 minutes is suppressed by cooldown', async () => {
        // First dispatch: Success
        const res1 = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_CAMPAIGN_STOPPED,
            title: 'توقف الإعلان',
            message: 'نفدت الميزانية',
            entityId: 'camp_456',
            severity: systemIncidentAlertService.SEVERITIES.WARNING
        });
        expect(res1.sent).toBe(true);

        // Second dispatch within cooldown window: Must be suppressed
        const res2 = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_CAMPAIGN_STOPPED,
            title: 'توقف الإعلان',
            message: 'نفدت الميزانية',
            entityId: 'camp_456',
            severity: systemIncidentAlertService.SEVERITIES.WARNING
        });
        expect(res2.sent).toBe(false);
        expect(res2.reason).toBe('in_cooldown');

        // Third dispatch with force=true: Bypasses cooldown
        const res3 = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_CAMPAIGN_STOPPED,
            title: 'توقف الإعلان',
            message: 'نفدت الميزانية',
            entityId: 'camp_456',
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            force: true
        });
        expect(res3.sent).toBe(true);
    });

    test('Acceptance 3: Disabling the WhatsApp channel for a company completely stops WhatsApp while Telegram continues unaffected', async () => {
        // Explicitly disable WhatsApp channel for comp_1
        systemIncidentAlertService.setCompanyWhatsAppEnabled('comp_1', false);

        const result = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.SYSTEM_ERROR,
            title: 'خطأ بالسيرفر',
            message: 'خطأ غير متوقع في قاعدة البيانات',
            severity: systemIncidentAlertService.SEVERITIES.CRITICAL
        });

        expect(result.sent).toBe(true);
        // Telegram must continue to work normally
        expect(result.dispatchResults.telegram).toBe(true);
        expect(telegramAlertService.sendAlert).toHaveBeenCalled();

        // WhatsApp must be stopped
        expect(result.dispatchResults.whatsapp).toBe(false);
        expect(result.dispatchResults.whatsappReason).toBe('channel_disabled');
        expect(WhatsAppNotificationService.sendNotification).not.toHaveBeenCalled();
    });

    test('Acceptance 4: WARNING and INFO incidents queue for hourly digest with dedupe key = (type + companyId) per 30 min', async () => {
        const warnResult = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE,
            title: 'فواتير معلقة',
            message: 'يرجى تحديث وسيلة الدفع',
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            entityId: 'act_999'
        });

        expect(warnResult.sent).toBe(true);
        expect(warnResult.dispatchResults.telegram).toBe(true);
        expect(warnResult.dispatchResults.whatsapp).toBe(true);
        expect(warnResult.dispatchResults.whatsappMode).toBe('queued_hourly');
        expect(systemIncidentAlertService.hourlyDigestQueue.get('comp_1')).toHaveLength(1);

        // Deduplication test: second dispatch with DIFFERENT entityId but SAME (type + companyId) within 30 min
        const warnResult2 = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE,
            title: 'فواتير معلقة أخرى',
            message: 'حساب آخر معلق',
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            entityId: 'act_888'
        });

        // WhatsApp duplicate alert must be suppressed by dedupe key (type + companyId)
        expect(warnResult2.dispatchResults.whatsapp).toBe(false);
        expect(warnResult2.dispatchResults.whatsappReason).toBe('in_cooldown');
        expect(warnResult2.dispatchResults.whatsappDeduplicated).toBe(true);

        // Third dispatch with force=true must bypass WhatsApp dedupe
        const warnResult3 = await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE,
            title: 'فواتير معلقة',
            message: 'يرجى تحديث وسيلة الدفع',
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            entityId: 'act_777',
            force: true
        });
        expect(warnResult3.dispatchResults.whatsapp).toBe(true);

        // Verify hourly digest queue and flush operate correctly
        systemIncidentAlertService.queueForHourlyDigest({
            companyId: 'comp_1',
            companyName: 'متجر تجريبي',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AD_ACCOUNT_ISSUE,
            title: 'فواتير معلقة',
            message: 'يرجى تحديث وسيلة الدفع',
            severity: systemIncidentAlertService.SEVERITIES.WARNING,
            entityId: 'act_999'
        });

        expect(systemIncidentAlertService.hourlyDigestQueue.get('comp_1')).toHaveLength(2);
        const flushResult = await systemIncidentAlertService.flushHourlyDigest('comp_1');
        expect(flushResult.sent).toBe(true);
        expect(flushResult.count).toBe(2);
        expect(systemIncidentAlertService.hourlyDigestQueue.get('comp_1')).toBeUndefined();
    });

    test('Acceptance 5: Telegram alert text formatting remains 100% untouched and preserved', async () => {
        await systemIncidentAlertService.dispatchIncident({
            companyId: 'comp_1',
            incidentType: systemIncidentAlertService.INCIDENT_TYPES.AUTOMATION_ENDED,
            title: '✅ اكتمال خطوات الأتمتة',
            message: 'تم إنهاء كافة خطوات خطة المتابعة بنجاح للعميل',
            severity: systemIncidentAlertService.SEVERITIES.INFO,
            entityId: 'auto_789'
        });

        expect(telegramAlertService.sendAlert).toHaveBeenCalledWith(
            expect.stringContaining('ℹ️ *[SYSTEM ALERT - AUTOMATION_ENDED]*')
        );
        expect(telegramAlertService.sendAlert).toHaveBeenCalledWith(
            expect.stringContaining('🏢 *الشركة:* متجر تجريبي')
        );
        expect(telegramAlertService.sendAlert).toHaveBeenCalledWith(
            expect.stringContaining('📌 *العنوان:* ✅ اكتمال خطوات الأتمتة')
        );
    });
});
