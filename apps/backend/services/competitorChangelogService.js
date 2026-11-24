const crypto = require('crypto');
const { getSharedPrismaClient } = require('./sharedDatabase');

class CompetitorChangelogService {
  getPrisma() {
    return getSharedPrismaClient();
  }

  computeHash(text) {
    return crypto.createHash('sha256').update(text || '').digest('hex').slice(0, 16);
  }

  async getChanges(companyId, competitorId) {
    const competitor = await this.getPrisma().competitor.findFirst({
      where: { id: competitorId, companyId },
      select: { metadata: true },
    });
    if (!competitor) return [];
    const meta = (competitor.metadata && typeof competitor.metadata === 'object') ? competitor.metadata : {};
    return Array.isArray(meta.changes) ? meta.changes : [];
  }

  async recordChange(companyId, competitorId, changeData) {
    const competitor = await this.getPrisma().competitor.findFirst({
      where: { id: competitorId, companyId },
    });
    if (!competitor) return null;

    const meta = (competitor.metadata && typeof competitor.metadata === 'object') ? competitor.metadata : {};
    const existingChanges = Array.isArray(meta.changes) ? meta.changes : [];

    const newRecord = {
      id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: changeData.type || 'PRICE_CHANGE', // PRICE_CHANGE | PACKAGE_CHANGE | FEATURE_CHANGE | TECH_CHANGE
      title: changeData.title,
      description: changeData.description || '',
      diff: changeData.diff || {},
      severity: changeData.severity || 'medium',
      detectedAt: changeData.detectedAt || new Date().toISOString(),
    };

    // Keep latest 100 changes
    const updatedChanges = [newRecord, ...existingChanges].slice(0, 100);

    await this.getPrisma().competitor.update({
      where: { id: competitorId },
      data: {
        metadata: {
          ...meta,
          changes: updatedChanges,
          last_change_detected: newRecord.detectedAt,
        },
      },
    });

    return newRecord;
  }

  async detectAndRecordChanges(companyId, competitorId) {
    const competitor = await this.getPrisma().competitor.findFirst({
      where: { id: competitorId, companyId },
      include: {
        products: {
          include: {
            priceHistory: { orderBy: { recordedAt: 'desc' }, take: 5 },
          },
        },
        features: true,
      },
    });
    if (!competitor) return { count: 0, changes: [] };

    const meta = (competitor.metadata && typeof competitor.metadata === 'object') ? competitor.metadata : {};
    const existingChanges = Array.isArray(meta.changes) ? meta.changes : [];
    const recordedIds = new Set(existingChanges.map(c => c.diff?.uniqueKey).filter(Boolean));

    const detected = [];

    // 1. Detect Product / Package Price Changes
    for (const prod of competitor.products || []) {
      const history = prod.priceHistory || [];
      if (history.length >= 2) {
        const [latest, previous] = history;
        const currentP = Number(latest.price);
        const oldP = Number(previous.price);

        if (currentP !== oldP) {
          const uniqueKey = `price-${prod.id}-${oldP}-${currentP}`;
          if (!recordedIds.has(uniqueKey)) {
            const isPackage = prod.category === 'باقة';
            const diffAmount = currentP - oldP;
            const diffPercent = oldP > 0 ? (((diffAmount) / oldP) * 100).toFixed(1) : '0';
            const sign = diffAmount > 0 ? '+' : '';

            const change = {
              type: isPackage ? 'PACKAGE_CHANGE' : 'PRICE_CHANGE',
              title: isPackage ? `تعديل سعر باقة: ${prod.name}` : `تغير سعر منتج: ${prod.name}`,
              description: `تغير السعر من ${oldP} ${prod.currency} إلى ${currentP} ${prod.currency} (${sign}${diffPercent}%)`,
              diff: {
                uniqueKey,
                productId: prod.id,
                productName: prod.name,
                category: prod.category,
                oldPrice: oldP,
                newPrice: currentP,
                currency: prod.currency,
                diffAmount,
                percentChange: `${sign}${diffPercent}%`,
              },
              severity: Math.abs(diffAmount) > 500 ? 'high' : 'medium',
              detectedAt: latest.recordedAt ? new Date(latest.recordedAt).toISOString() : new Date().toISOString(),
            };
            detected.push(change);
            recordedIds.add(uniqueKey);
          }
        }
      }
    }

    // 2. Detect New Features
    for (const feat of competitor.features || []) {
      const uniqueKey = `feat-${feat.id}`;
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
      if (feat.createdAt && new Date(feat.createdAt) >= oneWeekAgo && !recordedIds.has(uniqueKey)) {
        const change = {
          type: 'FEATURE_CHANGE',
          title: `ميزة تنافسية جديدة: ${feat.title}`,
          description: feat.description || 'تم رصد ميزة تسويقية جديدة لدى المنافس',
          diff: {
            uniqueKey,
            featureId: feat.id,
            featureTitle: feat.title,
            priority: feat.priority,
          },
          severity: 'info',
          detectedAt: new Date(feat.createdAt).toISOString(),
        };
        detected.push(change);
        recordedIds.add(uniqueKey);
      }
    }

    if (detected.length > 0) {
      const updatedChanges = [...detected, ...existingChanges].slice(0, 100);
      await this.getPrisma().competitor.update({
        where: { id: competitorId },
        data: {
          metadata: {
            ...meta,
            changes: updatedChanges,
            last_change_detected: new Date().toISOString(),
          },
        },
      });
    }

    return {
      count: detected.length,
      changes: detected,
      totalChanges: existingChanges.length + detected.length,
    };
  }

  async runScheduledCycle(companyId) {
    const where = companyId ? { companyId } : {};
    const competitors = await this.getPrisma().competitor.findMany({
      where,
      select: { id: true, companyId: true, name: true },
    });

    const results = [];
    for (const comp of competitors) {
      try {
        const res = await this.detectAndRecordChanges(comp.companyId, comp.id);
        results.push({ competitorId: comp.id, name: comp.name, ...res });
      } catch (err) {
        console.error(`[CHANGELOG] Cycle error for ${comp.name}:`, err.message);
      }
    }
    return results;
  }
}

module.exports = new CompetitorChangelogService();
