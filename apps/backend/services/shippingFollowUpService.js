const sharedDb = require('./sharedDatabase');
const WhatsAppNotificationService = require('./whatsapp/WhatsAppNotificationService');
const TurboService = require('./turboService');

const DEFAULTS = {
  enabled: false,
  minDays: 2,
  statuses: ['SHIPPED', 'OUT_FOR_DELIVERY', 'NOT_SHIPPED', 'ON_HOLD'],
  notifyAdmin: true,
  notifyCustomer: false,
  autoTicket: false,
  alertPhone: null,
  maxPerRun: 25,
  dryRun: false,
  lastRunAt: null,
  lastRunSummary: null,
};

class ShippingFollowUpService {
  constructor() {
    this.DEFAULTS = DEFAULTS;
  }

  _parseSettings(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async getSettings(companyId) {
    if (!companyId) return { ...DEFAULTS };

    const comp = await sharedDb.safeQuery((prisma) =>
      prisma.company.findUnique({
        where: { id: companyId },
        select: { settings: true, phone: true, name: true },
      })
    );

    const parsed = this._parseSettings(comp?.settings);
    const rawShipping = parsed.shipping_followup || {};

    return {
      ...DEFAULTS,
      ...rawShipping,
      alertPhone: rawShipping.alertPhone !== undefined ? rawShipping.alertPhone : (comp?.phone || null),
    };
  }

  async updateSettings(companyId, patch = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const validatedPatch = {};

    if (patch.minDays !== undefined) {
      const minDays = Number(patch.minDays);
      if (!Number.isInteger(minDays) || minDays < 0) {
        throw new Error('عدد أيام التأخير يجب أن يكون رقماً صحيحاً غير سالب');
      }
      validatedPatch.minDays = minDays;
    }

    if (patch.statuses !== undefined) {
      if (!Array.isArray(patch.statuses) || patch.statuses.length === 0) {
        throw new Error('قائمة الحالات لا يمكن أن تكون فارغة');
      }
      const cleanStatuses = patch.statuses.map((s) => String(s).trim()).filter(Boolean);
      if (cleanStatuses.length === 0) {
        throw new Error('قائمة الحالات لا يمكن أن تكون فارغة');
      }
      validatedPatch.statuses = cleanStatuses;
    }

    if (patch.maxPerRun !== undefined) {
      const maxPerRun = Number(patch.maxPerRun);
      if (!Number.isInteger(maxPerRun) || maxPerRun <= 0 || maxPerRun > 100) {
        throw new Error('الحد الأقصى لكل تشغيل يجب أن يكون بين 1 و 100');
      }
      validatedPatch.maxPerRun = maxPerRun;
    }

    if (patch.enabled !== undefined) validatedPatch.enabled = Boolean(patch.enabled);
    if (patch.notifyAdmin !== undefined) validatedPatch.notifyAdmin = Boolean(patch.notifyAdmin);
    if (patch.notifyCustomer !== undefined) validatedPatch.notifyCustomer = Boolean(patch.notifyCustomer);
    if (patch.autoTicket !== undefined) validatedPatch.autoTicket = Boolean(patch.autoTicket);
    if (patch.dryRun !== undefined) validatedPatch.dryRun = Boolean(patch.dryRun);
    if (patch.alertPhone !== undefined) validatedPatch.alertPhone = patch.alertPhone ? String(patch.alertPhone).trim() : null;
    if (patch.lastRunAt !== undefined) validatedPatch.lastRunAt = patch.lastRunAt;
    if (patch.lastRunSummary !== undefined) validatedPatch.lastRunSummary = patch.lastRunSummary;

    const sql = `
      UPDATE companies
      SET settings = jsonb_set(
            COALESCE(NULLIF(settings,'')::jsonb, '{}'::jsonb),
            '{shipping_followup}',
            COALESCE(COALESCE(NULLIF(settings,'')::jsonb,'{}'::jsonb)->'shipping_followup', '{}'::jsonb) || $1::jsonb
          )::text,
          "updatedAt" = NOW()
      WHERE id = $2;
    `;

    await sharedDb.safeQuery((prisma) =>
      prisma.$executeRawUnsafe(sql, JSON.stringify(validatedPatch), companyId)
    );

    return this.getSettings(companyId);
  }

  async listDelayed(companyId, options = {}) {
    if (!companyId) {
      throw new Error('companyId is required');
    }

    const minDays = options.minDays !== undefined ? Number(options.minDays) : DEFAULTS.minDays;
    if (isNaN(minDays) || minDays < 0) {
      throw new Error('عدد الأيام غير صالح');
    }

    const statuses = options.statuses || DEFAULTS.statuses;
    if (!Array.isArray(statuses) || statuses.length === 0) {
      throw new Error('قائمة الحالات لا يمكن أن تكون فارغة');
    }

    const limit = options.limit !== undefined ? Number(options.limit) : DEFAULTS.maxPerRun;
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      throw new Error('الحد الأقصى غير صالح');
    }

    const sql = `
      SELECT o.id, o."orderNumber", o.status, o."customStatusCode",
             o."customerName", o."customerPhone",
             o."turboCaptainName", o."turboCaptainPhone", o."turboDelayReason",
             o."turboTrackingNumber",
             COALESCE(MAX(h."createdAt"), o."createdAt") AS "lastChangeAt",
             FLOOR(EXTRACT(EPOCH FROM (NOW() - COALESCE(MAX(h."createdAt"), o."createdAt"))) / 86400)::int AS "daysInStatus"
      FROM orders o
      LEFT JOIN "OrderStatusHistory" h ON h."orderId" = o.id
      WHERE o."companyId" = $1
        AND o.status::text = ANY($2::text[])
      GROUP BY o.id
      HAVING COALESCE(MAX(h."createdAt"), o."createdAt") < NOW() - ($3::text || ' days')::interval
      ORDER BY "lastChangeAt" ASC
      LIMIT $4;
    `;

    const rows = await sharedDb.safeQuery((prisma) =>
      prisma.$queryRawUnsafe(sql, companyId, statuses, String(minDays), limit)
    );

    return (rows || []).map((row) => ({
      id: row.id,
      orderId: row.id,
      orderNumber: row.orderNumber,
      status: row.status,
      customStatusCode: row.customStatusCode || null,
      customerName: row.customerName || null,
      customerPhone: row.customerPhone || null,
      turboCaptainName: row.turboCaptainName || null,
      turboCaptainPhone: row.turboCaptainPhone || null,
      turboDelayReason: row.turboDelayReason || null,
      turboTrackingNumber: row.turboTrackingNumber || null,
      trackingNumber: row.turboTrackingNumber || null,
      lastChangeAt: row.lastChangeAt,
      daysInStatus: Number(row.daysInStatus || 0),
    }));
  }

  buildPlan(order, settings) {
    const minDays = Number(settings?.minDays ?? DEFAULTS.minDays);
    const daysInStatus = Number(order?.daysInStatus ?? 0);
    const autoTicket = Boolean(settings?.autoTicket);

    if (autoTicket && daysInStatus >= minDays * 2) {
      return 'TICKET';
    }
    return 'ALERT';
  }

  async claimAlert(companyId, alertKey, payload = {}) {
    try {
      await sharedDb.safeQuery((prisma) =>
        prisma.aiRuntimeLedger.create({
          data: {
            companyId,
            idempotencyKey: alertKey,
            channel: 'SYSTEM',
            status: 'RUNNING',
            metadata: typeof payload === 'string' ? payload : JSON.stringify(payload),
          },
        })
      );
      return true;
    } catch (err) {
      if (
        err.code === 'P2002' ||
        err.message?.includes('P2002') ||
        err.message?.includes('Unique constraint')
      ) {
        return false;
      }
      throw err;
    }
  }

  async updateLedgerStatus(alertKey, status, extra = {}) {
    try {
      await sharedDb.safeQuery((prisma) =>
        prisma.aiRuntimeLedger.update({
          where: { idempotencyKey: alertKey },
          data: {
            status,
            completedAt: status === 'COMPLETED' ? new Date() : null,
            ...extra,
          },
        })
      );
    } catch (e) {
      console.warn(`[shippingFollowUp] Failed to update ledger status for ${alertKey}:`, e.message);
    }
  }

  async runCompany(companyId, options = {}) {
    const company = await sharedDb.safeQuery((prisma) =>
      prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, name: true, phone: true, settings: true },
      })
    );

    if (!company) {
      return { scanned: 0, alerts: 0, tickets: 0, errors: ['الشركة غير موجودة'] };
    }

    const raw = this._parseSettings(company.settings);
    // Coexistence rule (mandatory): T26 owns if shippingAgent.enabled is true
    if (raw.shippingAgent?.enabled === true) {
      return { skipped: 'OWNED_BY_T26', scanned: 0, alerts: 0, tickets: 0, errors: [] };
    }

    const settings = {
      ...DEFAULTS,
      ...(raw.shipping_followup || {}),
      alertPhone: (raw.shipping_followup && raw.shipping_followup.alertPhone) || company.phone || null,
    };

    const dryRun = options.dryRun !== undefined ? Boolean(options.dryRun) : Boolean(settings.dryRun);
    const isEnabled = options.force ? true : settings.enabled;

    if (!isEnabled) {
      return { skipped: 'DISABLED', scanned: 0, alerts: 0, tickets: 0, errors: [] };
    }

    const limit = options.limit !== undefined ? Number(options.limit) : (settings.maxPerRun || DEFAULTS.maxPerRun);
    const minDays = options.minDays !== undefined ? Number(options.minDays) : (settings.minDays || DEFAULTS.minDays);
    const statuses = options.statuses || settings.statuses || DEFAULTS.statuses;

    const delayedOrders = await this.listDelayed(companyId, { minDays, statuses, limit });

    let scanned = delayedOrders.length;
    let alerts = 0;
    let tickets = 0;
    const errors = [];

    const dateKey = new Date().toISOString().slice(0, 10);

    for (const order of delayedOrders) {
      const alertKey = `ship:${companyId}:${order.id}:${order.status}:${dateKey}`;
      const plan = this.buildPlan(order, settings);

      const payload = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        daysInStatus: order.daysInStatus,
        plan,
        dryRun,
      };

      const claimed = await this.claimAlert(companyId, alertKey, payload);
      if (!claimed) {
        // Already claimed today, skip idempotently
        continue;
      }

      if (dryRun) {
        // Record in platform visible notifications
        try {
          await sharedDb.safeQuery((prisma) =>
            prisma.aiNotification.create({
              data: {
                companyId,
                type: 'AGENT_SHIPPING_DELAY',
                severity: order.daysInStatus >= settings.minDays * 2 ? 'high' : 'medium',
                title: `تأخير شحنة الطلب #${order.orderNumber}`,
                message: `الطلب #${order.orderNumber} متأخر في حالة ${order.status} منذ ${order.daysInStatus} يوم.`,
                metadata: JSON.stringify({
                  slug: 'shipping-agent',
                  alertKey,
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  daysInStatus: order.daysInStatus,
                  dryRun: true,
                }),
              },
            })
          );
        } catch (nErr) {
          errors.push(`AiNotification failed: ${nErr.message}`);
        }

        await this.updateLedgerStatus(alertKey, 'COMPLETED');
        alerts++;
        continue;
      }

      // Live Run (dryRun = false)
      let sendSuccess = false;
      const message = `تنبيه تأخير شحنة — متجر ${company.name || ''}\n\nالطلب رقم: #${order.orderNumber}\nالحالة الحالية: ${order.status}${order.customStatusCode ? ` (${order.customStatusCode})` : ''}\nمدة البقاء في الحالة: ${order.daysInStatus} يوم\nالعميل: ${order.customerName || 'غير محدد'}\nرقم العميل: ${order.customerPhone || 'غير محدد'}\nرقم التتبع: ${order.turboTrackingNumber || 'لا يوجد'}${order.turboCaptainName ? `\nالمندوب: ${order.turboCaptainName} (${order.turboCaptainPhone || ''})` : ''}${order.turboDelayReason ? `\nسبب التأخير: ${order.turboDelayReason}` : ''}\n\nيُرجى المتابعة لحل مشكلة التسليم.`;

      if (settings.notifyAdmin) {
        const recipientPhone = settings.alertPhone || company.phone;
        if (recipientPhone) {
          try {
            const sendRes = await WhatsAppNotificationService.sendNotification({
              companyId,
              recipientPhone,
              recipientName: 'مدير المتجر',
              recipientType: 'ADMIN',
              category: 'SYSTEM',
              eventType: 'ANNOUNCEMENT',
              contentOverride: message,
              priority: 1,
            });
            if (sendRes && sendRes.success !== false) {
              sendSuccess = true;
            } else {
              errors.push(`WhatsApp send unsuccessful for order ${order.orderNumber}: ${sendRes?.message || 'unknown'}`);
            }
          } catch (wErr) {
            errors.push(`WhatsApp send failed for order ${order.orderNumber}: ${wErr.message}`);
          }
        } else {
          errors.push(`No recipient phone configured for company ${companyId}`);
        }
      }

      if (settings.notifyCustomer && order.customerPhone) {
        try {
          const customerMsg = `مرحباً ${order.customerName || 'عميلنا العزيز'}.\nنود إبلاغكم بأن طلبكم رقم #${order.orderNumber} قيد المتابعة مع شركة الشحن لتسليمه في أقرب وقت. سنوافيكم بأي تحديث فور توفره.`;
          await WhatsAppNotificationService.sendNotification({
            companyId,
            recipientPhone: order.customerPhone,
            recipientName: order.customerName || 'العميل',
            recipientType: 'CUSTOMER',
            category: 'SYSTEM',
            eventType: 'ANNOUNCEMENT',
            contentOverride: customerMsg,
            priority: 2,
          });
        } catch (cSendErr) {
          errors.push(`Customer WhatsApp send failed for order ${order.orderNumber}: ${cSendErr.message}`);
        }
      }

      // Auto Ticket escalation if plan is TICKET
      if (settings.autoTicket && plan === 'TICKET') {
        const ticketKey = `shipticket:${companyId}:${order.id}:${dateKey}`;
        const ticketClaimed = await this.claimAlert(companyId, ticketKey, { orderId: order.id, type: 'autoTicket' });
        if (ticketClaimed) {
          try {
            const turbo = new TurboService(null, companyId);
            await turbo.addTicket(
              `متابعة تأخير تسليم الطلب #${order.orderNumber}. مر عليه ${order.daysInStatus} يوم في حالة ${order.status}.`,
              null,
              order.orderNumber,
              [],
              'high',
              'shipping'
            );
            await this.updateLedgerStatus(ticketKey, 'COMPLETED');
            tickets++;
          } catch (tErr) {
            errors.push(`Turbo ticket creation failed for order ${order.orderNumber}: ${tErr.message}`);
            await this.updateLedgerStatus(ticketKey, 'FAILED');
          }
        }
      }

      // Record visible platform notification
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId,
              type: 'AGENT_SHIPPING_DELAY',
              severity: order.daysInStatus >= settings.minDays * 2 ? 'high' : 'medium',
              title: `تأخير شحنة الطلب #${order.orderNumber}`,
              message: `الطلب #${order.orderNumber} متأخر في حالة ${order.status} منذ ${order.daysInStatus} يوم.`,
              metadata: JSON.stringify({
                slug: 'shipping-agent',
                alertKey,
                orderId: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                daysInStatus: order.daysInStatus,
                dryRun: false,
                sendSuccess,
              }),
            },
          })
        );
      } catch (nErr) {
        errors.push(`AiNotification failed: ${nErr.message}`);
      }

      await this.updateLedgerStatus(alertKey, 'COMPLETED');
      alerts++;
    }

    const summary = { scanned, alerts, tickets, errors: errors.length };

    try {
      await this.updateSettings(companyId, {
        lastRunAt: new Date().toISOString(),
        lastRunSummary: summary,
      });
    } catch (saveErr) {
      console.warn(`[shippingFollowUp] Failed to save lastRunSummary:`, saveErr.message);
    }

    return { scanned, alerts, tickets, errors };
  }

  async runAll(options = {}) {
    let totalScanned = 0;
    let totalAlerts = 0;
    let totalTickets = 0;
    const allErrors = [];

    try {
      const companyApps = await sharedDb.safeQuery((prisma) =>
        prisma.companyApp.findMany({
          where: {
            status: 'ACTIVE',
            app: { slug: 'order-core' },
          },
          select: { companyId: true },
        })
      );

      const companyIds = [...new Set((companyApps || []).map((ca) => ca.companyId).filter(Boolean))];

      for (const companyId of companyIds) {
        try {
          const res = await this.runCompany(companyId, options);
          if (res && !res.skipped) {
            totalScanned += res.scanned || 0;
            totalAlerts += res.alerts || 0;
            totalTickets += res.tickets || 0;
            if (Array.isArray(res.errors)) {
              allErrors.push(...res.errors);
            }
          }
        } catch (cErr) {
          allErrors.push(`Company ${companyId} execution failed: ${cErr.message}`);
        }
      }
    } catch (err) {
      console.error('❌ [ShippingFollowUpService] runAll error:', err);
      allErrors.push(err.message);
    }

    return {
      scanned: totalScanned,
      alerts: totalAlerts,
      tickets: totalTickets,
      errors: allErrors,
    };
  }
}

module.exports = new ShippingFollowUpService();
