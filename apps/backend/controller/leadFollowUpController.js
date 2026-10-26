const { getSharedPrismaClient } = require('../services/sharedDatabase');
const LeadFollowUpService = require('../services/whatsapp/LeadFollowUpService');

class LeadFollowUpController {
    get prisma() {
        return getSharedPrismaClient();
    }

    _getCompanyId(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
            return null;
        }
        if (!req.user.companyId) {
            res.status(400).json({ success: false, message: 'Company context is required', code: 'COMPANY_REQUIRED' });
            return null;
        }
        return req.user.companyId;
    }

    async getSettings(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            let settings = await this.prisma.leadFollowUpSettings.findUnique({
                where: { companyId }
            });

            if (!settings) {
                settings = await this.prisma.leadFollowUpSettings.create({
                    data: { companyId, isEnabled: false, delayHours: 24, message: '' }
                });
            }

            // Parse steps JSON for the frontend
            const data = { ...settings };
            if (data.steps) {
                try { data.steps = JSON.parse(data.steps); } catch { data.steps = null; }
            }

            res.json({ success: true, data });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] getSettings error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateSettings(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const {
                isEnabled,
                delayHours,
                message,
                mediaUrl,
                steps,
                businessHourStart,
                businessHourEnd,
                timezone,
                templateName,
                templateLanguage,
                templateParams
            } = req.body;

            const updateData = {};
            if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
            if (delayHours !== undefined) updateData.delayHours = delayHours;
            if (message !== undefined) updateData.message = message;
            if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
            if (templateName !== undefined) updateData.templateName = templateName ? String(templateName).trim() : null;
            if (templateLanguage !== undefined) updateData.templateLanguage = templateLanguage ? String(templateLanguage).trim() : 'ar';
            if (templateParams !== undefined) {
                updateData.templateParams = typeof templateParams === 'object' && templateParams !== null
                    ? JSON.stringify(templateParams)
                    : (templateParams ? String(templateParams) : null);
            }
            if (steps !== undefined) {
                const sanitizedSteps = Array.isArray(steps) ? steps.map(s => ({
                    delayHours: Number(s.delayHours) || 24,
                    message: s.message ?? '',
                    mediaUrl: s.mediaUrl ?? null,
                    templateName: s.templateName ? String(s.templateName).trim() : null,
                    templateLanguage: s.templateLanguage ? String(s.templateLanguage).trim() : 'ar',
                    templateParams: typeof s.templateParams === 'object' && s.templateParams !== null
                        ? JSON.stringify(s.templateParams)
                        : (s.templateParams ? String(s.templateParams) : null)
                })) : null;
                updateData.steps = sanitizedSteps ? JSON.stringify(sanitizedSteps) : null;
            }
            if (businessHourStart !== undefined) updateData.businessHourStart = businessHourStart;
            if (businessHourEnd !== undefined) updateData.businessHourEnd = businessHourEnd;
            if (timezone !== undefined) updateData.timezone = timezone;

            const sanitizedInitialSteps = Array.isArray(steps) ? steps.map(s => ({
                delayHours: Number(s.delayHours) || 24,
                message: s.message ?? '',
                mediaUrl: s.mediaUrl ?? null,
                templateName: s.templateName ? String(s.templateName).trim() : null,
                templateLanguage: s.templateLanguage ? String(s.templateLanguage).trim() : 'ar',
                templateParams: typeof s.templateParams === 'object' && s.templateParams !== null
                    ? JSON.stringify(s.templateParams)
                    : (s.templateParams ? String(s.templateParams) : null)
            })) : undefined;

            const settings = await this.prisma.leadFollowUpSettings.upsert({
                where: { companyId },
                update: updateData,
                create: {
                    companyId,
                    isEnabled: isEnabled ?? false,
                    delayHours: delayHours ?? 24,
                    message: message ?? '',
                    mediaUrl,
                    templateName: templateName ? String(templateName).trim() : null,
                    templateLanguage: templateLanguage ? String(templateLanguage).trim() : 'ar',
                    templateParams: typeof templateParams === 'object' && templateParams !== null
                        ? JSON.stringify(templateParams)
                        : (templateParams ? String(templateParams) : null),
                    steps: sanitizedInitialSteps ? JSON.stringify(sanitizedInitialSteps) : undefined,
                    businessHourStart,
                    businessHourEnd,
                    timezone
                }
            });

            const data = { ...settings };
            if (data.steps) {
                try { data.steps = JSON.parse(data.steps); } catch { data.steps = null; }
            }

            res.json({ success: true, data });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] updateSettings error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEnrollments(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const { status } = req.query;

            const enrollments = await this.prisma.leadFollowUpEnrollment.findMany({
                where: {
                    companyId,
                    ...(status && { status })
                },
                include: {
                    customer: {
                        select: { firstName: true, lastName: true, phone: true }
                    },
                    whatsAppContact: {
                        select: { phoneNumber: true, name: true, pushName: true }
                    }
                },
                orderBy: { nextSendAt: 'asc' },
                take: 100
            });

            // Get settings for step count
            const settings = await this.prisma.leadFollowUpSettings.findUnique({
                where: { companyId },
                select: { steps: true }
            });

            let totalSteps = 1;
            if (settings?.steps) {
                try { totalSteps = JSON.parse(settings.steps).length; } catch { /* ignore */ }
            }

            const data = enrollments.map(e => ({
                ...e,
                totalSteps
            }));

            res.json({ success: true, data });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] getEnrollments error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEnrollment(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const { id } = req.params;
            const enrollment = await this.prisma.leadFollowUpEnrollment.findFirst({
                where: { id, companyId },
                include: {
                    customer: {
                        select: { firstName: true, lastName: true, phone: true, email: true }
                    },
                    whatsAppContact: {
                        select: { phoneNumber: true, name: true, pushName: true }
                    }
                }
            });

            if (!enrollment) {
                return res.status(404).json({ success: false, message: 'Enrollment not found' });
            }

            res.json({ success: true, data: enrollment });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] getEnrollment error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async cancelEnrollment(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const { id } = req.params;
            const result = await LeadFollowUpService.cancelEnrollment(id, companyId);

            if (!result.success) {
                const statusCode = result.reason === 'NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json({ success: false, message: result.reason });
            }

            res.json({ success: true, message: 'Enrollment cancelled' });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] cancelEnrollment error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getCategoryStats(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const categories = await this.prisma.leadCategory.findMany({
                where: { companyId },
                orderBy: { sortOrder: 'asc' }
            });

            const stats = await Promise.all(categories.map(async (cat) => {
                const contactIds = await this.prisma.whatsAppContact.findMany({
                    where: { leadCategoryId: cat.id, whatsAppSession: { companyId } },
                    select: { id: true }
                });
                const contactIdList = contactIds.map(c => c.id);

                const [totalContacts, enrolled, completed, replied] = await Promise.all([
                    Promise.resolve(contactIdList.length),
                    contactIdList.length > 0 ? this.prisma.leadFollowUpEnrollment.count({
                        where: { companyId, whatsappContactId: { in: contactIdList }, status: 'ACTIVE' }
                    }) : 0,
                    contactIdList.length > 0 ? this.prisma.leadFollowUpEnrollment.count({
                        where: { companyId, whatsappContactId: { in: contactIdList }, status: 'COMPLETED' }
                    }) : 0,
                    contactIdList.length > 0 ? this.prisma.leadFollowUpEnrollment.count({
                        where: { companyId, whatsappContactId: { in: contactIdList }, repliedAt: { not: null } }
                    }) : 0,
                ]);

                return {
                    id: cat.id,
                    name: cat.name,
                    color: cat.color,
                    totalContacts,
                    enrolled,
                    completed,
                    replied,
                    replyRate: enrolled + completed > 0 ? Math.round((replied / (enrolled + completed)) * 100) : 0,
                };
            }));

            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] getCategoryStats error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const companyId = this._getCompanyId(req, res);
            if (!companyId) return;

            const [active, completed, cancelled, replied] = await Promise.all([
                this.prisma.leadFollowUpEnrollment.count({ where: { companyId, status: 'ACTIVE' } }),
                this.prisma.leadFollowUpEnrollment.count({ where: { companyId, status: 'COMPLETED' } }),
                this.prisma.leadFollowUpEnrollment.count({ where: { companyId, status: 'CANCELLED' } }),
                this.prisma.leadFollowUpEnrollment.count({ where: { companyId, repliedAt: { not: null } } })
            ]);

            const total = active + completed + cancelled;
            const totalSent = completed;
            const replyRate = totalSent > 0 ? Math.round((replied / totalSent) * 100) : 0;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            res.json({
                success: true,
                data: { active, completed, cancelled, replied, total, totalSent, replyRate, completionRate }
            });
        } catch (error) {
            console.error('[LEAD-FOLLOWUP-CTRL] getStats error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new LeadFollowUpController();
