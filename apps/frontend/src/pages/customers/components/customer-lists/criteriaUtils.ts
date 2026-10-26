import { CriteriaType, SMART_PRESETS, STATUS_LABELS, STATUS_LABELS_EN } from "./types";

export function buildEmptyCriteria(type: CriteriaType): Record<string, any> {
  switch (type) {
    case "purchasedProduct":
      return {
        type,
        productIds: [],
        products: [],
        status: "DELIVERED",
        days: 30,
      };
    case "active": return { type, hours: 24 };
    case "inactive": return { type, days: 7 };
    case "orderStatus": return { type, status: "DELIVERED", days: 30 };
    case "returnRequest": return { type, status: "APPROVED", days: 30 };
    case "paymentStatus": return { type, status: "COMPLETED", days: 30 };
    case "city": return { type, city: "" };
    case "product": return { type, productId: "", orderStatus: "DELIVERED" };
    case "customerRating": return { type, rating: "EXCELLENT" };
    case "latest": return { type, limit: 100 };
    case "oldest": return { type, limit: 100 };
    case "minTotalSpent": return { type, amount: 1000 };
    case "minOrdersCount": return { type, count: 2 };
    case "tag": return { type, tag: "" };
    default: return { type };
  }
}

export function buildPresetCriteria(preset: string): Record<string, any> {
  return { type: "preset", preset };
}

function formatProductCriteriaSummary(c: any, isEn: boolean): string {
  const prods = Array.isArray(c.products) && c.products.length > 0
    ? c.products
    : (Array.isArray(c.productIds) ? c.productIds.map((id: string) => ({ id, name: id })) : []);

  const prodNames = prods
    .map((p: any) => {
      if (!p) return "";
      if (typeof p === "string") return p;
      const name = p.name || p.id || "";
      return p.sku ? `${name} (${p.sku})` : name;
    })
    .filter(Boolean);

  const prodStr = prodNames.length > 0
    ? prodNames.join(isEn ? " or " : " أو ")
    : (isEn ? "selected product" : "منتج محدد");

  const status = c.status || "DELIVERED";
  const statusLabel = isEn ? (STATUS_LABELS_EN[status] || status) : (STATUS_LABELS[status] || status);

  const days = parseInt(c.days, 10);
  const timeStr = Number.isInteger(days) && days > 0
    ? (isEn ? `last ${days} days` : `آخر ${days} يوم`)
    : (isEn ? "no time limit" : "بدون حد زمني");

  const prefix = isEn ? "Purchased: " : "اشترى: ";
  return `${prefix}${prodStr} — ${statusLabel} · ${timeStr}`;
}

export function criteriaSummary(criteria: any, locale = "ar"): string {
  const isEn = typeof locale === "string" && locale.startsWith("en");
  if (!criteria) return isEn ? "All active customers" : "جميع العملاء النشطين";
  const c = typeof criteria === "string" ? (() => { try { return JSON.parse(criteria); } catch { return {}; } })() : criteria;
  const type = c.type || "all";

  let summary = "";
  switch (type) {
    case "purchasedProduct":
      summary = formatProductCriteriaSummary(c, isEn);
      break;
    case "active":
      summary = isEn ? `Active in last ${c.hours ?? 24} hours` : `نشط خلال آخر ${c.hours ?? 24} ساعة`;
      break;
    case "inactive":
      summary = isEn ? `Inactive for ${c.days ?? 7} days` : `غير نشط منذ ${c.days ?? 7} يوم`;
      break;
    case "tag":
      summary = isEn ? `Has tag: ${c.tag}` : `يحمل وسم: ${c.tag}`;
      break;
    case "orderStatus":
      summary = isEn
        ? (c.days ? `Orders "${STATUS_LABELS_EN[c.status] || c.status}" in ${c.days} days` : `Orders "${STATUS_LABELS_EN[c.status] || c.status}"`)
        : (c.days ? `طلبات "${STATUS_LABELS[c.status] || c.status}" خلال ${c.days} يوم` : `طلبات بحالة "${STATUS_LABELS[c.status] || c.status}"`);
      break;
    case "returnRequest":
      summary = isEn
        ? (c.days ? `Returns "${STATUS_LABELS_EN[c.status] || c.status || "All"}" in ${c.days} days` : `Returns "${STATUS_LABELS_EN[c.status] || c.status || "All"}"`)
        : (c.days ? `مرتجعات "${STATUS_LABELS[c.status] || c.status || "الكل"}" خلال ${c.days} يوم` : `مرتجعات بحالة "${STATUS_LABELS[c.status] || c.status || "الكل"}"`);
      break;
    case "paymentStatus":
      summary = isEn
        ? (c.days ? `Payment "${STATUS_LABELS_EN[c.status] || c.status}" in ${c.days} days` : `Payment "${STATUS_LABELS_EN[c.status] || c.status}"`)
        : (c.days ? `دفع "${STATUS_LABELS[c.status] || c.status}" خلال ${c.days} يوم` : `دفع بحالة "${STATUS_LABELS[c.status] || c.status}"`);
      break;
    case "city":
      summary = isEn ? `From city: ${c.city}` : `من مدينة: ${c.city}`;
      break;
    case "product": {
      const productStatus = c.orderStatus || c.status;
      const productLabel = c.productId || (isEn ? "unspecified" : "غير محدد");
      const productStatusLabel = productStatus
        ? (isEn ? STATUS_LABELS_EN[productStatus] || productStatus : STATUS_LABELS[productStatus] || productStatus)
        : "";
      summary = productStatus
        ? (isEn
            ? `Product order (${productLabel}) — ${productStatusLabel}`
            : `طلب منتج (${productLabel}) بحالة ${productStatusLabel}`)
        : (isEn ? `Product order (${productLabel})` : `طلب منتج (${productLabel})`);
      break;
    }
    case "customerRating":
      summary = isEn ? `Rating: ${STATUS_LABELS_EN[c.rating] || c.rating}` : `التقييم: ${STATUS_LABELS[c.rating] || c.rating}`;
      break;
    case "latest":
      summary = isEn ? `Latest ${c.limit ?? 100} customers` : `أحدث ${c.limit ?? 100} عميل`;
      break;
    case "oldest":
      summary = isEn ? `Oldest ${c.limit ?? 100} customers` : `أقدم ${c.limit ?? 100} عميل`;
      break;
    case "minTotalSpent":
      summary = isEn ? `Total spent ≥ ${c.amount}` : `إجمالي إنفاق ≥ ${c.amount}`;
      break;
    case "minOrdersCount":
      summary = isEn ? `Orders count ≥ ${c.count}` : `عدد طلبات ≥ ${c.count}`;
      break;
    case "preset": {
      const preset = SMART_PRESETS.find((p) => p.value === c.preset);
      summary = preset ? preset.label : (isEn ? "Preset list" : "قائمة جاهزة");
      break;
    }
    default:
      summary = isEn ? "All active customers" : "جميع العملاء النشطين";
  }

  if (c.excludeContactedInDays && parseInt(c.excludeContactedInDays, 10) > 0) {
    summary += isEn
      ? ` | No contact in last ${c.excludeContactedInDays} days`
      : ` | بدون مراسلة خلال آخر ${c.excludeContactedInDays} يوم`;
  }

  if (Array.isArray(c.exclusions) && c.exclusions.length > 0) {
    const exclSummaries = c.exclusions
      .map((excl: any) => {
        if (!excl) return "";
        if (excl.type === "purchasedProduct") {
          return formatProductCriteriaSummary(excl, isEn);
        }
        return criteriaSummary(excl, locale);
      })
      .filter(Boolean);

    if (exclSummaries.length > 0) {
      const prefix = isEn ? " | Excluding: " : " | استثناء: ";
      summary += `${prefix}${exclSummaries.join(isEn ? ", " : "، ")}`;
    }
  }

  return summary;
}

export function formatDate(date: string | undefined): string {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("ar-EG");
  } catch {
    return "—";
  }
}
