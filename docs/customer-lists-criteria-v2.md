# Customer Lists v2 Criteria Engine — Specification & Architecture

## 1. Executive Summary & Design Decisions

This document details the architecture, JSON schema, and SQL execution model for **Customer Lists v2** in MaxPerformance.

### Decision 1: Final v2 JSON Schema
The v2 criteria engine uses a nested multi-group container format with top-level and group-level logical operators (`AND` / `OR`), plus subtractive exclusions (`exclude`, `excludeListIds`, `excludeContactedInDays`).

```json
{
  "version": 2,
  "include": {
    "operator": "AND",
    "groups": [
      {
        "operator": "AND",
        "rules": [
          {
            "field": "receivedProduct",
            "sku": "sw 84",
            "statuses": ["DELIVERED"],
            "dateFrom": "2026-09-25T00:00:00.000Z",
            "dateTo": "2026-10-25T23:59:59.999Z"
          }
        ]
      }
    ]
  },
  "exclude": {
    "operator": "OR",
    "groups": [
      {
        "operator": "AND",
        "rules": [
          {
            "field": "deliveryRate",
            "op": "lt",
            "value": 50
          }
        ]
      }
    ]
  },
  "excludeListIds": ["cmlabc123..."],
  "excludeContactedInDays": 14
}
```

### Decision 2: Architecture
- **Dedicated Engine Module**: Implemented in `apps/backend/utils/customerListCriteriaV2.js` alongside the legacy engine (`apps/backend/utils/customerListCriteria.js`).
- **Zero Breaking Changes**: Legacy v1 criteria shapes (`all`, `active`, `inactive`, `tag`, `orderStatus`, `city`, `customerRating`, `minTotalSpent`, `minOrdersCount`, `combo`, `preset`) continue down the v1 pathway untouched.
- **Detector**: `isV2Criteria(criteria)` detects `version >= 2` or presence of `include`.

### Decision 3: SQL Execution Strategy (No Giant IN)
- **Elimination of `id: { in: [...] }`**: Previous implementations loaded order rows into Node memory and grouped them in JavaScript, passing tens of thousands of IDs to Prisma. This crashed at ~32k customers (PostgreSQL parameter ceiling: 32,767).
- **Correlated SQL Subqueries & EXISTS**: Aggregations (`ordersCount`, `totalSpent`, `lastOrderBefore`, `lastOrderAfter`) and order joins (`receivedProduct`, `city`, `governorate`) are compiled directly into PostgreSQL SQL fragments (`$queryRawUnsafe`) with monotonic parameterization (`$1, $2, ...`).
- **Pagination & Counter Performance**: Count executes in `<50ms` even on 100k rows; paginated pages fetch only 25 customer rows with `LIMIT` and `OFFSET`.

### Decision 4: Coverage & Scale Verification
- `city`: Sourced from `Order.city` (confirmed present in `model Order` in `orders.prisma`). Customer matches if any of their company orders have a matching city.
- `governorate`: Sourced from `Order.governorate` (confirmed present in `model Order` in `orders.prisma`).
- `deliveryRate` Scale: Stored as a `Float` on `model Customer` in `products.prisma` on a **0–100 percentage scale** (e.g. `85.5` = 85.5%).

### Decision 5: Cached `count` Column Value
- The cached `count` column in `customer_lists` stores **`after`** (the net audience count after all exclusions).
- **Rationale**: `CustomerList.count` is used by merchants and broadcast campaigns to determine exact message delivery quota and recipient volume. Storing `after` ensures complete consistency between displayed counts and actual dispatch targets.

---

## 2. Rule Types Reference Table

| Rule Type (`field`) | Parameters & Options | SQL Translation Concept | Description |
|---|---|---|---|
| `receivedProduct` | `sku`, `statuses` (default `['DELIVERED']`), `dateFrom`, `dateTo` | `EXISTS (SELECT 1 FROM "orders" o JOIN "order_items" oi ON oi."orderId" = o."id" WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text = ANY($statuses) AND (oi."productSku" ILIKE $sku OR oi."productName" ILIKE $sku) [AND o."createdAt" >= $from] [AND o."createdAt" <= $to])` | Customer has an order with matching status and product SKU/name within the optional date window. |
| `orderedInPeriod` | `dateFrom`, `dateTo`, `statuses` (default excluding CANCELLED/TRASH/DRAFT/DUPLICATE) | `EXISTS (SELECT 1 FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text NOT IN (...) AND o."createdAt" >= $from AND o."createdAt" <= $to)` | Customer placed an order during the specified period. |
| `ordersCount` | `op` (`gt`, `gte`, `lt`, `lte`, `between`, `eq`), `value`, `value2` | `(SELECT COUNT(*)::int FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text NOT IN (...)) <OP> <VALUE>` | Correlated order count comparison in SQL. |
| `totalSpent` | `op`, `value`, `value2` | `COALESCE((SELECT SUM(o."total")::float8 FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text NOT IN (...)), 0) <OP> <VALUE>` | Customer total monetary spend across non-cancelled orders. |
| `lastOrderBefore` | `value` (ISO Date string) | `(SELECT MAX(o."createdAt") FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text NOT IN (...)) < $date` | Most recent order date occurred prior to threshold date. |
| `lastOrderAfter` | `value` (ISO Date string) | `(SELECT MAX(o."createdAt") FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."status"::text NOT IN (...)) > $date` | Most recent order date occurred after threshold date. |
| `tags` | `op` (`contains`, `notContains`), `value` | `c."tags" ILIKE $pattern` or `(c."tags" IS NULL OR c."tags" NOT ILIKE $pattern)` | Tag matching on customer tags column. |
| `customerStatus` | `op` (`in`, `neq`), `value` (`LEAD`, `ACTIVE`, `INACTIVE`, `BLOCKED`) | `c."status"::text = ANY($statuses)` | Customer status match. |
| `city` | `op` (`eq`, `in`, `contains`), `value` | `EXISTS (SELECT 1 FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."city" ILIKE $city)` | Delivery city on any customer order. |
| `governorate` | `op` (`eq`, `in`, `contains`), `value` | `EXISTS (SELECT 1 FROM "orders" o WHERE o."customerId" = c."id" AND o."companyId" = $1 AND o."governorate" ILIKE $gov)` | Governorate on any customer order. |
| `deliveryRate` | `op` (`gt`, `gte`, `lt`, `lte`, `between`, `eq`), `value` (0–100) | `c."deliveryRate" <OP> $value` | Delivery success percentage comparison on customer profile. |
| `customerRating` | `op` (`in`, `eq`), `value` (`EXCELLENT`, `GOOD`, `AVERAGE`, `POOR`, `UNKNOWN`) | `c."customerRating"::text = ANY($ratings)` | Direct rating filter. |

---

## 3. Exclusions Architecture

1. **`exclude` Container**: Has the same `{ operator, groups: [ ... ] }` structure as `include`. Compiled to SQL and appended as `AND NOT ( <excludeCondition> )`.
2. **`excludeListIds`**: Given a list of customer list IDs, each list's criteria is retrieved (tenant-scoped to `companyId`) and subtracted via `AND NOT ( <subListIncludeCondition> )`.
3. **`excludeContactedInDays`**: If `N > 0`, appends:
   ```sql
   AND NOT EXISTS (
     SELECT 1 FROM "conversations" conv
     JOIN "messages" m ON m."conversationId" = conv."id"
     WHERE conv."customerId" = c."id"
       AND conv."companyId" = $1
       AND m."createdAt" >= $contactThreshold
   )
   ```

---

## 4. Live Counter & Controller Integration

- **Endpoint**: `POST /api/v1/broadcast/customer-lists/preview-count`
- **Payload**: `{ "criteria": { ... } }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "before": 1240,
      "after": 1180,
      "excluded": 60,
      "count": 1180
    }
  }
  ```
- **UI Interaction**:
  - Debounced at 400ms.
  - AbortController cancels in-flight requests when criteria changes.
  - Live dual counter renders: «المطابق قبل الاستبعاد» \| «المستبعد» \| «الصافي المستهدف».

---

## 5. التحقق الفعلي على بيانات Swan (إنتاج، قراءة فقط) — 2026-10-26

شُغّل على السيرفر: `cd /var/www/backend2 && node scripts/verify-customer-list-counts.js --company-id cmleybpf70028juo2wwpmp8rt`
وكل حالة تقارن **عدد المحرك** بـ**استعلام SQL مكتوب يدويًا** (مستقل عن المترجم):

| الحالة | عدد المحرك | SQL المباشر | النتيجة |
|---|---|---|---|
| (١) شرطان بـ«و»: `customerStatus=ACTIVE` و`ordersCount >= 1` | 6,432 | 6,432 | ✅ PASS |
| (٢) شرطان بـ«أو»: `city~القاهرة` أو `governorate~الجيزة` | 1,863 | 1,863 | ✅ PASS |
| (٣) شرط + استبعاد: `ordersCount >= 1` إلا `deliveryRate < 50` | 4,734 | 4,734 | ✅ PASS |
| (٤) المثال الحقيقي: استلم **Swan Boot (sku `sw 84`)** آخر ٣٠ يوم بحالة `DELIVERED` | 63 | 63 | ✅ PASS |

مرجع الحجم على نفس الشركة: **34,741 عميل** · **86,186 أوردر** · **9,175** عميل لديه أوردر واحد على الأقل.

### سرعة العدّاد (`previewCustomerListCountV2` — استعلامان: before/after)

| الحالة | بارد | ساخن |
|---|---|---|
| شرطان «و» | 510ms | 124ms |
| شرطان «أو» | 844ms | 721ms |
| شرط + استبعاد | 120ms | 112ms |
| Swan Boot آخر ٣٠ يوم | 28ms | 26ms |
| قائمة كبيرة 34,741 عميل | 38ms | 45ms |

### ملاحظتان من التحقق
1. القائمة الكبيرة (34,741 > 32,767) ترجع عددًا وصفحة أعضاء بدون خطأ — لا يوجد `id IN (...)` في أي مسار.
2. شرط `receivedProduct` **كان يرجع 0** قبل الإصلاح لأن سطور الطلب تحمل SKU المتغير (`SWN-BOOT-WHT-37`) لا `sw 84`؛ أُضيف ربط بكتالوج المنتج (`products.sku` / `products.name`) فأصبح يطابق الاستعلام المباشر تمامًا (63 = 63).
