const {
  isV2Criteria,
  compileRuleToSql,
  compileGroupToSql,
  compileContainerToSql,
  buildCustomerListV2QueryParts,
  buildCustomerListV2Sql,
  criteriaV2ToSummary,
} = require('../../utils/customerListCriteriaV2');

describe('CustomerListCriteriaV2 Unit Tests', () => {
  const companyId = 'company_test_123';

  describe('isV2Criteria detector', () => {
    test('detects version >= 2', () => {
      expect(isV2Criteria({ version: 2 })).toBe(true);
      expect(isV2Criteria({ version: '2' })).toBe(true);
      expect(isV2Criteria(JSON.stringify({ version: 2 }))).toBe(true);
    });

    test('detects presence of include container', () => {
      expect(isV2Criteria({ include: { operator: 'AND', groups: [] } })).toBe(true);
      expect(isV2Criteria(JSON.stringify({ include: { groups: [] } }))).toBe(true);
    });

    test('rejects legacy criteria (v1)', () => {
      expect(isV2Criteria(null)).toBe(false);
      expect(isV2Criteria(undefined)).toBe(false);
      expect(isV2Criteria({ type: 'all' })).toBe(false);
      expect(isV2Criteria({ type: 'tag', tag: 'VIP' })).toBe(false);
      expect(isV2Criteria({ type: 'preset', preset: 'champions' })).toBe(false);
      expect(isV2Criteria('{"type":"combo","conditions":[]}')).toBe(false);
    });
  });

  describe('Rule translation for all 10 types', () => {
    let params;
    let addParam;
    let ctx;

    beforeEach(() => {
      params = [companyId];
      addParam = (val) => {
        params.push(val);
        return `$${params.length}`;
      };
      ctx = { addParam, companyIdParam: '$1' };
    });

    // 1. receivedProduct
    test('rule: receivedProduct translates to EXISTS order with item SKU and DELIVERED status', () => {
      const sql = compileRuleToSql(
        {
          field: 'receivedProduct',
          sku: 'sw 84',
          statuses: ['DELIVERED'],
          dateFrom: '2026-09-01',
          dateTo: '2026-09-30',
        },
        ctx
      );

      expect(sql).toContain('EXISTS');
      expect(sql).toContain('"orders" o');
      expect(sql).toContain('"order_items" oi');
      expect(sql).toContain('oi."orderId" = o."id"');
      expect(sql).toContain('o."companyId" = $1');
      expect(sql).toContain('o."status"::text = ANY($2)');
      expect(params[1]).toEqual(['DELIVERED']);
      expect(params[2]).toBe('%sw 84%');
      const dateParams = params.filter((p) => p instanceof Date);
      expect(dateParams.length).toBe(2);
      expect(sql).toContain(`o."createdAt" >= $${params.indexOf(dateParams[0]) + 1}`);
      expect(sql).toContain(`o."createdAt" <= $${params.indexOf(dateParams[1]) + 1}`);
    });

    test('rule: receivedProduct defaults to DELIVERED status if omitted', () => {
      const sql = compileRuleToSql({ field: 'receivedProduct', sku: 'ABC' }, ctx);
      expect(sql).toContain('o."status"::text = ANY($2)');
      expect(params[1]).toEqual(['DELIVERED']);
    });

    // 2. orderedInPeriod
    test('rule: orderedInPeriod translates to EXISTS order in date range', () => {
      const sql = compileRuleToSql(
        {
          field: 'orderedInPeriod',
          dateFrom: '2026-01-01',
          dateTo: '2026-03-31',
        },
        ctx
      );

      expect(sql).toContain('EXISTS');
      expect(sql).toContain('"orders" o');
      expect(sql).toContain('NOT IN (\'CANCELLED\', \'TRASH\', \'DRAFT\', \'DUPLICATE_ORDER\')');
      expect(sql).toContain('o."createdAt" >= $2');
      expect(sql).toContain('o."createdAt" <= $3');
    });

    // 3. ordersCount
    test('rule: ordersCount with gte operator', () => {
      const sql = compileRuleToSql({ field: 'ordersCount', op: 'gte', value: 3 }, ctx);
      expect(sql).toContain('SELECT COUNT(*)::int FROM "orders" o');
      expect(sql).toContain('o."companyId" = $1');
      expect(sql).toContain('>= $2');
      expect(params[1]).toBe(3);
    });

    test('rule: ordersCount with between operator', () => {
      const sql = compileRuleToSql({ field: 'ordersCount', op: 'between', value: 2, value2: 5 }, ctx);
      expect(sql).toContain('BETWEEN $2 AND $3');
      expect(params[1]).toBe(2);
      expect(params[2]).toBe(5);
    });

    // 4. totalSpent
    test('rule: totalSpent with gt operator on valid orders', () => {
      const sql = compileRuleToSql({ field: 'totalSpent', op: 'gt', value: 1500 }, ctx);
      expect(sql).toContain('COALESCE((SELECT SUM(o."total")::float8 FROM "orders" o');
      expect(sql).toContain('> $2');
      expect(params[1]).toBe(1500);
    });

    // 5. lastOrderBefore
    test('rule: lastOrderBefore checks MAX(o.createdAt) < date', () => {
      const sql = compileRuleToSql({ field: 'lastOrderBefore', value: '2026-08-01' }, ctx);
      expect(sql).toContain('SELECT MAX(o."createdAt") FROM "orders" o');
      expect(sql).toContain('< $2');
      expect(params[1]).toBeInstanceOf(Date);
    });

    // 6. lastOrderAfter
    test('rule: lastOrderAfter checks MAX(o.createdAt) > date', () => {
      const sql = compileRuleToSql({ field: 'lastOrderAfter', value: '2026-08-01' }, ctx);
      expect(sql).toContain('SELECT MAX(o."createdAt") FROM "orders" o');
      expect(sql).toContain('> $2');
      expect(params[1]).toBeInstanceOf(Date);
    });

    // 7. tags
    test('rule: tags contains and notContains', () => {
      const sqlContains = compileRuleToSql({ field: 'tags', op: 'contains', value: 'VIP' }, ctx);
      expect(sqlContains).toContain('c."tags" ILIKE $2');
      expect(params[1]).toBe('%VIP%');

      const sqlNotContains = compileRuleToSql({ field: 'tags', op: 'notContains', value: 'BANNED' }, ctx);
      expect(sqlNotContains).toContain('c."tags" IS NULL OR c."tags" NOT ILIKE $3');
      expect(params[2]).toBe('%BANNED%');
    });

    // 8. customerStatus
    test('rule: customerStatus matches in list', () => {
      const sql = compileRuleToSql({ field: 'customerStatus', op: 'in', value: ['ACTIVE', 'LEAD'] }, ctx);
      expect(sql).toContain('c."status"::text = ANY($2)');
      expect(params[1]).toEqual(['ACTIVE', 'LEAD']);
    });

    // 9. city
    test('rule: city checks orders.city', () => {
      const sql = compileRuleToSql({ field: 'city', value: 'Cairo' }, ctx);
      expect(sql).toContain('EXISTS');
      expect(sql).toContain('o."city" ILIKE $2');
      expect(params[1]).toBe('%Cairo%');
    });

    test('rule: city with array of cities', () => {
      const sql = compileRuleToSql({ field: 'city', value: ['Cairo', 'Giza'] }, ctx);
      expect(sql).toContain('o."city" = ANY($2)');
      expect(params[1]).toEqual(['Cairo', 'Giza']);
    });

    // 10. governorate
    test('rule: governorate checks orders.governorate', () => {
      const sql = compileRuleToSql({ field: 'governorate', value: 'Alexandria' }, ctx);
      expect(sql).toContain('EXISTS');
      expect(sql).toContain('o."governorate" ILIKE $2');
      expect(params[1]).toBe('%Alexandria%');
    });

    // 11. deliveryRate
    test('rule: deliveryRate checks 0-100 scale on customer column', () => {
      const sql = compileRuleToSql({ field: 'deliveryRate', op: 'gte', value: 80 }, ctx);
      expect(sql).toContain('c."deliveryRate" >= $2');
      expect(params[1]).toBe(80);
    });

    // 12. customerRating
    test('rule: customerRating in list', () => {
      const sql = compileRuleToSql({ field: 'customerRating', value: ['EXCELLENT', 'GOOD'] }, ctx);
      expect(sql).toContain('c."customerRating"::text = ANY($2)');
      expect(params[1]).toEqual(['EXCELLENT', 'GOOD']);
    });
  });

  describe('AND / OR Precedence and Nested Groups', () => {
    let ctx;
    let params;

    beforeEach(() => {
      params = [companyId];
      ctx = {
        addParam: (v) => {
          params.push(v);
          return `$${params.length}`;
        },
        companyIdParam: '$1',
      };
    });

    test('group operator OR joins rules with OR', () => {
      const group = {
        operator: 'OR',
        rules: [
          { field: 'city', value: 'Cairo' },
          { field: 'city', value: 'Giza' },
        ],
      };
      const sql = compileGroupToSql(group, ctx);
      const flat = sql.replace(/\s+/g, ' ');
      const orIdx = flat.indexOf(') OR EXISTS (');
      expect(orIdx).toBeGreaterThan(-1);
      expect(flat.slice(0, orIdx)).toContain('ILIKE $2');
      expect(flat.slice(orIdx)).toContain('ILIKE $3');
    });

    test('container with AND groups joins them with AND', () => {
      const container = {
        operator: 'AND',
        groups: [
          {
            operator: 'OR',
            rules: [
              { field: 'customerStatus', value: ['ACTIVE'] },
              { field: 'customerStatus', value: ['LEAD'] },
            ],
          },
          {
            operator: 'AND',
            rules: [
              { field: 'ordersCount', op: 'gte', value: 2 },
              { field: 'totalSpent', op: 'gte', value: 1000 },
            ],
          },
        ],
      };
      const sql = compileContainerToSql(container, ctx);
      expect(sql).toContain(') AND (');
      expect(sql.startsWith('(')).toBe(true);
      expect(sql.endsWith(')')).toBe(true);
    });

    test('nested precedence: (A OR B) AND (C OR D)', () => {
      const container = {
        operator: 'AND',
        groups: [
          {
            operator: 'OR',
            rules: [
              { field: 'city', value: 'Cairo' },
              { field: 'city', value: 'Giza' },
            ],
          },
          {
            operator: 'OR',
            rules: [
              { field: 'customerRating', value: ['EXCELLENT'] },
              { field: 'deliveryRate', op: 'gte', value: 90 },
            ],
          },
        ],
      };
      const sql = compileContainerToSql(container, ctx);
      expect(sql).toMatch(/^\(\(.*OR.*\)\s+AND\s+\(.*OR.*\)\)$/s);
    });
  });

  describe('Exclusion composition (boolean subtraction)', () => {
    test('exclude container generates NOT (excludeCondition)', () => {
      const criteria = {
        version: 2,
        include: {
          operator: 'AND',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'ordersCount', op: 'gte', value: 1 }],
            },
          ],
        },
        exclude: {
          operator: 'OR',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'deliveryRate', op: 'lt', value: 50 }],
            },
          ],
        },
      };

      const { whereSql } = buildCustomerListV2QueryParts(companyId, criteria);
      expect(whereSql).toContain('c."companyId" = $1');
      // ordersCount >= 1 يتحول لمسار EXISTS السريع (بدون params)، أو COUNT في الحالة العامة
      expect(whereSql).toMatch(/EXISTS \(SELECT 1 FROM "orders" o|SELECT COUNT\(\*\)::int FROM "orders" o/);
      expect(whereSql).toMatch(/NOT \(c\."deliveryRate" < \$\d\)/);
    });

    test('excludeContactedInDays adds NOT EXISTS on conversations within threshold', () => {
      const criteria = {
        version: 2,
        include: {
          operator: 'AND',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'customerStatus', value: ['ACTIVE'] }],
            },
          ],
        },
        excludeContactedInDays: 14,
      };

      const { whereSql, params } = buildCustomerListV2QueryParts(companyId, criteria);
      expect(whereSql).toContain('NOT EXISTS');
      expect(whereSql).toContain('"conversations" conv');
      expect(whereSql).toContain('"messages" m');
      expect(whereSql).toContain('m."createdAt" >= $3');
      expect(params[2]).toBeInstanceOf(Date);
    });

    test('excludeListIds resolves and subtracts referenced lists', () => {
      const criteria = {
        version: 2,
        include: {
          operator: 'AND',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'ordersCount', op: 'gte', value: 1 }],
            },
          ],
        },
        excludeListIds: ['list_vip_1'],
      };

      const excludedListRecords = [
        {
          id: 'list_vip_1',
          criteria: JSON.stringify({
            version: 2,
            include: {
              operator: 'AND',
              groups: [
                {
                  operator: 'AND',
                  rules: [{ field: 'tags', op: 'contains', value: 'VIP' }],
                },
              ],
            },
          }),
        },
      ];

      const { whereSql } = buildCustomerListV2QueryParts(companyId, criteria, {
        excludedListRecords,
      });

      expect(whereSql).toContain('NOT (c."tags" ILIKE');
    });

    test('buildCustomerListV2Sql produces valid countSql and selectSql', () => {
      const criteria = {
        version: 2,
        include: {
          operator: 'AND',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'receivedProduct', sku: 'sw 84' }],
            },
          ],
        },
      };

      const { countSql, selectSql, params } = buildCustomerListV2Sql(companyId, criteria);
      expect(countSql).toMatch(/^SELECT COUNT\(\*\)::int AS "count" FROM "customers" c WHERE /);
      const flatSelect = selectSql.replace(/\s+/g, ' ');
      expect(flatSelect.startsWith('SELECT c."id",')).toBe(true);
      expect(flatSelect).toContain('FROM "customers" c WHERE');
      expect(params[0]).toBe(companyId);
    });
  });

  describe('criteriaV2ToSummary', () => {
    test('formats Swan boot rule and exclusions into readable Arabic summary', () => {
      const criteria = {
        version: 2,
        include: {
          operator: 'AND',
          groups: [
            {
              operator: 'AND',
              rules: [{ field: 'receivedProduct', sku: 'sw 84' }],
            },
          ],
        },
        excludeContactedInDays: 7,
      };

      const summary = criteriaV2ToSummary(criteria);
      expect(summary).toContain('استلم منتج "sw 84"');
      expect(summary).toContain('بدون مراسلة خلال آخر 7 يوم');
    });
  });
});
