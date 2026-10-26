/**
 * Customer List Criteria Engine v2
 *
 * Multi-group AND/OR rules engine + exclusions + SQL compilation.
 * Pure parameterized SQL generation to guarantee zero Node-memory bottlenecks
 * and complete elimination of `id: { in: [...] }` queries at >32k rows.
 */

const ORDER_EXCLUDED_STATUSES = ['CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER'];
const DEFAULT_DELIVERED_STATUSES = ['DELIVERED'];

/**
 * Checks if the given raw criteria is v2.
 */
function isV2Criteria(rawCriteria) {
  if (!rawCriteria) return false;
  let parsed = rawCriteria;
  if (typeof rawCriteria === 'string') {
    try {
      parsed = JSON.parse(rawCriteria);
    } catch {
      return false;
    }
  }
  if (!parsed || typeof parsed !== 'object') return false;
  return Number(parsed.version) >= 2 || parsed.include != null;
}

/**
 * Safely parses criteria if string.
 */
function parseCriteriaSafely(rawCriteria) {
  if (!rawCriteria) return null;
  if (typeof rawCriteria === 'string') {
    try {
      return JSON.parse(rawCriteria);
    } catch {
      return null;
    }
  }
  return rawCriteria;
}

/**
 * Normalizes numeric inputs.
 */
function toNumber(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Normalizes date inputs.
 */
function toDate(val, { endOfDay = false } = {}) {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay && typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}

/**
 * Translates comparison operator to SQL.
 */
function buildNumericOpSql(op, val1, val2, addParam) {
  const normalizedOp = String(op || 'gte').trim().toLowerCase();
  const num1 = toNumber(val1, 0);

  switch (normalizedOp) {
    case 'gt':
      return `> ${addParam(num1)}`;
    case 'gte':
      return `>= ${addParam(num1)}`;
    case 'lt':
      return `< ${addParam(num1)}`;
    case 'lte':
      return `<= ${addParam(num1)}`;
    case 'eq':
      return `= ${addParam(num1)}`;
    case 'neq':
      return `!= ${addParam(num1)}`;
    case 'between': {
      const num2 = toNumber(val2, num1);
      const min = Math.min(num1, num2);
      const max = Math.max(num1, num2);
      return `BETWEEN ${addParam(min)} AND ${addParam(max)}`;
    }
    default:
      return `>= ${addParam(num1)}`;
  }
}

/**
 * Compiles a single rule to a SQL condition on `c` (alias of customers table).
 * Returns SQL fragment string, or null if rule is invalid/empty.
 */
function compileRuleToSql(rule, { addParam, companyIdParam }) {
  if (!rule || typeof rule !== 'object') return null;
  const field = String(rule.field || '').trim();
  if (!field) return null;

  switch (field) {
    // 1. receivedProduct: SKU + dateFrom/dateTo + statuses (default DELIVERED)
    case 'receivedProduct': {
      const rawSku = rule.sku ?? rule.value;
      const sku = rawSku != null ? String(rawSku).trim() : '';
      if (!sku) return null;

      const rawStatuses = Array.isArray(rule.statuses) && rule.statuses.length > 0
        ? rule.statuses
        : (rule.status ? [rule.status] : DEFAULT_DELIVERED_STATUSES);
      const statuses = rawStatuses.map((s) => String(s).trim().toUpperCase()).filter(Boolean);
      const skuLike = `%${sku}%`;
      // ترتيب الـ params ثابت: $2 = الحالات، $3/$4 = مطابقة SKU/الاسم، وبعدها التواريخ
      const statusesParam = addParam(statuses);
      const skuParamLine = addParam(skuLike);
      const skuParamCatalog = addParam(skuLike);

      const dFrom = toDate(rule.dateFrom);
      const dTo = toDate(rule.dateTo, { endOfDay: true });

      const clauses = [
        `o."customerId" = c."id"`,
        `o."companyId" = ${companyIdParam}`,
        `o."status"::text = ANY(${statusesParam})`,
        // يطابق SKU/الاسم على سطر الطلب وكذلك على كتالوج المنتج — سطور الطلب تحمل SKU المتغير
        // (SWN-BOOT-WHT-37) بينما كتالوج المنتج يحمل sku "sw 84".
        `(oi."productSku" ILIKE ${skuParamLine} OR oi."productName" ILIKE ${skuParamCatalog} OR p."sku" ILIKE ${skuParamLine} OR p."name" ILIKE ${skuParamCatalog})`,
      ];

      if (dFrom) clauses.push(`o."createdAt" >= ${addParam(dFrom)}`);
      if (dTo) clauses.push(`o."createdAt" <= ${addParam(dTo)}`);

      return `EXISTS (
        SELECT 1 FROM "orders" o
        JOIN "order_items" oi ON oi."orderId" = o."id"
        LEFT JOIN "products" p ON p."id" = oi."productId" AND p."companyId" = ${companyIdParam}
        WHERE ${clauses.join(' AND ')}
      )`;
    }

    // 2. orderedInPeriod: customer ordered within date range
    case 'orderedInPeriod': {
      const dFrom = toDate(rule.dateFrom ?? rule.from);
      const dTo = toDate(rule.dateTo ?? rule.to, { endOfDay: true });
      if (!dFrom && !dTo) return null;

      const clauses = [
        `o."customerId" = c."id"`,
        `o."companyId" = ${companyIdParam}`,
        `o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')`,
      ];

      if (Array.isArray(rule.statuses) && rule.statuses.length > 0) {
        clauses.push(`o."status"::text = ANY(${addParam(rule.statuses)})`);
      }

      if (dFrom) clauses.push(`o."createdAt" >= ${addParam(dFrom)}`);
      if (dTo) clauses.push(`o."createdAt" <= ${addParam(dTo)}`);

      return `EXISTS (
        SELECT 1 FROM "orders" o
        WHERE ${clauses.join(' AND ')}
      )`;
    }

    // 3. ordersCount: number of valid orders
    case 'ordersCount': {
      const op = String(rule.op || 'gte').trim().toLowerCase();
      const val = Number(rule.value);
      // مسار سريع: «>= 1» أو «> 0» = عنده أوردر واحد على الأقل → EXISTS يتوقف عند أول تطابق
      if ((op === 'gte' && val === 1) || (op === 'gt' && val === 0)) {
        return `EXISTS (SELECT 1 FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER'))`;
      }
      const opSql = buildNumericOpSql(op, rule.value, rule.value2, addParam);
      return `(SELECT COUNT(*)::int FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')) ${opSql}`;
    }

    // 4. totalSpent: total revenue from valid orders
    case 'totalSpent': {
      const opSql = buildNumericOpSql(rule.op, rule.value, rule.value2, addParam);
      return `COALESCE((SELECT SUM(o."total")::float8 FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')), 0) ${opSql}`;
    }

    // 5. lastOrderBefore: most recent order before date
    case 'lastOrderBefore': {
      const d = toDate(rule.value ?? rule.date);
      if (!d) return null;
      return `(SELECT MAX(o."createdAt") FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')) < ${addParam(d)}`;
    }

    // 6. lastOrderAfter: most recent order after date
    case 'lastOrderAfter': {
      const d = toDate(rule.value ?? rule.date);
      if (!d) return null;
      return `(SELECT MAX(o."createdAt") FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."status"::text NOT IN ('CANCELLED', 'TRASH', 'DRAFT', 'DUPLICATE_ORDER')) > ${addParam(d)}`;
    }

    // 7. tags: contains / notContains
    case 'tags': {
      const tag = String(rule.value || rule.tag || '').trim();
      if (!tag) return null;
      const op = String(rule.op || 'contains').trim().toLowerCase();
      const pattern = `%${tag}%`;

      if (op === 'notcontains' || op === 'not_contains') {
        return `(c."tags" IS NULL OR c."tags" NOT ILIKE ${addParam(pattern)})`;
      }
      return `c."tags" ILIKE ${addParam(pattern)}`;
    }

    // 8. customerStatus: LEAD | ACTIVE | INACTIVE | BLOCKED
    case 'customerStatus': {
      const raw = Array.isArray(rule.value) ? rule.value : [rule.value || rule.status];
      const statuses = raw.map((s) => String(s || '').trim().toUpperCase()).filter(Boolean);
      if (statuses.length === 0) return null;
      const op = String(rule.op || 'in').trim().toLowerCase();

      if (op === 'neq' || op === 'notin' || op === 'not_in') {
        return `c."status"::text != ALL(${addParam(statuses)})`;
      }
      return `c."status"::text = ANY(${addParam(statuses)})`;
    }

    // 9. city: order address city
    case 'city': {
      const rawCity = rule.value ?? rule.city;
      if (!rawCity) return null;
      if (Array.isArray(rawCity)) {
        const cities = rawCity.map((ci) => String(ci).trim()).filter(Boolean);
        if (cities.length === 0) return null;
        return `EXISTS (
          SELECT 1 FROM "orders" o
          WHERE o."customerId" = c."id"
            AND o."companyId" = ${companyIdParam}
            AND o."city" = ANY(${addParam(cities)})
        )`;
      }
      const city = String(rawCity).trim();
      return `EXISTS (
        SELECT 1 FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."city" ILIKE ${addParam(`%${city}%`)}
      )`;
    }

    // 10. governorate: order address governorate
    case 'governorate': {
      const rawGov = rule.value ?? rule.governorate;
      if (!rawGov) return null;
      if (Array.isArray(rawGov)) {
        const govs = rawGov.map((g) => String(g).trim()).filter(Boolean);
        if (govs.length === 0) return null;
        return `EXISTS (
          SELECT 1 FROM "orders" o
          WHERE o."customerId" = c."id"
            AND o."companyId" = ${companyIdParam}
            AND o."governorate" = ANY(${addParam(govs)})
        )`;
      }
      const gov = String(rawGov).trim();
      return `EXISTS (
        SELECT 1 FROM "orders" o
        WHERE o."customerId" = c."id"
          AND o."companyId" = ${companyIdParam}
          AND o."governorate" ILIKE ${addParam(`%${gov}%`)}
      )`;
    }

    // 11. deliveryRate: stored 0-100 float on Customer
    case 'deliveryRate': {
      const opSql = buildNumericOpSql(rule.op, rule.value, rule.value2, addParam);
      return `c."deliveryRate" ${opSql}`;
    }

    // 12. customerRating: EXCELLENT | GOOD | AVERAGE | POOR | UNKNOWN
    case 'customerRating': {
      const raw = Array.isArray(rule.value) ? rule.value : [rule.value ?? rule.rating];
      const ratings = raw.map((r) => String(r || '').trim().toUpperCase()).filter(Boolean);
      if (ratings.length === 0) return null;
      const op = String(rule.op || 'in').trim().toLowerCase();

      if (op === 'neq' || op === 'notin' || op === 'not_in') {
        return `c."customerRating"::text != ALL(${addParam(ratings)})`;
      }
      return `c."customerRating"::text = ANY(${addParam(ratings)})`;
    }

    // Backward-compatible rules when embedded in v2
    case 'active': {
      const hours = toNumber(rule.hours ?? rule.lastActivity, 24);
      const d = new Date();
      d.setHours(d.getHours() - hours);
      return `EXISTS (
        SELECT 1 FROM "conversations" conv
        JOIN "messages" m ON m."conversationId" = conv."id"
        WHERE conv."customerId" = c."id"
          AND conv."companyId" = ${companyIdParam}
          AND conv."status" = 'ACTIVE'
          AND m."isFromCustomer" = true
          AND m."createdAt" >= ${addParam(d)}
      )`;
    }

    case 'inactive': {
      const days = toNumber(rule.days ?? rule.lastActivity, 30);
      const d = new Date();
      d.setDate(d.getDate() - days);
      return `NOT EXISTS (
        SELECT 1 FROM "conversations" conv
        WHERE conv."customerId" = c."id"
          AND conv."companyId" = ${companyIdParam}
          AND conv."updatedAt" >= ${addParam(d)}
      )`;
    }

    case 'orderStatus': {
      const status = rule.status;
      if (!status) return null;
      const clauses = [
        `o."customerId" = c."id"`,
        `o."companyId" = ${companyIdParam}`,
        `o."status"::text = ${addParam(status)}`,
      ];
      const days = toNumber(rule.days, null);
      if (days && days > 0) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        clauses.push(`o."createdAt" >= ${addParam(d)}`);
      }
      return `EXISTS (
        SELECT 1 FROM "orders" o
        WHERE ${clauses.join(' AND ')}
      )`;
    }

    default:
      return null;
  }
}

/**
 * Compiles a group of rules to SQL.
 * e.g. (rule1 OR rule2)
 */
function compileGroupToSql(group, ctx) {
  if (!group || typeof group !== 'object') return null;
  const rawRules = Array.isArray(group.rules) ? group.rules : [];
  if (rawRules.length === 0) return null;

  const ruleFragments = rawRules
    .map((r) => compileRuleToSql(r, ctx))
    .filter(Boolean);

  if (ruleFragments.length === 0) return null;
  if (ruleFragments.length === 1) return ruleFragments[0];

  const op = String(group.operator || 'AND').trim().toUpperCase() === 'OR' ? 'OR' : 'AND';
  return `(${ruleFragments.join(` ${op} `)})`;
}

/**
 * Compiles an entire container (include or exclude) with top-level operator and groups.
 */
function compileContainerToSql(container, ctx) {
  if (!container || typeof container !== 'object') return null;
  const groups = Array.isArray(container.groups) ? container.groups : [];
  if (groups.length === 0) return null;

  const groupFragments = groups
    .map((g) => compileGroupToSql(g, ctx))
    .filter(Boolean);

  if (groupFragments.length === 0) return null;
  if (groupFragments.length === 1) return groupFragments[0];

  const op = String(container.operator || 'AND').trim().toUpperCase() === 'OR' ? 'OR' : 'AND';
  return `(${groupFragments.join(` ${op} `)})`;
}

/**
 * Compiles legacy criteria to a SQL condition on `c`.
 */
function compileLegacyCriteriaToSql(criteria, ctx) {
  if (!criteria) return `c."status" = 'ACTIVE'`;
  const type = criteria.type || 'all';

  switch (type) {
    case 'all':
      return `c."status" = 'ACTIVE'`;
    case 'active':
      return compileRuleToSql({ field: 'active', hours: criteria.hours ?? criteria.lastActivity }, ctx);
    case 'inactive':
      return compileRuleToSql({ field: 'inactive', days: criteria.days ?? criteria.lastActivity }, ctx);
    case 'tag':
      return compileRuleToSql({ field: 'tags', value: criteria.tag, op: 'contains' }, ctx);
    case 'orderStatus':
      return compileRuleToSql({ field: 'orderStatus', status: criteria.status, days: criteria.days }, ctx);
    case 'city':
      return compileRuleToSql({ field: 'city', value: criteria.city }, ctx);
    case 'customerRating':
      return compileRuleToSql({ field: 'customerRating', value: criteria.rating }, ctx);
    case 'minTotalSpent':
      return compileRuleToSql({ field: 'totalSpent', value: criteria.amount, op: 'gte' }, ctx);
    case 'minOrdersCount':
      return compileRuleToSql({ field: 'ordersCount', value: criteria.count, op: 'gte' }, ctx);
    case 'combo': {
      const conditions = Array.isArray(criteria.conditions) ? criteria.conditions : [];
      const frags = conditions.map((c) => compileLegacyCriteriaToSql(c, ctx)).filter(Boolean);
      return frags.length > 0 ? `(${frags.join(' AND ')})` : `c."status" = 'ACTIVE'`;
    }
    case 'preset': {
      const name = criteria.preset || criteria.name;
      if (name === 'champions') {
        const p1 = compileRuleToSql({ field: 'totalSpent', value: 2000, op: 'gte' }, ctx);
        const p2 = compileRuleToSql({ field: 'ordersCount', value: 3, op: 'gte' }, ctx);
        return `(c."status" = 'ACTIVE' AND ${p1} AND ${p2})`;
      }
      if (name === 'loyal') {
        const p2 = compileRuleToSql({ field: 'ordersCount', value: 5, op: 'gte' }, ctx);
        return `(c."status" = 'ACTIVE' AND ${p2})`;
      }
      if (name === 'atRisk') {
        const p1 = compileRuleToSql({ field: 'inactive', days: 30 }, ctx);
        const p2 = compileRuleToSql({ field: 'orderStatus', status: 'DELIVERED' }, ctx);
        return `(${p1} AND ${p2})`;
      }
      return `c."status" = 'ACTIVE'`;
    }
    default:
      return `c."status" = 'ACTIVE'`;
  }
}

/**
 * Builds the complete WHERE clause and params for v2 criteria (or fallback v1).
 */
function buildCustomerListV2QueryParts(companyId, rawCriteria, options = {}) {
  const { includeOnly = false, excludedListRecords = [] } = options;
  const criteria = parseCriteriaSafely(rawCriteria) || { version: 2, include: { operator: 'AND', groups: [] } };

  const params = [String(companyId)];
  const companyIdParam = '$1';

  const addParam = (val) => {
    params.push(val);
    return `$${params.length}`;
  };

  const ctx = { addParam, companyIdParam };

  // 1. Build include / primary condition
  let includeFragment = null;
  if (isV2Criteria(criteria)) {
    includeFragment = compileContainerToSql(criteria.include, ctx);
  } else {
    includeFragment = compileLegacyCriteriaToSql(criteria, ctx);
  }

  const whereParts = [`c."companyId" = ${companyIdParam}`];
  if (includeFragment) {
    whereParts.push(includeFragment);
  } else {
    whereParts.push(`c."status" = 'ACTIVE'`);
  }

  if (includeOnly) {
    return {
      whereSql: whereParts.join(' AND '),
      params,
    };
  }

  // 2. Exclude container
  if (criteria.exclude) {
    const excludeFragment = compileContainerToSql(criteria.exclude, ctx);
    if (excludeFragment) {
      whereParts.push(`NOT (${excludeFragment})`);
    }
  }

  // 3. Exclude Contacted in N days
  const excludeDays = toNumber(criteria.excludeContactedInDays, 0);
  if (excludeDays > 0) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - excludeDays);

    whereParts.push(`NOT EXISTS (
      SELECT 1 FROM "conversations" conv
      JOIN "messages" m ON m."conversationId" = conv."id"
      WHERE conv."customerId" = c."id"
        AND conv."companyId" = ${companyIdParam}
        AND m."createdAt" >= ${addParam(threshold)}
    )`);
  }

  // 4. Exclude List IDs
  if (Array.isArray(excludedListRecords) && excludedListRecords.length > 0) {
    for (const rec of excludedListRecords) {
      if (!rec || !rec.criteria) continue;
      const subCriteria = parseCriteriaSafely(rec.criteria);
      if (!subCriteria) continue;

      let subFragment = null;
      if (isV2Criteria(subCriteria)) {
        subFragment = compileContainerToSql(subCriteria.include, ctx);
      } else {
        subFragment = compileLegacyCriteriaToSql(subCriteria, ctx);
      }

      if (subFragment) {
        whereParts.push(`NOT (${subFragment})`);
      }
    }
  }

  return {
    whereSql: whereParts.join(' AND '),
    params,
  };
}

/**
 * Builds ready-to-execute SQL statements for count and selection.
 */
function buildCustomerListV2Sql(companyId, rawCriteria, options = {}) {
  const queryParts = buildCustomerListV2QueryParts(companyId, rawCriteria, options);
  const countSql = `SELECT COUNT(*)::int AS "count" FROM "customers" c WHERE ${queryParts.whereSql}`;
  const selectSql = `SELECT
    c."id",
    c."firstName",
    c."lastName",
    c."email",
    c."phone",
    c."status",
    c."tags",
    c."customerRating",
    c."deliveryRate",
    c."createdAt",
    c."updatedAt"
  FROM "customers" c
  WHERE ${queryParts.whereSql}`;

  return {
    ...queryParts,
    countSql,
    selectSql,
  };
}

/**
 * Preloads excluded list records securely scoped to companyId.
 */
async function loadExcludedListRecords(prisma, companyId, excludeListIds) {
  if (!prisma || !Array.isArray(excludeListIds) || excludeListIds.length === 0) {
    return [];
  }
  const cleanIds = excludeListIds.map((id) => String(id).trim()).filter(Boolean);
  if (cleanIds.length === 0) return [];

  try {
    return await prisma.customerList.findMany({
      where: {
        id: { in: cleanIds },
        companyId: String(companyId),
      },
      select: { id: true, criteria: true },
    });
  } catch (err) {
    console.warn('⚠️ [V2-ENGINE] Failed to preload excluded lists:', err.message);
    return [];
  }
}

/**
 * Computes the customer list count in pure SQL (after all exclusions).
 */
async function computeCustomerListCountV2(prisma, companyId, rawCriteria) {
  const criteria = parseCriteriaSafely(rawCriteria);
  const excludedRecords = criteria?.excludeListIds?.length > 0
    ? await loadExcludedListRecords(prisma, companyId, criteria.excludeListIds)
    : [];

  const { countSql, params } = buildCustomerListV2Sql(companyId, criteria, {
    includeOnly: false,
    excludedListRecords: excludedRecords,
  });

  const rows = await prisma.$queryRawUnsafe(countSql, ...params);
  const count = Number(rows?.[0]?.count ?? 0);
  return count;
}

/**
 * Dual live counter for preview: returns { before, after, excluded, count }.
 */
async function previewCustomerListCountV2(prisma, companyId, rawCriteria) {
  const criteria = parseCriteriaSafely(rawCriteria);
  const excludedRecords = criteria?.excludeListIds?.length > 0
    ? await loadExcludedListRecords(prisma, companyId, criteria.excludeListIds)
    : [];

  const beforeQuery = buildCustomerListV2Sql(companyId, criteria, { includeOnly: true });
  const afterQuery = buildCustomerListV2Sql(companyId, criteria, {
    includeOnly: false,
    excludedListRecords: excludedRecords,
  });

  const [beforeRows, afterRows] = await Promise.all([
    prisma.$queryRawUnsafe(beforeQuery.countSql, ...beforeQuery.params),
    prisma.$queryRawUnsafe(afterQuery.countSql, ...afterQuery.params),
  ]);

  const before = Number(beforeRows?.[0]?.count ?? 0);
  const after = Number(afterRows?.[0]?.count ?? 0);
  const excluded = Math.max(0, before - after);

  return {
    before,
    after,
    excluded,
    count: after,
  };
}

/**
 * Paginated customer list query for UI members table with zero giant IN.
 */
async function getCustomersInListV2(prisma, companyId, rawCriteria, pagination = {}) {
  const criteria = parseCriteriaSafely(rawCriteria);
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(pagination.limit, 10) || 25, 1), 200);
  const skip = (page - 1) * limit;
  const search = typeof pagination.search === 'string' ? pagination.search.trim() : '';

  const excludedRecords = criteria?.excludeListIds?.length > 0
    ? await loadExcludedListRecords(prisma, companyId, criteria.excludeListIds)
    : [];

  const queryParts = buildCustomerListV2QueryParts(companyId, criteria, {
    includeOnly: false,
    excludedListRecords: excludedRecords,
  });

  const params = [...queryParts.params];
  let whereSql = queryParts.whereSql;

  if (search) {
    params.push(`%${search}%`);
    const pIdx = `$${params.length}`;
    whereSql += ` AND (
      c."firstName" ILIKE ${pIdx} OR
      c."lastName" ILIKE ${pIdx} OR
      c."phone" ILIKE ${pIdx} OR
      c."email" ILIKE ${pIdx}
    )`;
  }

  const countSql = `SELECT COUNT(*)::int AS "count" FROM "customers" c WHERE ${whereSql}`;

  params.push(limit);
  const limitIdx = `$${params.length}`;
  params.push(skip);
  const skipIdx = `$${params.length}`;

  const selectSql = `SELECT
    c."id",
    c."firstName",
    c."lastName",
    c."email",
    c."phone",
    c."status",
    c."tags",
    c."customerRating",
    c."deliveryRate",
    c."createdAt",
    c."updatedAt"
  FROM "customers" c
  WHERE ${whereSql}
  ORDER BY c."updatedAt" DESC
  LIMIT ${limitIdx} OFFSET ${skipIdx}`;

  const [countRows, customerRows] = await Promise.all([
    prisma.$queryRawUnsafe(countSql, ...params.slice(0, -2)),
    prisma.$queryRawUnsafe(selectSql, ...params),
  ]);

  const total = Number(countRows?.[0]?.count ?? 0);
  const safeCustomers = Array.isArray(customerRows) ? customerRows : [];

  return {
    customers: safeCustomers,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

/**
 * Human-readable Arabic summary of a v2 criteria object.
 */
function criteriaV2ToSummary(rawCriteria) {
  const criteria = parseCriteriaSafely(rawCriteria);
  if (!criteria) return 'جميع العملاء النشطين';

  const parts = [];
  const incGroups = criteria.include?.groups || [];

  if (incGroups.length === 0) {
    parts.push('جميع العملاء النشطين');
  } else {
    const groupTexts = incGroups.map((g, idx) => {
      const rules = g.rules || [];
      const ruleTexts = rules.map((r) => {
        switch (r.field) {
          case 'receivedProduct':
            return `استلم منتج "${r.sku || r.value}"`;
          case 'orderedInPeriod':
            return `طلب خلال الفترة`;
          case 'ordersCount':
            return `عدد الطلبات ${r.op || '≥'} ${r.value}`;
          case 'totalSpent':
            return `إجمالي الإنفاق ${r.op || '≥'} ${r.value}`;
          case 'lastOrderBefore':
            return `آخر طلب قبل ${r.value}`;
          case 'lastOrderAfter':
            return `آخر طلب بعد ${r.value}`;
          case 'tags':
            return `وسم: ${r.value}`;
          case 'customerStatus':
            return `الحالة: ${Array.isArray(r.value) ? r.value.join('/') : r.value}`;
          case 'city':
            return `المدينة: ${r.value}`;
          case 'governorate':
            return `المحافظة: ${r.value}`;
          case 'deliveryRate':
            return `نسبة الاستلام ${r.op || '≥'} %${r.value}`;
          case 'customerRating':
            return `التقييم: ${Array.isArray(r.value) ? r.value.join('/') : r.value}`;
          default:
            return r.field;
        }
      });
      const gOp = g.operator === 'OR' ? ' أو ' : ' و ';
      return ruleTexts.join(gOp);
    });

    const topOp = criteria.include?.operator === 'OR' ? ' أو ' : ' و ';
    parts.push(groupTexts.join(topOp));
  }

  if (criteria.exclude?.groups?.length > 0) {
    parts.push('مع استبعاد شروط مخصصة');
  }
  if (criteria.excludeListIds?.length > 0) {
    parts.push(`مع استبعاد ${criteria.excludeListIds.length} قوائم`);
  }
  if (toNumber(criteria.excludeContactedInDays, 0) > 0) {
    parts.push(`بدون مراسلة خلال آخر ${criteria.excludeContactedInDays} يوم`);
  }

  return parts.join(' | ');
}

module.exports = {
  ORDER_EXCLUDED_STATUSES,
  DEFAULT_DELIVERED_STATUSES,
  isV2Criteria,
  parseCriteriaSafely,
  compileRuleToSql,
  compileGroupToSql,
  compileContainerToSql,
  compileLegacyCriteriaToSql,
  buildCustomerListV2QueryParts,
  buildCustomerListV2Sql,
  loadExcludedListRecords,
  computeCustomerListCountV2,
  previewCustomerListCountV2,
  getCustomersInListV2,
  criteriaV2ToSummary,
};
