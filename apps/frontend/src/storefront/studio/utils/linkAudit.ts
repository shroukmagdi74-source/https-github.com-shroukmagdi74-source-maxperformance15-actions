/**
 * linkAudit.ts
 * Pure Link Auditor for MaxP Storefront Studio pages.
 * Validates internal navigation links against known store routes and custom pages without network requests.
 * Evaluates:
 * 1. Empty links or useless '#' placeholders
 * 2. Unsafe 'javascript:' protocol links
 * 3. Broken/unknown internal routes not present in standard store routes or custom page registry
 */

export interface LinkIssue {
  id: string;
  type: "empty-link" | "placeholder-hash" | "unknown-route" | "unsafe-protocol";
  severity: "warn" | "fail";
  url: string;
  cleanPath?: string;
  sectionKey?: string;
  sectionLabel?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface LinkAuditResult {
  passed: boolean;
  totalLinks: number;
  validLinksCount: number;
  brokenLinksCount: number;
  issues: LinkIssue[];
  summary: {
    emptyCount: number;
    hashOnlyCount: number;
    unknownRoutesCount: number;
    externalCount: number;
    internalCount: number;
  };
}

export interface AuditLinksParams {
  sections?: any[];
  availablePages?: string[];
  customRoutes?: string[];
}

export const STANDARD_STOREFRONT_ROUTES = [
  "",
  "shop",
  "products",
  "product",
  "catalog",
  "cart",
  "checkout",
  "thank-you",
  "collections",
  "collection",
  "articles",
  "article",
  "blog",
  "contact",
  "about",
  "terms",
  "privacy",
  "faq",
  "search",
  "account",
  "login",
  "register",
  "orders",
  "wishlist",
];

/**
 * Validates a single link against standard routes and available custom pages.
 * Returns null if valid, or a LinkIssue if broken/invalid.
 */
export function validateLink(
  rawUrl: string,
  context: {
    sectionKey?: string;
    sectionLabel?: string;
    availablePages?: string[];
    customRoutes?: string[];
    knownSectionIds?: string[];
  } = {}
): LinkIssue | null {
  const {
    sectionKey,
    sectionLabel = "قسم غير مسمى",
    availablePages = [],
    customRoutes = [],
    knownSectionIds = [],
  } = context;

  const trimmed = (rawUrl || "").trim();

  // 1. Empty Link
  if (!trimmed) {
    return {
      id: `link-empty-${sectionKey || "global"}-${Math.random().toString(36).slice(2, 7)}`,
      type: "empty-link",
      severity: "fail",
      url: "",
      sectionKey,
      sectionLabel,
      message: `تم رصد رابط فارغ بدون وجهة في "${sectionLabel}".`,
    };
  }

  // 2. Placeholder '#'
  if (trimmed === "#") {
    return {
      id: `link-hash-${sectionKey || "global"}-${Math.random().toString(36).slice(2, 7)}`,
      type: "placeholder-hash",
      severity: "fail",
      url: "#",
      sectionKey,
      sectionLabel,
      message: `تم رصد رابط وهمي معطل ("#") في "${sectionLabel}" — يجب تحديد مسار حقيقي للزر أو الرابط.`,
    };
  }

  // 3. Unsafe Protocol
  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return {
      id: `link-js-${sectionKey || "global"}-${Math.random().toString(36).slice(2, 7)}`,
      type: "unsafe-protocol",
      severity: "fail",
      url: trimmed,
      sectionKey,
      sectionLabel,
      message: `تم رصد رابط غير آمن يستخدم بروتوكول javascript: في "${sectionLabel}".`,
    };
  }

  // 4. External or System Links (Pass immediately)
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return null;
  }

  // 5. In-page Anchor Links (#section-id)
  if (trimmed.startsWith("#")) {
    const anchor = trimmed.slice(1).trim();
    if (!anchor) {
      return {
        id: `link-empty-anchor-${sectionKey || "global"}`,
        type: "placeholder-hash",
        severity: "fail",
        url: trimmed,
        sectionKey,
        sectionLabel,
        message: `تم رصد رابط شباك فارغ ("#") في "${sectionLabel}".`,
      };
    }
    // Specific standard anchors are always allowed
    const standardAnchors = ["top", "footer", "header", "content", "main"];
    if (standardAnchors.includes(anchor) || knownSectionIds.includes(anchor)) {
      return null;
    }
    // Allow any anchor starting with section or sec
    return null;
  }

  // 6. Internal Route Resolution
  const withoutQuery = trimmed.split("?")[0]!.split("#")[0]!;
  const cleanPath = withoutQuery.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();

  // Root path ("/" or "") is home
  if (!cleanPath) {
    return null;
  }

  // Check against standard routes (exact or prefix match e.g. "products/item-123")
  const isStandard = STANDARD_STOREFRONT_ROUTES.some((route) => {
    if (!route) return false;
    return cleanPath === route || cleanPath.startsWith(`${route}/`);
  });

  if (isStandard) {
    return null;
  }

  // Check against custom routes
  if (customRoutes.some((cr) => cleanPath === cr.toLowerCase().replace(/^\/+/, ""))) {
    return null;
  }

  // Check against availablePages
  const isAvailableCustom = availablePages.some((page) => {
    const p = page.toLowerCase().replace(/^\/+/, "");
    return (
      cleanPath === p ||
      cleanPath === `pages/${p}` ||
      cleanPath === `shop/page/${p}` ||
      cleanPath.startsWith(`${p}/`)
    );
  });

  if (isAvailableCustom) {
    return null;
  }

  // If internal route is unknown -> FAIL
  return {
    id: `link-unknown-${sectionKey || "global"}-${cleanPath}`,
    type: "unknown-route",
    severity: "fail",
    url: trimmed,
    cleanPath,
    sectionKey,
    sectionLabel,
    message: `رابط داخلي يشير إلى مسار غير معروف ("${trimmed}") في "${sectionLabel}" — قد يؤدي إلى صفحة خطأ 404.`,
    details: { rawUrl: trimmed, cleanPath },
  };
}

/**
 * Audits all internal and external links within page sections.
 */
export function auditLinks(params: AuditLinksParams): LinkAuditResult {
  const { sections = [], availablePages = [], customRoutes = [] } = params;
  const issues: LinkIssue[] = [];

  const knownSectionIds = sections
    .map((s) => s?.key || s?.id)
    .filter((id): id is string => typeof id === "string" && Boolean(id));

  let totalLinks = 0;
  let emptyCount = 0;
  let hashOnlyCount = 0;
  let unknownRoutesCount = 0;
  let externalCount = 0;
  let internalCount = 0;

  sections.forEach((sec, idx) => {
    const sectionKey = sec?.key || sec?.id || `section-${idx}`;
    const type = typeof sec === "string" ? sec : sec?.type || `قسم ${idx + 1}`;
    const settings = typeof sec === "object" && sec !== null ? sec.settings || sec : {};
    const label = sec?.label || type;

    const urlsToCheck: string[] = [];

    // Direct section link fields
    if (typeof settings.link === "string") urlsToCheck.push(settings.link);
    if (typeof settings.buttonLink === "string") urlsToCheck.push(settings.buttonLink);
    if (typeof settings.ctaLink === "string") urlsToCheck.push(settings.ctaLink);
    if (typeof settings.buttonUrl === "string") urlsToCheck.push(settings.buttonUrl);
    if (typeof settings.url === "string") urlsToCheck.push(settings.url);
    if (typeof settings.href === "string") urlsToCheck.push(settings.href);
    if (typeof settings.targetUrl === "string") urlsToCheck.push(settings.targetUrl);

    // Items array links
    if (Array.isArray(settings.items)) {
      settings.items.forEach((item: any) => {
        if (!item || typeof item !== "object") return;
        if (typeof item.link === "string") urlsToCheck.push(item.link);
        if (typeof item.buttonLink === "string") urlsToCheck.push(item.buttonLink);
        if (typeof item.ctaLink === "string") urlsToCheck.push(item.ctaLink);
        if (typeof item.url === "string") urlsToCheck.push(item.url);
        if (typeof item.href === "string") urlsToCheck.push(item.href);
      });
    }

    // Products links if customized
    if (Array.isArray(settings.products)) {
      settings.products.forEach((prod: any) => {
        if (prod && typeof prod === "object") {
          if (typeof prod.url === "string") urlsToCheck.push(prod.url);
          if (typeof prod.link === "string") urlsToCheck.push(prod.link);
        }
      });
    }

    urlsToCheck.forEach((url) => {
      totalLinks++;
      const trimmed = url.trim();

      if (!trimmed) {
        emptyCount++;
      } else if (trimmed === "#") {
        hashOnlyCount++;
      } else if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
      ) {
        externalCount++;
      } else {
        internalCount++;
      }

      const issue = validateLink(url, {
        sectionKey,
        sectionLabel: label,
        availablePages,
        customRoutes,
        knownSectionIds,
      });

      if (issue) {
        if (issue.type === "unknown-route") {
          unknownRoutesCount++;
        }
        issues.push(issue);
      }
    });
  });

  const brokenLinksCount = issues.length;
  const validLinksCount = Math.max(0, totalLinks - brokenLinksCount);

  return {
    passed: brokenLinksCount === 0,
    totalLinks,
    validLinksCount,
    brokenLinksCount,
    issues,
    summary: {
      emptyCount,
      hashOnlyCount,
      unknownRoutesCount,
      externalCount,
      internalCount,
    },
  };
}
