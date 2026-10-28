/**
 * Standalone Sample Share Links Service (Wave 5 / T05)
 *
 * Implements:
 * 1. Customer and Factory public share links for Sample Orders
 * 2. Revocation (revoke), view counting, and optional expiration
 * 3. Strict token verification and company/sample isolation (zero cross-tenant or cross-sample leakage)
 * 4. Whitelabel Factory view: strictly no financial data, no customer identity, no internal design notes
 * 5. Factory acknowledgment with optional sample image upload
 * 6. Customer view with sanitized DTO, image gallery, stages, timeline, and optional money block
 */

const crypto = require('crypto');
const { getSharedPrismaClient } = require('./sharedDatabase');
const ManufacturingSampleService = require('./manufacturingSampleService');
const CustomerPortalService = require('./customerPortalService');

function httpError(status, message) {
  const err = new Error(message);
  err.statusCode = status;
  err.status = status;
  return err;
}

const STATUS_LABELS = {
  DRAFT: 'مسودة',
  IN_PROGRESS: 'قيد التنفيذ',
  APPROVED: 'معتمدة',
  REJECTED: 'مرفوضة',
  CONVERTED: 'تم التحويل',
};

function buildMoney(sample) {
  const hasFee = sample.fee != null;
  const hasTotal = sample.totalAmount != null;
  const hasDeposit = sample.depositAmount != null;
  const hasPaid = sample.paidAmount != null;

  if (!hasFee && !hasTotal && !hasDeposit && !hasPaid) {
    return null;
  }

  const total = hasTotal ? Number(sample.totalAmount) : (hasFee ? Number(sample.fee) : null);
  const deposit = hasDeposit ? Number(sample.depositAmount) : null;
  const paid = hasPaid ? Number(sample.paidAmount) : (deposit != null ? deposit : null);
  const remaining = total != null ? (total - (paid || 0)) : null;

  return {
    totalAmount: total,
    depositAmount: deposit,
    paidAmount: paid,
    remaining: remaining,
    currency: sample.currency || 'EGP',
  };
}

function buildTimeline(sample) {
  const items = [];

  if (sample.createdAt) {
    items.push({
      key: 'created',
      title: 'إنشاء العينة',
      status: 'COMPLETED',
      date: sample.createdAt,
    });
  }

  if (Array.isArray(sample.stages)) {
    sample.stages.forEach((stage) => {
      items.push({
        key: `stage-${stage.id || stage.sequence}`,
        title: `مرحلة: ${stage.name}`,
        status: stage.status,
        date: stage.completedAt || stage.startedAt || null,
        sequence: stage.sequence,
      });
    });
  }

  if (sample.status === 'APPROVED') {
    items.push({
      key: 'approved',
      title: 'اعتماد العينة',
      status: 'COMPLETED',
      date: sample.updatedAt,
      notes: sample.resultNotes || null,
    });
  } else if (sample.status === 'REJECTED') {
    items.push({
      key: 'rejected',
      title: 'رفض العينة',
      status: 'REJECTED',
      date: sample.updatedAt,
      notes: sample.resultNotes || null,
    });
  } else if (sample.status === 'CONVERTED') {
    items.push({
      key: 'converted',
      title: 'تحويل إلى أمر تصنيع',
      status: 'COMPLETED',
      date: sample.updatedAt,
    });
  }

  return items;
}

class ManufacturingSampleShareService {
  /**
   * Idempotent runtime DDL guard for PostgreSQL
   */
  static async ensureSchema() {
    try {
      const prisma = getSharedPrismaClient();
      if (!prisma.$executeRawUnsafe) return;

      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "SampleShareKind" AS ENUM ('CUSTOMER', 'FACTORY');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS "sample_share_links" (
          "id" TEXT PRIMARY KEY,
          "companyId" TEXT NOT NULL,
          "sampleOrderId" TEXT NOT NULL,
          "kind" "SampleShareKind" NOT NULL,
          "token" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3),
          "revokedAt" TIMESTAMP(3),
          "views" INTEGER NOT NULL DEFAULT 0,
          "lastViewedAt" TIMESTAMP(3),
          "factoryAckAt" TIMESTAMP(3),
          "factoryAckBy" TEXT,
          "createdById" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "sample_share_links_token_key" ON "sample_share_links"("token");
        CREATE UNIQUE INDEX IF NOT EXISTS "sample_share_links_sampleOrderId_kind_key" ON "sample_share_links"("sampleOrderId", "kind");
        CREATE INDEX IF NOT EXISTS "sample_share_links_companyId_kind_idx" ON "sample_share_links"("companyId", "kind");
      `);
    } catch (err) {
      // In SQLite/test mock environments, silently ignore
    }
  }

  /**
   * Generate or rotate a public share link for a sample order
   */
  static async generateLink(companyId, user, sampleId, { kind, expiresAt }) {
    await this.ensureSchema();
    const prisma = getSharedPrismaClient();

    const sample = await prisma.sampleOrder.findFirst({
      where: { id: sampleId, companyId },
    });
    if (!sample) {
      throw httpError(404, 'أمر العينة غير موجود');
    }

    if (!['CUSTOMER', 'FACTORY'].includes(kind)) {
      throw httpError(400, 'نوع الرابط غير صالح (CUSTOMER أو FACTORY)');
    }

    const token = crypto.randomBytes(24).toString('hex');
    let expDate = null;
    if (expiresAt) {
      expDate = new Date(expiresAt);
      if (isNaN(expDate.getTime())) {
        expDate = null;
      }
    }

    const link = await prisma.sampleShareLink.upsert({
      where: {
        sampleOrderId_kind: {
          sampleOrderId: sampleId,
          kind,
        },
      },
      create: {
        companyId,
        sampleOrderId: sampleId,
        kind,
        token,
        expiresAt: expDate,
        revokedAt: null,
        views: 0,
        lastViewedAt: null,
        factoryAckAt: null,
        factoryAckBy: null,
        createdById: user?.id || null,
      },
      update: {
        companyId,
        token,
        expiresAt: expDate,
        revokedAt: null,
        views: 0,
        lastViewedAt: null,
        factoryAckAt: null,
        factoryAckBy: null,
      },
    });

    return {
      id: link.id,
      kind: link.kind,
      token: link.token,
      url: `/share/sample/${link.token}`,
      expiresAt: link.expiresAt,
      views: link.views,
      revokedAt: link.revokedAt,
    };
  }

  /**
   * List share links for a sample order
   */
  static async listLinks(companyId, sampleId) {
    await this.ensureSchema();
    const prisma = getSharedPrismaClient();

    const sample = await prisma.sampleOrder.findFirst({
      where: { id: sampleId, companyId },
      select: { id: true },
    });
    if (!sample) {
      throw httpError(404, 'أمر العينة غير موجود');
    }

    const links = await prisma.sampleShareLink.findMany({
      where: { sampleOrderId: sampleId, companyId },
    });

    return links.map((link) => ({
      id: link.id,
      kind: link.kind,
      token: link.token,
      url: `/share/sample/${link.token}`,
      expiresAt: link.expiresAt,
      revokedAt: link.revokedAt,
      views: link.views,
      lastViewedAt: link.lastViewedAt,
      factoryAckAt: link.factoryAckAt,
      factoryAckBy: link.factoryAckBy,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));
  }

  /**
   * Revoke a share link immediately
   */
  static async revokeLink(companyId, sampleId, kind) {
    await this.ensureSchema();
    const prisma = getSharedPrismaClient();

    const sample = await prisma.sampleOrder.findFirst({
      where: { id: sampleId, companyId },
      select: { id: true },
    });
    if (!sample) {
      throw httpError(404, 'أمر العينة غير موجود');
    }

    const existing = await prisma.sampleShareLink.findFirst({
      where: { sampleOrderId: sampleId, companyId, kind },
    });
    if (!existing) {
      throw httpError(404, 'الرابط غير صالح');
    }

    if (existing.revokedAt) {
      return { success: true, alreadyRevoked: true };
    }

    await prisma.sampleShareLink.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return { success: true, revoked: true };
  }

  /**
   * Resolve and validate token (Heart of security)
   */
  static async resolveToken(token) {
    await this.ensureSchema();
    const prisma = getSharedPrismaClient();

    const link = await prisma.sampleShareLink.findUnique({
      where: { token },
    });
    if (!link) {
      throw httpError(404, 'الرابط غير صالح');
    }
    if (link.revokedAt) {
      throw httpError(410, 'الرابط غير صالح');
    }
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      throw httpError(410, 'الرابط غير صالح');
    }

    const sample = await prisma.sampleOrder.findFirst({
      where: { id: link.sampleOrderId, companyId: link.companyId },
      include: {
        stages: { orderBy: { sequence: 'asc' } },
        attachments: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!sample) {
      throw httpError(404, 'الرابط غير صالح');
    }

    return { link, sample };
  }

  /**
   * Bump view counter asynchronously (fire-and-forget)
   */
  static async bumpViews(link) {
    try {
      const prisma = getSharedPrismaClient();
      await prisma.sampleShareLink.update({
        where: { id: link.id },
        data: {
          views: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });
    } catch (_) {
      // Fire-and-forget
    }
  }

  /**
   * Public View entrypoint: returns customer view or factory view based on link kind
   */
  static async getPublicView(token) {
    const { link, sample } = await this.resolveToken(token);

    if (link.kind === 'CUSTOMER') {
      return await this.getCustomerViewFromResolved(link, sample);
    } else {
      return await this.getFactoryViewFromResolved(link, sample);
    }
  }

  /**
   * Customer View DTO (Explicit whitelist + audit tripwire)
   */
  static async getCustomerViewFromResolved(link, sample) {
    const prisma = getSharedPrismaClient();
    let company = null;
    try {
      company = await prisma.company.findUnique({
        where: { id: link.companyId },
        select: { name: true, logo: true },
      });
    } catch (_) {}

    const payload = {
      kind: 'CUSTOMER',
      sampleNumber: sample.sampleNumber,
      productName: sample.productName,
      brandName: sample.brandName || null,
      size: sample.size || null,
      color: sample.color || null,
      plannedQuantity: sample.plannedQuantity || 1,
      status: sample.status,
      statusLabel: STATUS_LABELS[sample.status] || sample.status,
      designNotes: sample.designNotes || null,
      resultNotes: sample.status === 'REJECTED' ? (sample.resultNotes || null) : null,
      createdAt: sample.createdAt,
      dueDate: sample.dueDate,
      expectedDeliveryAt: sample.expectedDeliveryAt ?? null,
      company: {
        name: company?.name || 'MaxP',
        logo: company?.logo || null,
      },
      stages: (sample.stages || []).map((s) => ({
        sequence: s.sequence,
        name: s.name,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      })),
      attachments: (sample.attachments || []).map((a) => ({
        id: a.id,
        url: a.url,
        fileName: a.fileName,
        kind: a.kind,
      })),
      money: buildMoney(sample),
      timeline: buildTimeline(sample),
    };

    // Strict security tripwire
    CustomerPortalService.auditSanitizedPayload(payload);

    await this.bumpViews(link);
    return payload;
  }

  /**
   * Factory View DTO (Whitelabel: no costs, no margins, no customer data, no design notes)
   */
  static async getFactoryViewFromResolved(link, sample) {
    const prisma = getSharedPrismaClient();
    let company = null;
    try {
      company = await prisma.company.findUnique({
        where: { id: link.companyId },
        select: { name: true },
      });
    } catch (_) {}

    const payload = {
      kind: 'FACTORY',
      sampleNumber: sample.sampleNumber,
      brandName: sample.brandName || null,
      productName: sample.productName,
      size: sample.size || null,
      color: sample.color || null,
      plannedQuantity: sample.plannedQuantity || 1,
      expectedDeliveryAt: sample.expectedDeliveryAt ?? sample.dueDate ?? null,
      status: sample.status,
      statusLabel: STATUS_LABELS[sample.status] || sample.status,
      company: {
        name: company?.name || 'MaxP',
      },
      attachments: (sample.attachments || [])
        .filter((a) => a.kind === 'IMAGE' || (a.fileName && /\.(jpe?g|png|webp)$/i.test(a.fileName)))
        .map((a) => ({
          id: a.id,
          url: a.url,
          fileName: a.fileName,
          kind: a.kind,
        })),
      ack: {
        at: link.factoryAckAt,
        by: link.factoryAckBy,
      },
    };

    await this.bumpViews(link);
    return payload;
  }

  /**
   * Factory Acknowledgment + optional image upload
   */
  static async acknowledgeFactory(token, { name, file }) {
    const { link, sample } = await this.resolveToken(token);

    if (link.kind !== 'FACTORY') {
      throw httpError(403, 'الرابط مخصص للعميل فقط');
    }

    if (link.factoryAckAt) {
      throw httpError(409, 'تم تسجيل الاستلام مسبقًا');
    }

    if (file) {
      await ManufacturingSampleService.uploadSampleFile(
        link.companyId,
        { name: 'بوابة المصنع' },
        sample.id,
        file
      );
    }

    const prisma = getSharedPrismaClient();
    const ackAt = new Date();
    const ackBy = name ? String(name).trim() : null;

    await prisma.sampleShareLink.update({
      where: { id: link.id },
      data: {
        factoryAckAt: ackAt,
        factoryAckBy: ackBy,
      },
    });

    return {
      success: true,
      ack: {
        at: ackAt,
        by: ackBy,
      },
    };
  }
}

module.exports = ManufacturingSampleShareService;
