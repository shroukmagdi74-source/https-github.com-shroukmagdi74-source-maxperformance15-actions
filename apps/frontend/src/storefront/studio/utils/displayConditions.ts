import type { DynamicContext } from "./dynamicValues";

export type DisplayConditionOperator =
  | ">"
  | ">="
  | "<="
  | "<"
  | "="
  | "=="
  | "!="
  | "equals"
  | "is";

export interface DisplayConditionRule {
  type?: string;
  field?: "stock" | "price" | "role" | "page" | "onSale" | string;
  operator?: DisplayConditionOperator | string;
  value?: unknown;
}

export interface DisplayConditionsGroup {
  match?: "all" | "any";
  rules?: (DisplayConditionRule | string)[];
}

export type DisplayConditionsInput =
  | string
  | DisplayConditionRule
  | (DisplayConditionRule | string)[]
  | DisplayConditionsGroup
  | null
  | undefined;

export interface DisplayConditionPreset {
  id: string;
  label: string;
  description: string;
  field: string;
}

export const DISPLAY_CONDITION_PRESETS: DisplayConditionPreset[] = [
  {
    id: "stock > 0",
    label: "المخزون متوفر (stock > 0)",
    description: "يظهر فقط إذا كان المنتج متوفراً في المخزون (الكمية > 0)",
    field: "stock",
  },
  {
    id: "onSale",
    label: "منتج بتخفيض (onSale)",
    description: "يظهر فقط إذا كان للمنتج سعر قبل الخصم أكبر من السعر الحالي",
    field: "onSale",
  },
  {
    id: "role = customer",
    label: "للعملاء المسجلين (role = customer)",
    description: "يظهر فقط عند تسجيل دخول العميل",
    field: "role",
  },
  {
    id: "role = guest",
    label: "للزوّار فقط (role = guest)",
    description: "يظهر فقط للزوار غير المسجلين",
    field: "role",
  },
  {
    id: "page = pdp",
    label: "صفحة المنتج (page = pdp)",
    description: "يظهر فقط على صفحة تفاصيل المنتج",
    field: "page",
  },
];

/**
 * Parses a string rule like "stock > 0", "onSale", "price >= 200", "role = customer", "page = pdp"
 */
export function parseConditionString(ruleStr: string): DisplayConditionRule | null {
  const trimmed = ruleStr.trim();
  if (!trimmed) {
    return null;
  }

  // Shorthand for onSale
  if (trimmed === "onSale" || trimmed === "on_sale" || trimmed === "sale") {
    return { field: "onSale", operator: "is", value: true, type: "onSale" };
  }

  // Regex to match "field operator value"
  const match = trimmed.match(/^([a-zA-Z0-9_.-]+)\s*(>=|<=|>|<|==|=|!=|equals|is)\s*(.*)$/i);
  if (match) {
    const [, rawField, rawOp, rawVal] = match;
    const field = rawField.trim();
    const operator = rawOp.trim() as DisplayConditionOperator;
    const cleanVal = rawVal.trim().replace(/^['"]|['"]$/g, "");

    let parsedVal: unknown = cleanVal;
    if (cleanVal === "true") parsedVal = true;
    else if (cleanVal === "false") parsedVal = false;
    else if (!Number.isNaN(Number(cleanVal)) && cleanVal !== "") parsedVal = Number(cleanVal);

    return { field, operator, value: parsedVal, type: trimmed };
  }

  return { field: trimmed, operator: "is", value: true, type: trimmed };
}

/**
 * Evaluates a single rule against a DynamicContext.
 */
export function evaluateSingleRule(
  rule: DisplayConditionRule | string | null | undefined,
  ctx?: DynamicContext | null
): boolean {
  if (!rule) {
    return true;
  }

  const normalizedRule: DisplayConditionRule | null =
    typeof rule === "string" ? parseConditionString(rule) : rule;

  if (!normalizedRule || !normalizedRule.field) {
    return true;
  }

  const { field, operator = "=", value } = normalizedRule;
  const op = String(operator).trim().toLowerCase();

  // 1. Stock rules: stock > 0, stock <= 0, stock == N
  if (field === "stock") {
    const currentStock = Number(ctx?.product?.stock ?? 0);
    const targetStock = Number(value ?? 0);

    if (op === ">") return currentStock > targetStock;
    if (op === ">=") return currentStock >= targetStock;
    if (op === "<") return currentStock < targetStock;
    if (op === "<=") return currentStock <= targetStock;
    if (op === "=" || op === "==" || op === "equals") return currentStock === targetStock;
    if (op === "!=") return currentStock !== targetStock;
    return currentStock > 0;
  }

  // 2. On Sale rule: onSale
  if (field === "onSale" || field === "sale") {
    const prod = ctx?.product;
    if (!prod) return false;

    const compareAt = prod.compareAtPrice ?? prod.comparePrice;
    const price = prod.price;

    const hasCompare =
      compareAt !== undefined &&
      compareAt !== null &&
      !Number.isNaN(Number(compareAt));
    const hasPrice =
      price !== undefined &&
      price !== null &&
      !Number.isNaN(Number(price));

    const isOnSale = hasCompare && hasPrice && Number(compareAt) > Number(price);
    const expected = value === false ? false : true;
    return isOnSale === expected;
  }

  // 3. Price rules: price >= N, price <= N, price == N
  if (field === "price") {
    const currentPrice = Number(ctx?.product?.price ?? 0);
    const targetPrice = Number(value ?? 0);

    if (op === ">=") return currentPrice >= targetPrice;
    if (op === "<=") return currentPrice <= targetPrice;
    if (op === ">") return currentPrice > targetPrice;
    if (op === "<") return currentPrice < targetPrice;
    if (op === "=" || op === "==" || op === "equals") return currentPrice === targetPrice;
    if (op === "!=") return currentPrice !== targetPrice;
    return true;
  }

  // 4. Role rules: role = customer | guest
  if (field === "role") {
    const currentRole = String(ctx?.role || (ctx?.user ? "customer" : "guest")).trim().toLowerCase();
    const targetRole = String(value ?? "").trim().toLowerCase();

    if (op === "!=") return currentRole !== targetRole;
    return currentRole === targetRole;
  }

  // 5. Page rules: page = <key>
  if (field === "page" || field === "pageKey") {
    const currentPage = String(
      ctx?.page?.slug || ctx?.page?.id || ctx?.pageKey || ""
    ).trim().toLowerCase();
    const targetPage = String(value ?? "").trim().toLowerCase();

    if (op === "!=") return currentPage !== targetPage;
    return currentPage === targetPage;
  }

  return true;
}

/**
 * Pure function evaluating a set of display condition rules against dynamic context.
 * Empty condition (null, undefined, "", [], {}) returns TRUE (always visible).
 */
export function evaluateDisplayConditions(
  rules: DisplayConditionsInput,
  ctx?: DynamicContext | null
): boolean {
  if (rules === null || rules === undefined || rules === "") {
    return true;
  }

  if (Array.isArray(rules)) {
    if (rules.length === 0) return true;
    return rules.every((r) => evaluateSingleRule(r, ctx));
  }

  if (typeof rules === "string") {
    const trimmed = rules.trim();
    if (!trimmed) return true;
    return evaluateSingleRule(trimmed, ctx);
  }

  if (typeof rules === "object") {
    // Check if it's a group with rules array
    if ("rules" in rules && Array.isArray((rules as DisplayConditionsGroup).rules)) {
      const group = rules as DisplayConditionsGroup;
      const list = group.rules || [];
      if (list.length === 0) return true;

      if (group.match === "any") {
        return list.some((r) => evaluateSingleRule(r, ctx));
      }
      return list.every((r) => evaluateSingleRule(r, ctx));
    }

    // It's a single DisplayConditionRule object
    if ("field" in rules || "type" in rules) {
      return evaluateSingleRule(rules as DisplayConditionRule, ctx);
    }

    // Empty object = true
    if (Object.keys(rules).length === 0) {
      return true;
    }
  }

  return true;
}
