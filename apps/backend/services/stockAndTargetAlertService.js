const sharedDb = require("./sharedDatabase");
const WhatsAppNotificationService = require("./whatsapp/WhatsAppNotificationService");

/**
 * Service for automated monitoring of stock levels and order target alerts.
 */
class StockAndTargetAlertService {
  /**
   * Atomic idempotency gate (T00 §2.3)
   */
  async claim(companyId, alertKey, payload) {
    try {
      await sharedDb.safeQuery((prisma) =>
        prisma.aiRuntimeLedger.create({
          data: {
            companyId,
            idempotencyKey: alertKey,
            channel: "SYSTEM",
            status: "RUNNING",
            metadata: typeof payload === "string" ? payload : JSON.stringify(payload),
          },
        }),
      );
      return true;
    } catch (e) {
      if (
        e?.code === "P2002" ||
        e?.message?.includes("P2002") ||
        e?.message?.includes("Unique constraint")
      ) {
        return false;
      }
      throw e;
    }
  }

  async updateLedgerStatus(alertKey, status, extra = {}) {
    try {
      await sharedDb.safeQuery((prisma) =>
        prisma.aiRuntimeLedger.update({
          where: { idempotencyKey: alertKey },
          data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null,
            ...extra,
          },
        }),
      );
    } catch (e) {
      console.warn(`⚠️ [StockAndTargetAlertService] Failed to update ledger status for ${alertKey}:`, e.message);
    }
  }

  /**
   * Main check routine triggered by the cron scheduler or manual route.
   */
  async runDueChecks(opts = {}) {
    let checkedCompanies = 0;
    let targetAlertsSent = 0;
    let stockAlertsSent = 0;
    let skipped = 0;
    const errors = [];

    const dryRun = Boolean(opts.dryRun);
    const force = Boolean(opts.force);

    let companies = [];
    try {
      if (opts.companyId) {
        const singleComp = await sharedDb.safeQuery((prisma) =>
          prisma.company.findUnique({
            where: { id: opts.companyId },
            select: {
              id: true,
              name: true,
              phone: true,
              settings: true,
              currency: true,
              isActive: true,
            },
          }),
        );
        if (singleComp) {
          companies = [singleComp];
        }
      } else {
        companies = await sharedDb.safeQuery((prisma) =>
          prisma.company.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              phone: true,
              settings: true,
              currency: true,
            },
          }),
        );
      }
    } catch (e) {
      console.error("❌ [StockAndTargetAlertService] Query companies error:", e);
      errors.push({ companyId: opts.companyId || "ALL", error: e.message });
      return { checkedCompanies: 0, targetAlertsSent: 0, stockAlertsSent: 0, skipped: 0, errors };
    }

    if (!Array.isArray(companies)) {
      return { checkedCompanies: 0, targetAlertsSent: 0, stockAlertsSent: 0, skipped: 0, errors: [] };
    }

    for (const company of companies) {
      checkedCompanies++;
      try {
        const settings = this._parseSettings(company.settings);
        const targetConfig = settings.order_targets || {};

        // Enabled check (§3.1 و): if undefined -> true; if false -> skip unless force
        const isEnabled = targetConfig.enabled !== undefined ? Boolean(targetConfig.enabled) : true;
        if (!isEnabled && !force) {
          skipped++;
          continue;
        }

        if (targetConfig.notify_whatsapp === false) {
          skipped++;
          continue;
        }

        const recipientPhone = targetConfig.alert_phone || company.phone;
        if (!recipientPhone) {
          skipped++;
          continue;
        }

        // 1. Check daily order target milestone
        const dailyTargetAlert = await this._evaluateDailyOrderTargets(
          company,
          targetConfig,
          recipientPhone,
          { dryRun },
        );
        if (dailyTargetAlert) targetAlertsSent++;

        // 2. Check weekly order target milestone
        const weeklyTargetAlert = await this._evaluateWeeklyOrderTargets(
          company,
          targetConfig,
          recipientPhone,
          { dryRun },
        );
        if (weeklyTargetAlert) targetAlertsSent++;

        // 3. Check low stock items
        const stockAlert = await this._evaluateStockLevels(
          company,
          targetConfig,
          recipientPhone,
          { dryRun },
        );
        if (stockAlert) stockAlertsSent++;
      } catch (err) {
        console.error(`❌ [StockAndTargetAlertService] Error checking company ${company.id}:`, err);
        errors.push({ companyId: company.id, error: err.message });
      }
    }

    return { checkedCompanies, targetAlertsSent, stockAlertsSent, skipped, errors };
  }

  async getSettings(companyId) {
    if (!companyId) {
      throw new Error("companyId is required");
    }
    const comp = await sharedDb.safeQuery((prisma) =>
      prisma.company.findUnique({
        where: { id: companyId },
        select: { phone: true, settings: true },
      }),
    );
    const parsed = this._parseSettings(comp?.settings);
    const stored = parsed.order_targets || {};
    return {
      enabled: stored.enabled !== undefined ? Boolean(stored.enabled) : false,
      daily_orders: Number(stored.daily_orders) || 0,
      weekly_orders: Number(stored.weekly_orders) || 0,
      daily_revenue: Number(stored.daily_revenue) || 0,
      weekly_revenue: Number(stored.weekly_revenue) || 0,
      min_stock_threshold: Number(stored.min_stock_threshold) || 5,
      alert_phone: stored.alert_phone || comp?.phone || null,
      notify_whatsapp: stored.notify_whatsapp !== undefined ? Boolean(stored.notify_whatsapp) : true,
      milestones: Array.isArray(stored.milestones) && stored.milestones.length > 0 ? stored.milestones : [50, 80, 100],
      last_notified_target_date: stored.last_notified_target_date || null,
      notified_milestones: stored.notified_milestones || [],
      last_notified_weekly_target_date: stored.last_notified_weekly_target_date || null,
      notified_weekly_milestones: stored.notified_weekly_milestones || [],
      last_stock_alert_date: stored.last_stock_alert_date || null,
    };
  }

  async updateSettings(companyId, patch) {
    if (!companyId) {
      throw new Error("companyId is required");
    }
    const validatedPatch = {};

    if (patch.enabled !== undefined) {
      validatedPatch.enabled = Boolean(patch.enabled);
    }
    if (patch.daily_orders !== undefined) {
      const v = Number(patch.daily_orders);
      if (isNaN(v) || v < 0) throw new Error("تارجت الأوردرات اليومي غير صالح");
      validatedPatch.daily_orders = Math.floor(v);
    }
    if (patch.weekly_orders !== undefined) {
      const v = Number(patch.weekly_orders);
      if (isNaN(v) || v < 0) throw new Error("تارجت الأوردرات الأسبوعي غير صالح");
      validatedPatch.weekly_orders = Math.floor(v);
    }
    if (patch.daily_revenue !== undefined) {
      const v = Number(patch.daily_revenue);
      if (isNaN(v) || v < 0) throw new Error("تارجت الإيراد اليومي غير صالح");
      validatedPatch.daily_revenue = v;
    }
    if (patch.weekly_revenue !== undefined) {
      const v = Number(patch.weekly_revenue);
      if (isNaN(v) || v < 0) throw new Error("تارجت الإيراد الأسبوعي غير صالح");
      validatedPatch.weekly_revenue = v;
    }
    if (patch.min_stock_threshold !== undefined) {
      const v = Number(patch.min_stock_threshold);
      if (isNaN(v) || v <= 0) throw new Error("الحد الأدنى للمخزون يجب أن يكون أكبر من صفر");
      validatedPatch.min_stock_threshold = Math.floor(v);
    }
    if (patch.alert_phone !== undefined) {
      validatedPatch.alert_phone = patch.alert_phone ? String(patch.alert_phone).trim() : null;
    }
    if (patch.notify_whatsapp !== undefined) {
      validatedPatch.notify_whatsapp = Boolean(patch.notify_whatsapp);
    }
    if (patch.milestones !== undefined) {
      if (!Array.isArray(patch.milestones) || patch.milestones.length === 0) {
        throw new Error("مراحل التنبيه لا يمكن أن تكون فارغة");
      }
      const cleaned = patch.milestones
        .map((m) => Number(String(m).replace("%", "")))
        .filter((n) => !isNaN(n) && n > 0);
      if (cleaned.length === 0) {
        throw new Error("مراحل التنبيه لا يمكن أن تكون فارغة");
      }
      validatedPatch.milestones = cleaned;
    }

    await this._persistTargetMeta(companyId, validatedPatch);
    return this.getSettings(companyId);
  }

  getWeekStartDate(now = new Date()) {
    const date = new Date(now);
    // Saturday as week start in Egypt / MENA retail calendar
    const day = date.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const diff = (day + 1) % 7;
    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Alias for backward compatibility
  async _evaluateOrderTargets(company, targetConfig, recipientPhone, options = {}) {
    return this._evaluateDailyOrderTargets(company, targetConfig, recipientPhone, options);
  }

  async _evaluateDailyOrderTargets(company, targetConfig, recipientPhone, options = {}) {
    const dailyTarget = Number(targetConfig.daily_orders) || 0;
    if (dailyTarget <= 0) return false;

    const dryRun = Boolean(options.dryRun);
    const now = new Date();
    const todayDateKey = now.toISOString().slice(0, 10);
    const lastNotifiedKey = targetConfig.last_notified_target_date;
    let notifiedMilestones = Array.isArray(targetConfig.notified_milestones)
      ? [...targetConfig.notified_milestones]
      : [];

    // Reset milestones if new day
    if (lastNotifiedKey !== todayDateKey) {
      notifiedMilestones = [];
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const todayOrdersCount = await sharedDb.safeQuery((prisma) =>
      prisma.order.count({
        where: {
          companyId: company.id,
          createdAt: { gte: todayStart },
          status: { not: "CANCELLED" },
        },
      }),
    );

    const pct = Math.round((todayOrdersCount / dailyTarget) * 100);

    const rawMilestones =
      Array.isArray(targetConfig.milestones) && targetConfig.milestones.length > 0
        ? targetConfig.milestones
        : [50, 80, 100];
    const milestones = rawMilestones
      .map((m) => Number(String(m).replace("%", "")))
      .filter((n) => !isNaN(n) && n > 0);

    // Calculate highest reached milestone
    const reached = milestones.filter((m) => pct >= m).sort((a, b) => b - a)[0];
    if (!reached) return false;

    const milestoneToTrigger = `${reached}%`;
    if (
      notifiedMilestones.includes(milestoneToTrigger) ||
      notifiedMilestones.includes(reached) ||
      notifiedMilestones.includes(String(reached))
    ) {
      return false;
    }

    const alertKey = `target:${company.id}:daily:${todayDateKey}:${reached}`;
    const payload = {
      period: "daily",
      milestone: milestoneToTrigger,
      actualOrders: todayOrdersCount,
      targetOrders: dailyTarget,
      pct,
      dryRun,
    };

    const claimed = await this.claim(company.id, alertKey, payload);
    if (!claimed) {
      return false;
    }

    const message = this._formatTargetAlertMessage({
      storeName: company.name,
      milestone: milestoneToTrigger,
      actualOrders: todayOrdersCount,
      targetOrders: dailyTarget,
      percentage: pct,
    });

    if (dryRun) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_TARGET_MILESTONE",
              severity: "medium",
              title: `تارجت daily ${reached}%`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                period: "daily",
                dryRun: true,
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      const updatedNotified = [...new Set([...notifiedMilestones, milestoneToTrigger])];
      await this._persistTargetMeta(company.id, {
        last_notified_target_date: todayDateKey,
        notified_milestones: updatedNotified,
      });
      return true;
    }

    const sent = await this._sendWhatsApp(company.id, recipientPhone, message);
    if (sent) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_TARGET_MILESTONE",
              severity: "medium",
              title: `تارجت daily ${reached}%`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                period: "daily",
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      const updatedNotified = [...new Set([...notifiedMilestones, milestoneToTrigger])];
      await this._persistTargetMeta(company.id, {
        last_notified_target_date: todayDateKey,
        notified_milestones: updatedNotified,
      });
      return true;
    } else {
      await this.updateLedgerStatus(alertKey, "FAILED");
      return false;
    }
  }

  async _evaluateWeeklyOrderTargets(company, targetConfig, recipientPhone, options = {}) {
    const weeklyTarget = Number(targetConfig.weekly_orders) || 0;
    if (weeklyTarget <= 0) return false;

    const dryRun = Boolean(options.dryRun);
    const now = new Date();
    const weekStartDate = this.getWeekStartDate(now);
    const weekDateKey = weekStartDate.toISOString().slice(0, 10);
    const lastNotifiedWeekKey = targetConfig.last_notified_weekly_target_date;
    let notifiedWeeklyMilestones = Array.isArray(targetConfig.notified_weekly_milestones)
      ? [...targetConfig.notified_weekly_milestones]
      : [];

    // Reset milestones if new week
    if (lastNotifiedWeekKey !== weekDateKey) {
      notifiedWeeklyMilestones = [];
    }

    const weekOrdersCount = await sharedDb.safeQuery((prisma) =>
      prisma.order.count({
        where: {
          companyId: company.id,
          createdAt: { gte: weekStartDate },
          status: { not: "CANCELLED" },
        },
      }),
    );

    const pct = Math.round((weekOrdersCount / weeklyTarget) * 100);

    const rawMilestones =
      Array.isArray(targetConfig.milestones) && targetConfig.milestones.length > 0
        ? targetConfig.milestones
        : [50, 80, 100];
    const milestones = rawMilestones
      .map((m) => Number(String(m).replace("%", "")))
      .filter((n) => !isNaN(n) && n > 0);

    const reached = milestones.filter((m) => pct >= m).sort((a, b) => b - a)[0];
    if (!reached) return false;

    const milestoneToTrigger = `${reached}%`;
    if (
      notifiedWeeklyMilestones.includes(milestoneToTrigger) ||
      notifiedWeeklyMilestones.includes(reached) ||
      notifiedWeeklyMilestones.includes(String(reached))
    ) {
      return false;
    }

    const alertKey = `target:${company.id}:weekly:${weekDateKey}:${reached}`;
    const payload = {
      period: "weekly",
      milestone: milestoneToTrigger,
      actualOrders: weekOrdersCount,
      targetOrders: weeklyTarget,
      pct,
      dryRun,
    };

    const claimed = await this.claim(company.id, alertKey, payload);
    if (!claimed) {
      return false;
    }

    const remainingOrders = Math.max(0, weeklyTarget - weekOrdersCount);
    const message = this._formatWeeklyTargetAlertMessage({
      storeName: company.name,
      milestone: milestoneToTrigger,
      actualOrders: weekOrdersCount,
      targetOrders: weeklyTarget,
      percentage: pct,
      remainingOrders,
    });

    if (dryRun) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_TARGET_MILESTONE",
              severity: "medium",
              title: `تارجت weekly ${reached}%`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                period: "weekly",
                dryRun: true,
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      const updatedWeekly = [...new Set([...notifiedWeeklyMilestones, milestoneToTrigger])];
      await this._persistTargetMeta(company.id, {
        last_notified_weekly_target_date: weekDateKey,
        notified_weekly_milestones: updatedWeekly,
      });
      return true;
    }

    const sent = await this._sendWhatsApp(company.id, recipientPhone, message);
    if (sent) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_TARGET_MILESTONE",
              severity: "medium",
              title: `تارجت weekly ${reached}%`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                period: "weekly",
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      const updatedWeekly = [...new Set([...notifiedWeeklyMilestones, milestoneToTrigger])];
      await this._persistTargetMeta(company.id, {
        last_notified_weekly_target_date: weekDateKey,
        notified_weekly_milestones: updatedWeekly,
      });
      return true;
    } else {
      await this.updateLedgerStatus(alertKey, "FAILED");
      return false;
    }
  }

  async _evaluateStockLevels(company, targetConfig, recipientPhone, options = {}) {
    const threshold = Number(targetConfig.min_stock_threshold) || 5;
    const dryRun = Boolean(options.dryRun);
    const now = new Date();
    const todayDateKey = now.toISOString().slice(0, 10);
    const alertKey = `stock:${company.id}:${todayDateKey}`;

    // Scan products
    const lowStockProducts = await sharedDb.safeQuery((prisma) =>
      prisma.product.findMany({
        where: {
          companyId: company.id,
          deletedAt: null,
          isActive: true,
          trackInventory: true,
          stock: { lte: threshold },
        },
        select: {
          name: true,
          sku: true,
          stock: true,
        },
        orderBy: { stock: "asc" },
        take: 8,
      }),
    );

    // Scan variants
    const lowStockVariants = await sharedDb.safeQuery((prisma) =>
      prisma.productVariant.findMany({
        where: {
          product: { companyId: company.id, deletedAt: null, isActive: true },
          isActive: true,
          trackInventory: true,
          stock: { lte: threshold },
        },
        select: {
          name: true,
          sku: true,
          stock: true,
          product: { select: { name: true } },
        },
        orderBy: { stock: "asc" },
        take: 8,
      }),
    );

    const items = [];
    if (Array.isArray(lowStockProducts)) {
      for (const p of lowStockProducts) {
        items.push({
          name: p.name,
          sku: p.sku || "N/A",
          stock: p.stock,
          isVariant: false,
        });
      }
    }

    if (Array.isArray(lowStockVariants)) {
      for (const v of lowStockVariants) {
        items.push({
          name: `${v.product?.name || ""} (${v.name})`,
          sku: v.sku || "N/A",
          stock: v.stock,
          isVariant: true,
        });
      }
    }

    if (items.length === 0) {
      return false;
    }

    const payload = {
      type: "stock",
      threshold,
      totalLowItems: items.length,
      dryRun,
    };

    const claimed = await this.claim(company.id, alertKey, payload);
    if (!claimed) {
      return false;
    }

    // Sort by stock ascending
    items.sort((a, b) => a.stock - b.stock);
    const topItems = items.slice(0, 6);

    const message = this._formatStockAlertMessage({
      storeName: company.name,
      totalLowItems: items.length,
      items: topItems,
      threshold,
    });

    if (dryRun) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_STOCK_LOW",
              severity: "high",
              title: `تنبيه رصيد المخزون — ${company.name}`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                totalLowItems: items.length,
                dryRun: true,
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      await this._persistTargetMeta(company.id, {
        last_stock_alert_date: todayDateKey,
      });
      return true;
    }

    const sent = await this._sendWhatsApp(company.id, recipientPhone, message);
    if (sent) {
      try {
        await sharedDb.safeQuery((prisma) =>
          prisma.aiNotification.create({
            data: {
              companyId: company.id,
              type: "AGENT_STOCK_LOW",
              severity: "high",
              title: `تنبيه رصيد المخزون — ${company.name}`,
              message,
              metadata: JSON.stringify({
                slug: "stock-target-monitor-agent",
                alertKey,
                totalLowItems: items.length,
              }),
            },
          }),
        );
      } catch (nErr) {
        console.warn(`[StockAndTargetAlertService] AiNotification create error:`, nErr.message);
      }
      await this.updateLedgerStatus(alertKey, "COMPLETED");
      await this._persistTargetMeta(company.id, {
        last_stock_alert_date: todayDateKey,
      });
      return true;
    } else {
      await this.updateLedgerStatus(alertKey, "FAILED");
      return false;
    }
  }

  _formatTargetAlertMessage({ storeName, milestone, actualOrders, targetOrders, percentage }) {
    if (milestone === "100%") {
      return `مرحباً، متجر ${storeName}.\n\nتم تحقيق تارجت اليوم بنجاح بنسبة 100%!\n\n- إجمالي الأوردرات المحققة: ${actualOrders}\n- الهدف المستهدف: ${targetOrders}\n- نسبة الإنجاز: ${percentage}%\n\nاستمروا في التقدم لمضاعفة النتائج حتى نهاية اليوم.`;
    }
    return `مرحباً، متجر ${storeName}.\n\nتحديث أداء المبيعات: تم الوصول إلى ${milestone} من تارجت اليوم.\n\n- الأوردرات الحالية: ${actualOrders} من ${targetOrders}\n- نسبة الإنجاز: ${percentage}%\n- المتبقي لتحقيق الهدف: ${Math.max(0, targetOrders - actualOrders)} أوردر.`;
  }

  _formatWeeklyTargetAlertMessage({ storeName, milestone, actualOrders, targetOrders, percentage, remainingOrders }) {
    if (milestone === "100%") {
      return `مرحباً، متجر ${storeName}.\n\nتم تحقيق تارجت الأسبوع بنجاح بنسبة 100%!\n\n- إجمالي أوردرات الأسبوع المحققة: ${actualOrders}\n- الهدف الأسبوعي المستهدف: ${targetOrders}\n- نسبة الإنجاز: ${percentage}%\n\nاستمروا في التقدم لمضاعفة النتائج حتى نهاية الأسبوع.`;
    }
    return `مرحباً، متجر ${storeName}.\n\nتحديث أداء المبيعات الأسبوعي: تم الوصول إلى ${milestone} من تارجت الأسبوع.\n\n- الأوردرات المحققة هذا الأسبوع: ${actualOrders} من ${targetOrders}\n- نسبة الإنجاز الأسبوعي: ${percentage}%\n- المتبقي لتحقيق الهدف الأسبوعي: ${remainingOrders} أوردر.`;
  }

  _formatStockAlertMessage({ storeName, totalLowItems, items, threshold }) {
    const listLines = items
      .map((it) => `• ${it.name}: المتبقي ${it.stock} قطعة ${it.stock <= 0 ? "(نافد)" : ""}`)
      .join("\n");

    return `تنبيه رصيد المخزون — متجر ${storeName}\n\nيوجد ${totalLowItems} صنف قارب على النفاد أو نفد تماماً (الحد الأدنى: ${threshold} قطع):\n\n${listLines}\n\nيُرجى مراجعة المخزون وتجهيز أذون التوريد لتجنب توقف المبيعات.`;
  }

  async _sendWhatsApp(companyId, recipientPhone, message) {
    try {
      const res = await WhatsAppNotificationService.sendNotification({
        companyId,
        recipientPhone,
        recipientName: "مدير المتجر",
        recipientType: "ADMIN",
        category: "SYSTEM",
        eventType: "ANNOUNCEMENT",
        contentOverride: message,
        priority: 1,
      });
      return res && res.success !== false;
    } catch (e) {
      console.error(`⚠️ [StockAndTargetAlertService] WhatsApp send failed for company ${companyId}:`, e.message);
      return false;
    }
  }

  async _persistTargetMeta(companyId, metaUpdates) {
    try {
      const sql = `
        UPDATE companies
        SET settings = jsonb_set(
              COALESCE(NULLIF(settings,'')::jsonb, '{}'::jsonb),
              '{order_targets}',
              COALESCE(COALESCE(NULLIF(settings,'')::jsonb,'{}'::jsonb)->'order_targets', '{}'::jsonb) || $1::jsonb
            )::text,
            "updatedAt" = NOW()
        WHERE id = $2;
      `;
      await sharedDb.safeQuery((prisma) =>
        prisma.$executeRawUnsafe(sql, JSON.stringify(metaUpdates), companyId),
      );
    } catch (e) {
      console.error(`⚠️ [StockAndTargetAlertService] Failed to persist meta:`, e.message);
    }
  }

  _parseSettings(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
}

module.exports = new StockAndTargetAlertService();
