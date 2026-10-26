/**
 * Customer list criteria engine.
 *
 * Converts a stored list `criteria` object into a Prisma `Customer` where clause
 * plus optional ordering/limit. Pure functions for unit testing + an async
 * resolver for the DB-backed criteria types.
 *
 * Supported criteria types:
 *   all, active (hours), inactive (days), tag,
 *   orderStatus (status + days), returnRequest (status + days),
 *   product (productId + orderStatus),
 *   latest (limit), oldest (limit), minTotalSpent (amount),
 *   minOrdersCount (count), paymentStatus (status + days),
 *   city, customerRating, combo (AND of conditions),
 *   preset (champions | atRisk | loyal | new) — RFM-ready smart templates
 */

const {
  isV2Criteria,
  buildCustomerListV2Sql,
  computeCustomerListCountV2,
  previewCustomerListCountV2,
  getCustomersInListV2,
  criteriaV2ToSummary,
} = require('./customerListCriteriaV2');

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'SCHEDULED', 'READY_FOR_PROCESSING', 'PROCESSING',
  'SHIPPED', 'DELIVERED', 'CANCELLED', 'DUPLICATE_ORDER', 'REFUNDED',
  'RETURNED', 'PARTIALLY_RETURNED', 'EXCHANGED', 'PARTIALLY_REFUNDED',
  'WOO_TAGHEZ', 'DRAFT', 'TRASH', 'READY_TO_SHIP', 'ON_HOLD', 'NOT_SHIPPED',
  'OUT_FOR_DELIVERY', 'LOST', 'PENDING_PREPARATION', 'PREPARING', 'READY',
  'QUALITY_CHECK', 'PACKAGED', 'ON_HOLD_PREP', 'PARTIALLY_DELIVERED',
  'STOCK_SHORTAGE', 'SHORTAGE_FAILED', 'PENDING_CANCELLATION',
];

const STATUS_LABELS_AR = {
  DELIVERED: 'تم التسليم',
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  SCHEDULED: 'مجدول',
  READY_FOR_PROCESSING: 'جاهز للمعالجة',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  CANCELLED: 'ملغي',
  DUPLICATE_ORDER: 'طلب مكرر',
  REFUNDED: 'مسترجع',
  RETURNED: 'مرتجع',
  PARTIALLY_RETURNED: 'مرتجع جزئياً',
  EXCHANGED: 'مستبدل',
  PARTIALLY_REFUNDED: 'مسترجع جزئياً',
  WOO_TAGHEZ: 'جاهز (Woo)',
  DRAFT: 'مسودة',
  TRASH: 'سلة المهملات',
  READY_TO_SHIP: 'جاهز للشحن',
  ON_HOLD: 'قيد الانتظار',
  NOT_SHIPPED: 'لم يُشحن',
  OUT_FOR_DELIVERY: 'خارج للتوصيل',
  LOST: 'ضائع',
  PENDING_PREPARATION: 'بانتظار التجهيز',
  PREPARING: 'يتم تجهيزه',
  READY: 'جاهز',
  QUALITY_CHECK: 'فحص الجودة',
  PACKAGED: 'تم التغليف',
  ON_HOLD_PREP: 'معلق للتجهيز',
  PARTIALLY_DELIVERED: 'تم التسليم جزئياً',
  STOCK_SHORTAGE: 'نقص في المخزون',
  SHORTAGE_FAILED: 'فشل بسبب النقص',
  PENDING_CANCELLATION: 'إلغاء معلق',
  APPROVED: 'موافقة',
  REJECTED: 'مرفوض',
  COMPLETED: 'مكتمل',
  PARTIALLY_PAID: 'مدفوع جزئياً',
  FAILED: 'فشل',
  EXCELLENT: 'ممتاز',
  GOOD: 'جيد',
  AVERAGE: 'متوسط',
  POOR: 'ضعيف',
  UNKNOWN: 'غير معروف',
};

const STATUS_LABELS_EN = {
  DELIVERED: 'Delivered',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled',
  READY_FOR_PROCESSING: 'Ready for Processing',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  CANCELLED: 'Cancelled',
  DUPLICATE_ORDER: 'Duplicate Order',
  REFUNDED: 'Refunded',
  RETURNED: 'Returned',
  PARTIALLY_RETURNED: 'Partially Returned',
  EXCHANGED: 'Exchanged',
  PARTIALLY_REFUNDED: 'Partially Refunded',
  WOO_TAGHEZ: 'Ready (Woo)',
  DRAFT: 'Draft',
  TRASH: 'Trash',
  READY_TO_SHIP: 'Ready to Ship',
  ON_HOLD: 'On Hold',
  NOT_SHIPPED: 'Not Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  LOST: 'Lost',
  PENDING_PREPARATION: 'Pending Preparation',
  PREPARING: 'Preparing',
  READY: 'Ready',
  QUALITY_CHECK: 'Quality Check',
  PACKAGED: 'Packaged',
  ON_HOLD_PREP: 'On Hold Preparation',
  PARTIALLY_DELIVERED: 'Partially Delivered',
  STOCK_SHORTAGE: 'Stock Shortage',
  SHORTAGE_FAILED: 'Shortage Failed',
  PENDING_CANCELLATION: 'Pending Cancellation',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  PARTIALLY_PAID: 'Partially Paid',
  FAILED: 'Failed',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  AVERAGE: 'Average',
  POOR: 'Poor',
  UNKNOWN: 'Unknown',
};

const RETURN_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED'];

const CUSTOMER_RATINGS = ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'UNKNOWN'];

const CUSTOMER_STATUSES = ['LEAD', 'ACTIVE', 'INACTIVE', 'BLOCKED'];

const ORDER_EXCLUDED_STATUSES = ['CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER'];

const PRESETS = {
  champions: {
    label: 'أفضل العملاء',
    description: 'عملاء نشطون، كثر الطلبات، وأنفاقهم مرتفع — استهدفهم بعروض الولاء',
    icon: 'crown',
    criteria: {
      type: 'combo',
      conditions: [
        { type: 'all' },
        { type: 'minTotalSpent', amount: 2000 },
        { type: 'minOrdersCount', count: 3 },
      ],
    },
  },
  loyal: {
    label: 'العملاء الأوفياء',
    description: 'عملاء يطلبون بانتظام (5 طلبات أو أكثر) — رشّحهم لبرنامج الولاء',
    icon: 'heart',
    criteria: {
      type: 'combo',
      conditions: [
        { type: 'all' },
        { type: 'minOrdersCount', count: 5 },
      ],
    },
  },
  atRisk: {
    label: 'عملاء معرضون للفقدان',
    description: 'كانوا مشترين لكن لم يتواصلوا منذ 30 يوم — أرسل حملة إعادة تنشيط',
    icon: 'alert',
    criteria: {
      type: 'combo',
      conditions: [
        { type: 'inactive', days: 30 },
        { type: 'orderStatus', status: 'DELIVERED' },
      ],
    },
  },
  new: {
    label: 'عملاء جدد',
    description: 'أحدث 100 عميل — رحّب بهم وعرّفهم على منتجاتك',
    icon: 'sparkle',
    criteria: {
      type: 'latest',
      limit: 100,
    },
  },
};

function parseCriteria(criteria) {
  if (!criteria) return { type: 'all' };
  if (typeof criteria === 'string') {
    try {
      return JSON.parse(criteria);
    } catch {
      return { type: 'all' };
    }
  }
  return criteria;
}

function toPositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return fallback;
  return n;
}

function hoursAgo(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Build pure Prisma fragment for filtering orders that contain specific products.
 * Returns `{ orders: { some: ... } }` or `null` if no valid productIds provided.
 *
 * NOTE: Critical data requirement: order_items.productSku is empty in ~95% of rows,
 * so matching MUST always be on order_items.productId.
 */
function buildPurchasedProductOrderFilter(rawCriteria) {
  if (!rawCriteria) return null;
  const criteria = parseCriteria(rawCriteria);

  let productIds = [];
  if (Array.isArray(criteria.productIds) && criteria.productIds.length > 0) {
    productIds = criteria.productIds.filter(Boolean);
  } else if (Array.isArray(criteria.products) && criteria.products.length > 0) {
    productIds = criteria.products
      .map((p) => (typeof p === 'object' && p !== null ? p.id : p))
      .filter(Boolean);
  }

  if (productIds.length === 0) return null;

  const status = criteria.status || 'DELIVERED';
  const days = toPositiveInt(criteria.days, null);

  const orderCondition = {
    status,
    orderItems: {
      some: {
        productId: { in: productIds },
      },
    },
  };

  if (days) {
    orderCondition.createdAt = { gte: daysAgo(days) };
  }

  return {
    orders: {
      some: orderCondition,
    },
  };
}

/**
 * Build the Prisma Customer where clause (+ orderBy/take) for a criteria.
 * Pure — no DB access. Returns:
 *   { where, orderBy?, take? }
 */
function buildCustomerListWhere(companyId, rawCriteria) {
  const criteria = parseCriteria(rawCriteria);
  const type = criteria.type || 'all';
  const base = { companyId };

  switch (type) {
    case 'all': {
      return { where: { ...base, status: 'ACTIVE' } };
    }

    case 'purchasedProduct': {
      const orderFilter = buildPurchasedProductOrderFilter(criteria);
      if (!orderFilter) {
        return { where: { ...base, id: { in: [] } } };
      }
      return {
        where: {
          ...base,
          ...orderFilter,
        },
      };
    }

    case 'active': {
      const hours = toPositiveInt(criteria.hours ?? criteria.lastActivity, 24);
      const threshold = hoursAgo(hours);
      return {
        where: {
          ...base,
          conversations: {
            some: {
              status: 'ACTIVE',
              messages: {
                some: {
                  isFromCustomer: true,
                  createdAt: { gte: threshold },
                },
              },
            },
          },
        },
      };
    }

    case 'inactive': {
      const days = toPositiveInt(criteria.days ?? criteria.lastActivity, 30);
      const threshold = daysAgo(days);
      return {
        where: {
          ...base,
          conversations: {
            none: { updatedAt: { gte: threshold } },
          },
        },
      };
    }

    case 'tag': {
      const tag = (criteria.tag || '').trim();
      if (!tag) return { where: { ...base, status: 'ACTIVE' } };
      return {
        where: {
          ...base,
          tags: { contains: `"${tag}"` },
        },
      };
    }

    case 'orderStatus': {
      const status = criteria.status;
      if (!status) return { where: { ...base, status: 'ACTIVE' } };
      const days = toPositiveInt(criteria.days, null);
      const orderFilter = { status };
      if (days) orderFilter.createdAt = { gte: daysAgo(days) };
      return {
        where: {
          ...base,
          orders: { some: orderFilter },
        },
      };
    }

    case 'returnRequest': {
      const status = criteria.status;
      const days = toPositiveInt(criteria.days, null);
      const returnFilter = {};
      if (status) returnFilter.status = status;
      if (days) returnFilter.createdAt = { gte: daysAgo(days) };
      return {
        where: {
          ...base,
          returnRequests: { some: returnFilter },
        },
      };
    }

    case 'paymentStatus': {
      const status = criteria.status;
      if (!status) return { where: { ...base, status: 'ACTIVE' } };
      const days = toPositiveInt(criteria.days, null);
      const orderFilter = { paymentStatus: status };
      if (days) orderFilter.createdAt = { gte: daysAgo(days) };
      return {
        where: {
          ...base,
          orders: { some: orderFilter },
        },
      };
    }

    case 'city': {
      const city = (criteria.city || '').trim();
      if (!city) return { where: { ...base, status: 'ACTIVE' } };
      return {
        where: {
          ...base,
          orders: { some: { city } },
        },
      };
    }

    case 'product': {
      const productId = criteria.productId;
      if (!productId) return { where: { ...base, status: 'ACTIVE' } };
      const orderFilter = {
        orderItems: { some: { productId } },
      };
      const orderStatus = criteria.orderStatus || criteria.status;
      if (orderStatus) {
        orderFilter.status = orderStatus;
      }
      return {
        where: {
          ...base,
          orders: { some: orderFilter },
        },
      };
    }

    case 'customerRating': {
      const rating = criteria.rating;
      if (!rating) return { where: { ...base, status: 'ACTIVE' } };
      return {
        where: { ...base, customerRating: rating },
      };
    }

    case 'latest': {
      const limit = toPositiveInt(criteria.limit, 100);
      return {
        where: base,
        orderBy: { createdAt: 'desc' },
        take: limit,
      };
    }

    case 'oldest': {
      const limit = toPositiveInt(criteria.limit, 100);
      return {
        where: base,
        orderBy: { createdAt: 'asc' },
        take: limit,
      };
    }

    case 'minTotalSpent': {
      const amount = parseFloat(criteria.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        return { where: { ...base, status: 'ACTIVE' } };
      }
      return { where: { ...base, status: 'ACTIVE' }, _minTotalSpent: amount };
    }

    case 'minOrdersCount': {
      const count = toPositiveInt(criteria.count, null);
      if (!count) return { where: { ...base, status: 'ACTIVE' } };
      return { where: { ...base, status: 'ACTIVE' }, _minOrdersCount: count };
    }

    case 'combo': {
      const conditions = Array.isArray(criteria.conditions) ? criteria.conditions : [];
      if (conditions.length === 0) return { where: { ...base, status: 'ACTIVE' } };
      const parts = conditions.map((c) => buildCustomerListWhere(companyId, c));

      // اجمع الـ where الأساسية بـ AND، مع تمرير علامات الـ aggregation
      const simpleWheres = parts.filter((p) => !p._minTotalSpent && !p._minOrdersCount).map((p) => p.where);
      const aggregateFlags = parts.filter((p) => p._minTotalSpent || p._minOrdersCount);

      const where = simpleWheres.length === 1
        ? simpleWheres[0]
        : simpleWheres.length > 1
          ? { AND: simpleWheres }
          : base;

      if (aggregateFlags.length === 0) return { where };

      // شروط الـ aggregation داخل combo
      const minSpent = aggregateFlags.find((p) => p._minTotalSpent != null)?._minTotalSpent;
      const minCount = aggregateFlags.find((p) => p._minOrdersCount != null)?._minOrdersCount;
      const out = { where };
      if (minSpent != null) out._minTotalSpent = minSpent;
      if (minCount != null) out._minOrdersCount = minCount;
      return out;
    }

    case 'preset': {
      const presetKey = criteria.preset || criteria.name;
      const preset = PRESETS[presetKey];
      if (!preset) return { where: { ...base, status: 'ACTIVE' } };
      // وسّع الـ preset إلى بنيته الفعلية
      const expanded = { ...preset.criteria };
      return buildCustomerListWhere(companyId, expanded);
    }

    default:
      return { where: { ...base, status: 'ACTIVE' } };
  }
}

/**
 * استخراج كل شروط الـ aggregation (minTotalSpent / minOrdersCount) من معايير
 * قد تكون متداخلة (combo / preset). يعيد مصفوفة من
 *   { type: 'minTotalSpent'|'minOrdersCount', value }
 * بترتيب الظهور.
 */
function extractAggregates(rawCriteria, acc = []) {
  const criteria = parseCriteria(rawCriteria);
  const type = criteria.type || 'all';

  if (type === 'minTotalSpent') {
    const amount = parseFloat(criteria.amount);
    if (Number.isFinite(amount) && amount >= 0) acc.push({ type, value: amount });
    return acc;
  }
  if (type === 'minOrdersCount') {
    const count = toPositiveInt(criteria.count, null);
    if (count) acc.push({ type, value: count });
    return acc;
  }
  if (type === 'combo' && Array.isArray(criteria.conditions)) {
    for (const c of criteria.conditions) extractAggregates(c, acc);
    return acc;
  }
  if (type === 'preset') {
    const preset = PRESETS[criteria.preset || criteria.name];
    if (preset) return extractAggregates(preset.criteria, acc);
  }
  return acc;
}

/**
 * حل شروط الـ aggregation وإرجاع العملاء المطابقين لكل شرط (AND).
 * القيمة النهائية: قائمة معرفات تمر عبر كل الشروط، أو null إن لم توجد aggregations.
 */
async function resolveAggregateCustomerIds(prisma, companyId, rawCriteria) {
  const aggregates = extractAggregates(rawCriteria);
  if (aggregates.length === 0) return null;

  const baseOrderFilter = {
    companyId,
    status: { notIn: ORDER_EXCLUDED_STATUSES },
  };

  const rows = await prisma.order.groupBy({
    by: ['customerId'],
    where: baseOrderFilter,
    _sum: { total: true },
    _count: { customerId: true },
  });

  const valid = rows.filter((r) => r.customerId);

  // لكل شرط، مجموعة معرفات (Set) مطابقة
  const candidateSets = aggregates.map((agg) => {
    if (agg.type === 'minTotalSpent') {
      return new Set(valid.filter((r) => Number(r._sum?.total ?? 0) >= agg.value).map((r) => r.customerId));
    }
    return new Set(valid.filter((r) => (r._count?.customerId ?? 0) >= agg.value).map((r) => r.customerId));
  });

  // تقاطع كل المجموعات (AND)
  if (candidateSets.length === 0) return [];
  const intersection = [...candidateSets[0]].filter((id) => candidateSets.every((s) => s.has(id)));
  return intersection;
}

/**
 * تطبيق شرط الاستثناء (excludeContactedInDays):
 * يستبعد العملاء الذين تواصل معهم أو تواصلوا خلال آخر N يوم —
 * أي لديهم رسالة (واردة أو صادرة) داخل الفترة.
 * يُعدّل الـ where كـ NOT على conversations.messages.
 */
function applyContactExclusion(where, criteria) {
  const excludeDays = toPositiveInt(criteria.excludeContactedInDays, null);
  if (!excludeDays) return where;

  const threshold = daysAgo(excludeDays);
  const contactedFilter = {
    conversations: {
      some: {
        messages: {
          some: {
            createdAt: { gte: threshold },
          },
        },
      },
    },
  };

  if (where.NOT) {
    return { ...where, NOT: [where.NOT, contactedFilter].flat() };
  }
  return { ...where, NOT: contactedFilter };
}

/**
 * تطبيق شروط الاستثناء المخصصة (criteria.exclusions):
 * يقرأ مصفوفة الاستثناءات (بنفس شكل الشروط)، ويستخرج الـ fragment
 * ويجرده من companyId و status، ثم يدمجه كـ NOT مع الحفاظ على أي NOT موجودة.
 */
function applyExclusionConditions(where, rawCriteria) {
  const criteria = parseCriteria(rawCriteria);
  const exclusions = Array.isArray(criteria.exclusions) ? criteria.exclusions : [];
  if (exclusions.length === 0) return where;

  const notFragments = [];
  for (const excl of exclusions) {
    if (!excl) continue;
    let fragment = null;
    if (excl.type === 'purchasedProduct') {
      fragment = buildPurchasedProductOrderFilter(excl);
    } else {
      const built = buildCustomerListWhere(where.companyId || 'temp', excl);
      const w = built.where || {};
      const { companyId, status, id, ...rest } = w;
      if (Object.keys(rest).length > 0) {
        fragment = rest;
      }
    }

    if (fragment) {
      const { companyId, status, ...clean } = fragment;
      if (Object.keys(clean).length > 0) {
        notFragments.push(clean);
      }
    }
  }

  if (notFragments.length === 0) return where;

  const existingNot = where.NOT
    ? (Array.isArray(where.NOT) ? where.NOT : [where.NOT])
    : [];

  return {
    ...where,
    NOT: [...existingNot, ...notFragments],
  };
}

/**
 * Combine where + aggregation into a single Customer where usable by count/findMany.
 */
async function buildEffectiveCustomerListWhere(prisma, companyId, rawCriteria) {
  if (isV2Criteria(rawCriteria)) {
    if (prisma?.$queryRawUnsafe) {
      const { selectSql, params } = buildCustomerListV2Sql(companyId, rawCriteria);
      const whereClause = selectSql.split('WHERE ')[1];
      const idSql = `SELECT c."id" FROM "customers" c WHERE ${whereClause}`;
      const rows = await prisma.$queryRawUnsafe(idSql, ...params);
      const ids = Array.isArray(rows) ? rows.map((r) => r.id) : [];
      return { where: { companyId, id: { in: ids } } };
    }
    return { where: { companyId } };
  }

  const criteria = parseCriteria(rawCriteria);
  const built = buildCustomerListWhere(companyId, rawCriteria);
  let where = built.where;

  if (built._minTotalSpent != null || built._minOrdersCount != null) {
    const ids = await resolveAggregateCustomerIds(prisma, companyId, rawCriteria);
    if (ids !== null && ids.length === 0) {
      return { where: { companyId, id: { in: [] } }, orderBy: built.orderBy, take: built.take };
    }
    if (ids !== null) {
      where = { ...where, id: { in: ids } };
    }
  }

  where = applyContactExclusion(where, criteria);
  where = applyExclusionConditions(where, criteria);

  return { where, orderBy: built.orderBy, take: built.take };
}

function formatPurchasedProductSummary(c, isEn) {
  const products = Array.isArray(c.products) && c.products.length > 0
    ? c.products
    : (Array.isArray(c.productIds) ? c.productIds.map((id) => ({ id, name: id })) : []);

  const productNames = products
    .map((p) => {
      if (!p) return '';
      if (typeof p === 'string') return p;
      const name = p.name || p.id || '';
      return p.sku ? `${name} (${p.sku})` : name;
    })
    .filter(Boolean);

  const productStr = productNames.length > 0
    ? productNames.join(isEn ? ' or ' : ' أو ')
    : (isEn ? 'selected product' : 'منتج محدد');

  const status = c.status || 'DELIVERED';
  const statusLabel = isEn
    ? (STATUS_LABELS_EN[status] || status)
    : (STATUS_LABELS_AR[status] || status);

  const days = toPositiveInt(c.days, null);
  const timeStr = days
    ? (isEn ? `last ${days} days` : `آخر ${days} يوم`)
    : (isEn ? 'no time limit' : 'بدون حد زمني');

  const prefix = isEn ? 'Purchased: ' : 'اشترى: ';
  return `${prefix}${productStr} — ${statusLabel} · ${timeStr}`;
}

function criteriaToSummary(criteria, locale = 'ar') {
  if (isV2Criteria(criteria)) {
    return criteriaV2ToSummary(criteria);
  }
  const c = parseCriteria(criteria);
  const type = c.type || 'all';
  const isEn = typeof locale === 'string' && locale.toLowerCase().startsWith('en');
  let summary;

  switch (type) {
    case 'purchasedProduct':
      summary = formatPurchasedProductSummary(c, isEn);
      break;

    case 'all':
      summary = isEn ? 'All active customers' : 'جميع العملاء النشطين';
      break;

    case 'active': {
      const hours = toPositiveInt(c.hours ?? c.lastActivity, 24);
      summary = isEn ? `Active in last ${hours} hours` : `نشط خلال آخر ${hours} ساعة`;
      break;
    }

    case 'inactive': {
      const days = toPositiveInt(c.days ?? c.lastActivity, 30);
      summary = isEn ? `Inactive for ${days} days` : `غير نشط منذ ${days} يوم`;
      break;
    }

    case 'tag': {
      const tag = c.tag || '';
      summary = isEn ? `Has tag: ${tag}` : `يحمل وسم: ${tag}`;
      break;
    }

    case 'orderStatus': {
      const statusLabel = isEn
        ? (STATUS_LABELS_EN[c.status] || c.status)
        : (STATUS_LABELS_AR[c.status] || c.status);
      if (c.days) {
        summary = isEn
          ? `Orders "${statusLabel}" in last ${c.days} days`
          : `طلبات بحالة ${c.status} خلال آخر ${c.days} يوم`;
      } else {
        summary = isEn
          ? `Orders "${statusLabel}"`
          : `طلبات بحالة ${c.status}`;
      }
      break;
    }

    case 'returnRequest': {
      const statusLabel = isEn
        ? (STATUS_LABELS_EN[c.status] || c.status || 'All')
        : (STATUS_LABELS_AR[c.status] || c.status || 'الكل');
      if (c.days) {
        summary = isEn
          ? `Returns "${statusLabel}" in last ${c.days} days`
          : `مرتجعات بحالة ${c.status || 'الكل'} خلال آخر ${c.days} يوم`;
      } else {
        summary = isEn
          ? `Returns "${statusLabel}"`
          : `مرتجعات بحالة ${c.status || 'الكل'}`;
      }
      break;
    }

    case 'paymentStatus': {
      const statusLabel = isEn
        ? (STATUS_LABELS_EN[c.status] || c.status)
        : (STATUS_LABELS_AR[c.status] || c.status);
      if (c.days) {
        summary = isEn
          ? `Payment "${statusLabel}" in last ${c.days} days`
          : `دفع بحالة ${c.status} خلال آخر ${c.days} يوم`;
      } else {
        summary = isEn
          ? `Payment "${statusLabel}"`
          : `دفع بحالة ${c.status}`;
      }
      break;
    }

    case 'city':
      summary = isEn ? `From city: ${c.city || ''}` : `من مدينة: ${c.city || ''}`;
      break;

    case 'product': {
      const productStatus = c.orderStatus || c.status;
      const productLabel = c.productId || (isEn ? 'unspecified' : 'غير محدد');
      const productStatusLabel = productStatus
        ? (isEn ? (STATUS_LABELS_EN[productStatus] || productStatus) : (STATUS_LABELS_AR[productStatus] || productStatus))
        : '';
      summary = productStatus
        ? (isEn
            ? `Product order (${productLabel}) — ${productStatusLabel}`
            : `طلب منتج (${productLabel}) بحالة ${productStatusLabel}`)
        : (isEn ? `Product order (${productLabel})` : `طلب منتج (${productLabel})`);
      break;
    }

    case 'customerRating': {
      const ratingLabel = isEn
        ? (STATUS_LABELS_EN[c.rating] || c.rating || '')
        : (STATUS_LABELS_AR[c.rating] || c.rating || '');
      summary = isEn ? `Rating: ${ratingLabel}` : `التقييم: ${c.rating || ''}`;
      break;
    }

    case 'latest': {
      const limit = toPositiveInt(c.limit, 100);
      summary = isEn ? `Latest ${limit} customers` : `أحدث ${limit} عميل`;
      break;
    }

    case 'oldest': {
      const limit = toPositiveInt(c.limit, 100);
      summary = isEn ? `Oldest ${limit} customers` : `أقدم ${limit} عميل`;
      break;
    }

    case 'minTotalSpent':
      summary = isEn ? `Total spent ≥ ${c.amount}` : `إجمالي إنفاق ≥ ${c.amount}`;
      break;

    case 'minOrdersCount':
      summary = isEn ? `Orders count ≥ ${c.count}` : `عدد طلبات ≥ ${c.count}`;
      break;

    case 'combo':
      summary = isEn ? 'Custom list (multiple conditions)' : 'قائمة مخصّصة (شروط متعددة)';
      break;

    case 'preset': {
      const preset = PRESETS[c.preset || c.name];
      summary = preset ? preset.label : (isEn ? 'Preset list' : 'قائمة جاهزة');
      break;
    }

    default:
      summary = isEn ? 'All active customers' : 'جميع العملاء النشطين';
  }

  if (toPositiveInt(c.excludeContactedInDays, null)) {
    summary += isEn
      ? ` | No contact in last ${c.excludeContactedInDays} days`
      : ` | بدون مراسلة خلال آخر ${c.excludeContactedInDays} يوم`;
  }

  if (Array.isArray(c.exclusions) && c.exclusions.length > 0) {
    const exclSummaries = c.exclusions
      .map((excl) => {
        if (!excl) return '';
        if (excl.type === 'purchasedProduct') {
          return formatPurchasedProductSummary(excl, isEn);
        }
        return criteriaToSummary(excl, locale);
      })
      .filter(Boolean);

    if (exclSummaries.length > 0) {
      const prefix = isEn ? ' | Excluding: ' : ' | استثناء: ';
      summary += `${prefix}${exclSummaries.join(isEn ? ', ' : '، ')}`;
    }
  }

  return summary;
}

module.exports = {
  ORDER_STATUSES,
  RETURN_STATUSES,
  PAYMENT_STATUSES,
  CUSTOMER_RATINGS,
  CUSTOMER_STATUSES,
  STATUS_LABELS_AR,
  STATUS_LABELS_EN,
  PRESETS,
  parseCriteria,
  buildPurchasedProductOrderFilter,
  buildCustomerListWhere,
  buildEffectiveCustomerListWhere,
  resolveAggregateCustomerIds,
  extractAggregates,
  applyContactExclusion,
  applyExclusionConditions,
  criteriaToSummary,
  isV2Criteria,
  buildCustomerListV2Sql,
  computeCustomerListCountV2,
  previewCustomerListCountV2,
  getCustomersInListV2,
  criteriaV2ToSummary,
};
