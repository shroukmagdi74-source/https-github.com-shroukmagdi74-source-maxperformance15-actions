const { toCanonicalE164 } = require('../utils/phoneNormalization');
const { buildEffectiveCustomerListWhere } = require('../utils/customerListCriteria');

/**
 * Resolve audience for a broadcast campaign.
 *
 * @param {Object} params
 * @param {Object} params.prisma - Prisma client
 * @param {Object} params.campaign - BroadcastCampaign object
 * @param {string} params.companyId - Company ID
 * @param {number} [params.maxRecipients] - Override maxRecipientsPerRun
 * @returns {Promise<{ phones: Array<{phone: string, phoneNormalized: string, customerId: string|null, name: string|null}>, excludedCount: number, cappedCount: number, totalMatched: number, source: string }>}
 */
async function resolveAudience({ prisma, campaign, companyId, maxRecipients }) {
  const mode = campaign.audienceMode || 'fixed';
  if (mode === 'dynamic') {
    return resolveDynamicAudience({ prisma, campaign, companyId, maxRecipients });
  }
  return resolveFixedAudience({ prisma, campaign, companyId, maxRecipients });
}

/**
 * Resolve fixed audience from stored snapshots.
 */
async function resolveFixedAudience({ prisma, campaign, companyId, maxRecipients }) {
  const snapshots = await prisma.broadcastCampaignSnapshot.findMany({
    where: { campaignId: campaign.id },
    select: {
      phone: true,
      phoneNormalized: true,
      customerId: true,
      customerName: true,
    },
  });

  if (!snapshots || snapshots.length === 0) {
    // Legacy campaign created before snapshot feature -> fall back to legacy behavior
    return {
      phones: [],
      excludedCount: 0,
      cappedCount: 0,
      totalMatched: 0,
      source: 'legacy',
    };
  }

  const seenInRun = new Set();
  const rawCandidates = [];
  for (const s of snapshots) {
    if (!s.phone || typeof s.phone !== 'string' || !s.phone.trim()) continue;
    const can = toCanonicalE164(s.phone);
    if (!can || seenInRun.has(can)) continue;
    seenInRun.add(can);
    rawCandidates.push({
      phone: s.phone,
      phoneNormalized: s.phoneNormalized || can,
      customerId: s.customerId || null,
      name: s.customerName || null,
    });
  }

  const totalMatched = rawCandidates.length;
  let excludedCount = 0;
  let candidates = rawCandidates;

  if (campaign.onlyNew && campaign.id) {
    const reached = await prisma.broadcastRecipient.findMany({
      where: {
        campaignId: campaign.id,
        status: { in: ['sent', 'delivered'] },
      },
      select: { customerPhone: true },
    });
    const sentSet = new Set(
      (reached || []).map((r) => toCanonicalE164(r.customerPhone)).filter(Boolean)
    );

    candidates = candidates.filter((c) => {
      const can = toCanonicalE164(c.phone);
      if (can && sentSet.has(can)) {
        excludedCount++;
        return false;
      }
      return true;
    });
  }

  const cap =
    maxRecipients !== undefined && maxRecipients !== null
      ? maxRecipients
      : campaign.maxRecipientsPerRun || 500;

  let cappedCount = 0;
  if (cap > 0 && candidates.length > cap) {
    cappedCount = candidates.length - cap;
    candidates = candidates.slice(0, cap);
  }

  return {
    phones: candidates,
    excludedCount,
    cappedCount,
    totalMatched,
    source: 'fixed',
  };
}

/**
 * Resolve dynamic audience by evaluating customer list criteria on each run.
 */
async function resolveDynamicAudience({ prisma, campaign, companyId, maxRecipients }) {
  let baseWhere = { companyId };

  if (campaign.audienceListId) {
    const list = await prisma.customerList.findUnique({
      where: { id: campaign.audienceListId },
    });
    if (!list) {
      throw new Error(`CustomerList ${campaign.audienceListId} not found`);
    }
    if (list.companyId !== companyId) {
      throw new Error(`Access denied to CustomerList ${campaign.audienceListId}`);
    }
    const criteriaRes = await buildEffectiveCustomerListWhere(prisma, companyId, list.criteria);
    baseWhere = criteriaRes.where || criteriaRes;
  } else if (campaign.audienceCriteria) {
    const criteriaRes = await buildEffectiveCustomerListWhere(
      prisma,
      companyId,
      campaign.audienceCriteria
    );
    baseWhere = criteriaRes.where || criteriaRes;
  }

  const customerWhere = {
    ...baseWhere,
    companyId,
    phone: { not: null },
  };

  const sentSet = new Set();
  if (campaign.onlyNew && campaign.id) {
    const reached = await prisma.broadcastRecipient.findMany({
      where: {
        campaignId: campaign.id,
        status: { in: ['sent', 'delivered'] },
      },
      select: { customerPhone: true },
    });
    (reached || []).forEach((r) => {
      const can = toCanonicalE164(r.customerPhone);
      if (can) sentSet.add(can);
    });
  }

  const cap =
    maxRecipients !== undefined && maxRecipients !== null
      ? maxRecipients
      : campaign.maxRecipientsPerRun || 500;

  const accepted = [];
  let excludedCount = 0;
  let cappedCount = 0;
  let totalMatched = 0;
  const seenInRun = new Set();

  let cursor = null;
  const pageSize = 500;

  while (true) {
    const queryArgs = {
      where: customerWhere,
      select: {
        id: true,
        phone: true,
        phoneNormalized: true,
        firstName: true,
        lastName: true,
      },
      take: pageSize,
      orderBy: { id: 'asc' },
    };
    if (cursor) {
      queryArgs.skip = 1;
      queryArgs.cursor = { id: cursor };
    }

    const page = await prisma.customer.findMany(queryArgs);
    if (!page || page.length === 0) break;

    for (const c of page) {
      if (!c.phone || typeof c.phone !== 'string' || !c.phone.trim()) continue;
      const can = toCanonicalE164(c.phone);
      if (!can) continue;
      if (seenInRun.has(can)) continue;
      seenInRun.add(can);
      totalMatched++;

      if (sentSet.has(can)) {
        excludedCount++;
        continue;
      }

      if (accepted.length < cap) {
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || null;
        accepted.push({
          phone: c.phone,
          phoneNormalized: c.phoneNormalized || can,
          customerId: c.id,
          name,
        });
      } else {
        cappedCount++;
      }
    }

    if (page.length < pageSize) break;
    cursor = page[page.length - 1].id;
  }

  return {
    phones: accepted,
    excludedCount,
    cappedCount,
    totalMatched,
    source: 'dynamic',
  };
}

/**
 * Preview audience counts without saving any records or returning raw rows.
 */
async function previewAudience({
  prisma,
  companyId,
  audienceMode = 'fixed',
  audienceListId,
  audienceCriteria,
  manualPhones,
  onlyNew = false,
  maxRecipients = 500,
  campaignId,
}) {
  const cap = Number(maxRecipients) > 0 ? Number(maxRecipients) : 500;

  if (audienceMode === 'fixed') {
    let phonesList = [];
    if (campaignId) {
      const snapshots = await prisma.broadcastCampaignSnapshot.findMany({
        where: { campaignId },
        select: { phone: true, customerName: true, customerId: true, phoneNormalized: true },
      });
      if (snapshots && snapshots.length > 0) {
        phonesList = snapshots.map((s) => s.phone);
      }
    }

    if (phonesList.length === 0) {
      if (Array.isArray(manualPhones)) {
        phonesList = manualPhones;
      } else if (typeof manualPhones === 'string' && manualPhones.trim()) {
        try {
          const parsed = JSON.parse(manualPhones);
          phonesList = Array.isArray(parsed) ? parsed : [manualPhones];
        } catch {
          phonesList = manualPhones
            .split(/[\r\n,]+/)
            .map((p) => p.trim())
            .filter(Boolean);
        }
      } else if (audienceListId) {
        // Load list customers for fixed preview
        const dummyCampaign = { audienceMode: 'dynamic', audienceListId, onlyNew: false };
        const dyn = await resolveDynamicAudience({
          prisma,
          campaign: dummyCampaign,
          companyId,
          maxRecipients: 100000,
        });
        phonesList = dyn.phones.map((p) => p.phone);
      }
    }

    const seen = new Set();
    const uniquePhones = [];
    for (const p of phonesList) {
      const can = toCanonicalE164(p);
      if (can && !seen.has(can)) {
        seen.add(can);
        uniquePhones.push(p);
      }
    }

    const totalMatched = uniquePhones.length;
    let excludedCount = 0;
    let validCandidates = uniquePhones;

    if (onlyNew && campaignId) {
      const reached = await prisma.broadcastRecipient.findMany({
        where: {
          campaignId,
          status: { in: ['sent', 'delivered'] },
        },
        select: { customerPhone: true },
      });
      const sentSet = new Set(
        (reached || []).map((r) => toCanonicalE164(r.customerPhone)).filter(Boolean)
      );

      validCandidates = validCandidates.filter((p) => {
        const can = toCanonicalE164(p);
        if (can && sentSet.has(can)) {
          excludedCount++;
          return false;
        }
        return true;
      });
    }

    const cappedCount = Math.max(0, validCandidates.length - cap);
    const willSendCount = Math.min(cap, validCandidates.length);

    return {
      totalMatched,
      excludedCount,
      cappedCount,
      willSendCount,
    };
  }

  // Dynamic preview
  const dummyCampaign = {
    audienceMode: 'dynamic',
    audienceListId,
    audienceCriteria,
    onlyNew,
    id: campaignId,
  };

  const resolved = await resolveDynamicAudience({
    prisma,
    campaign: dummyCampaign,
    companyId,
    maxRecipients: cap,
  });

  return {
    totalMatched: resolved.totalMatched,
    excludedCount: resolved.excludedCount,
    cappedCount: resolved.cappedCount,
    willSendCount: resolved.phones.length,
  };
}

module.exports = {
  resolveAudience,
  resolveFixedAudience,
  resolveDynamicAudience,
  previewAudience,
};
