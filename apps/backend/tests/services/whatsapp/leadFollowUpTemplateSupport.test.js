jest.mock('../../../services/whatsapp/WhatsAppMessageHandler', () => ({
  sendTemplateMessage: jest.fn()
}));
jest.mock('../../../services/whatsapp/providers/MetaCloudProvider', () => ({
  listTemplates: jest.fn(),
  sendTemplate: jest.fn()
}));
jest.mock('../../../services/whatsapp/WhatsAppNotificationService', () => ({
  sendNotification: jest.fn()
}));

const LeadFollowUpService = require('../../../services/whatsapp/LeadFollowUpService');
const WhatsAppMessageHandler = require('../../../services/whatsapp/WhatsAppMessageHandler');
const MetaCloudProvider = require('../../../services/whatsapp/providers/MetaCloudProvider');
const WhatsAppNotificationService = require('../../../services/whatsapp/WhatsAppNotificationService');

describe('LeadFollowUpService Template & Auto-Enroll Support', () => {
  let mockPrisma;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      leadFollowUpSettings: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn()
      },
      leadFollowUpEnrollment: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      whatsAppContact: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn()
      },
      leadCategory: {
        findUnique: jest.fn()
      },
      whatsAppFollowUpFlow: {
        findFirst: jest.fn()
      },
      whatsAppSession: {
        findFirst: jest.fn(),
        update: jest.fn()
      },
      company: {
        findUnique: jest.fn()
      },
      userCompany: {
        findMany: jest.fn()
      },
      notification: {
        createMany: jest.fn()
      }
    };

    jest.spyOn(LeadFollowUpService, 'prisma', 'get').mockReturnValue(mockPrisma);
  });

  describe('1. _parseSteps', () => {
    test('parses multi-step JSON with templateName, templateLanguage, and templateParams', () => {
      const settings = {
        steps: JSON.stringify([
          { delayHours: 12, templateName: 'step1_tmpl', templateLanguage: 'ar', templateParams: '{"1":"firstName"}' },
          { delayHours: 24, templateName: 'step2_tmpl', templateLanguage: 'ar', message: 'fallback text' }
        ])
      };
      const steps = LeadFollowUpService._parseSteps(settings);
      expect(steps).toHaveLength(2);
      expect(steps[0].templateName).toBe('step1_tmpl');
      expect(steps[0].templateParams).toBe('{"1":"firstName"}');
      expect(steps[1].templateName).toBe('step2_tmpl');
    });

    test('falls back to single-step settings with template fields', () => {
      const settings = {
        delayHours: 24,
        message: 'Hello',
        templateName: 'maxp_lead_followup_24h',
        templateLanguage: 'ar',
        templateParams: '{"1":"firstName","2":"companyName"}'
      };
      const steps = LeadFollowUpService._parseSteps(settings);
      expect(steps).toHaveLength(1);
      expect(steps[0].templateName).toBe('maxp_lead_followup_24h');
      expect(steps[0].templateParams).toBe('{"1":"firstName","2":"companyName"}');
    });
  });

  describe('2. enrollLead with Template', () => {
    test('successfully enrolls lead when step has templateName even without message', async () => {
      mockPrisma.leadFollowUpSettings.findUnique.mockResolvedValue({
        isEnabled: true,
        templateName: 'maxp_lead_followup_24h',
        delayHours: 24
      });
      mockPrisma.whatsAppContact.findUnique.mockResolvedValue({ id: 'contact-1', leadCategoryId: null });
      mockPrisma.whatsAppFollowUpFlow.findFirst.mockResolvedValue(null);
      mockPrisma.leadFollowUpEnrollment.findFirst.mockResolvedValue(null);
      mockPrisma.leadFollowUpEnrollment.create.mockResolvedValue({ id: 'enr-1' });

      await LeadFollowUpService.enrollLead('comp-1', 'cust-1', 'contact-1');

      expect(mockPrisma.leadFollowUpEnrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 'comp-1',
            customerId: 'cust-1',
            whatsappContactId: 'contact-1',
            status: 'ACTIVE'
          })
        })
      );
    });
  });

  describe('3. sendFollowUp with Meta Cloud Template', () => {
    test('sends approved Meta template and records Meta messageId in logs', async () => {
      mockPrisma.leadFollowUpSettings.findUnique.mockResolvedValue({
        isEnabled: true,
        templateName: 'maxp_lead_followup_24h',
        templateParams: '{"1":"firstName","2":"companyName"}'
      });

      mockPrisma.whatsAppSession.findFirst.mockResolvedValue({
        id: 'sess-meta',
        provider: 'META_CLOUD',
        status: 'CONNECTED',
        isDefault: true
      });

      mockPrisma.company.findUnique.mockResolvedValue({ name: 'MaxP Online' });

      MetaCloudProvider.listTemplates.mockResolvedValue([
        {
          name: 'maxp_lead_followup_24h',
          status: 'APPROVED',
          language: 'ar',
          components: [
            { type: 'BODY', text: 'أهلاً {{1}} من شركة {{2}}' }
          ]
        }
      ]);

      WhatsAppMessageHandler.sendTemplateMessage.mockResolvedValue({
        messageId: 'wamid.HBgLMjAxMjg5MTIyMjE2FQIAERgSQTEyMzQ1Njc4OTA=',
        id: 'wamid.HBgLMjAxMjg5MTIyMjE2FQIAERgSQTEyMzQ1Njc4OTA='
      });

      const enrollment = {
        id: 'enr-1',
        companyId: 'comp-1',
        currentStep: 0,
        logs: 'Enrolled at 2026-10-27T00:00:00.000Z',
        customer: { firstName: 'أحمد', lastName: 'علي', phone: '201012345678' },
        whatsAppContact: { phoneNumber: '201012345678' }
      };

      await LeadFollowUpService.sendFollowUp(enrollment);

      expect(WhatsAppMessageHandler.sendTemplateMessage).toHaveBeenCalledWith(
        'sess-meta',
        '201012345678',
        'maxp_lead_followup_24h',
        expect.objectContaining({
          name: 'maxp_lead_followup_24h',
          language: 'ar',
          components: [
            {
              type: 'BODY',
              parameters: [
                { type: 'text', text: 'أحمد' },
                { type: 'text', text: 'MaxP Online' }
              ]
            }
          ]
        }),
        expect.anything()
      );

      expect(mockPrisma.leadFollowUpEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'enr-1' },
          data: expect.objectContaining({
            status: 'COMPLETED',
            logs: expect.stringContaining('MessageID: wamid.HBgLMjAxMjg5MTIyMjE2FQIAERgSQTEyMzQ1Njc4OTA=')
          })
        })
      );
    });

    test('gracefully skips step and does not crash when template is PENDING or not found', async () => {
      mockPrisma.leadFollowUpSettings.findUnique.mockResolvedValue({
        isEnabled: true,
        templateName: 'maxp_lead_followup_pending',
        delayHours: 24
      });

      mockPrisma.whatsAppSession.findFirst.mockResolvedValue({
        id: 'sess-meta',
        provider: 'META_CLOUD',
        status: 'CONNECTED',
        isDefault: true
      });

      mockPrisma.company.findUnique.mockResolvedValue({ name: 'MaxP Online' });

      MetaCloudProvider.listTemplates.mockResolvedValue([
        {
          name: 'maxp_lead_followup_pending',
          status: 'PENDING',
          language: 'ar'
        }
      ]);

      const enrollment = {
        id: 'enr-2',
        companyId: 'comp-1',
        currentStep: 0,
        logs: 'Enrolled',
        customer: { firstName: 'محمد', phone: '201099999999' },
        whatsAppContact: { phoneNumber: '201099999999' }
      };

      await LeadFollowUpService.sendFollowUp(enrollment);

      // Must NOT attempt to send template
      expect(WhatsAppMessageHandler.sendTemplateMessage).not.toHaveBeenCalled();

      // Must gracefully complete or advance step with clear skip log
      expect(mockPrisma.leadFollowUpEnrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'enr-2' },
          data: expect.objectContaining({
            logs: expect.stringContaining('Skipped step 1/1 (Template "maxp_lead_followup_pending" status is PENDING)')
          })
        })
      );
    });
  });
});
