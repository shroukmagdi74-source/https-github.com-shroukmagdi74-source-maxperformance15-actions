import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefrontTheme } from './ThemeProvider';
import { useStorefrontSettings } from '../hooks/useStorefrontSettings';

/** Map of route segments to human-readable page names */
const PAGE_NAME_MAP: Record<string, string> = {
  '': 'الرئيسية',
  shop: 'المتجر',
  cart: 'السلة',
  checkout: 'الدفع',
  product: 'المنتج',
  category: 'التصنيف',
  collections: 'التصنيفات',
  articles: 'المدونة',
  article: 'المقال',
  blog: 'المدونة',
  sale: 'التخفيضات',
  lookbook: 'اللوك بوك',
  'size-guide': 'دليل المقاسات',
  'thank-you': 'تم الطلب بنجاح',
};

/**
 * Apply a title template that supports both `%s` and `{{page}}`/`{{store}}` syntax.
 * Falls back to `pageTitle | storeName` if no template is set.
 */
const applyTitleTemplate = (
  template: string,
  pageTitle: string,
  storeName: string,
): string =>
  template
    .replace(/%s/g, pageTitle)
    .replace(/\{\{page\}\}/gi, pageTitle)
    .replace(/\{\{store\}\}/gi, storeName);

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveTitleTemplate = ({
  runtimeSeo,
  themeSeo,
  themeBrandNames,
  storeName,
}: {
  runtimeSeo: Record<string, unknown>;
  themeSeo: Record<string, unknown>;
  themeBrandNames: string[];
  storeName: string;
}): string => {
  const runtimeTitleTemplate =
    typeof runtimeSeo.titleTemplate === 'string'
      ? runtimeSeo.titleTemplate.trim()
      : '';
  if (runtimeTitleTemplate) {
    return runtimeTitleTemplate;
  }

  const themeTitleTemplate =
    typeof themeSeo.titleTemplate === 'string'
      ? themeSeo.titleTemplate.trim()
      : '';
  if (!themeTitleTemplate) {
    return `%s | ${storeName}`;
  }

  return themeBrandNames.reduce((template, brandName) => {
    const trimmedBrandName = brandName.trim();
    if (!trimmedBrandName || trimmedBrandName === storeName) {
      return template;
    }

    return template.replace(
      new RegExp(escapeRegExp(trimmedBrandName), 'g'),
      '{{store}}',
    );
  }, themeTitleTemplate);
};

/** Safely set or create a <meta> tag */
const setMetaTag = (
  selector: string,
  attribute: string,
  attributeValue: string,
  content: string,
): HTMLMetaElement => {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, attributeValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
};

/** Safely set or create a <link> tag */
const setLinkTag = (
  rel: string,
  href: string,
): HTMLLinkElement => {
  const selector = `link[rel="${rel}"]`;
  let el = document.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  return el;
};

export const StorefrontHead: React.FC = () => {
  const { theme } = useStorefrontTheme();
  const { settings: storefrontSettings } = useStorefrontSettings();
  const location = useLocation();

  useEffect(() => {
    if (!theme) return;

    // PAGE-1.2: Capture original head metadata for unmount restoration
    const originalTitle = document.title;

    const prevRobotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prevRobots = prevRobotsEl ? prevRobotsEl.getAttribute('content') : null;
    const hadRobots = Boolean(prevRobotsEl);

    const prevDescEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = prevDescEl ? prevDescEl.getAttribute('content') : null;
    const hadDesc = Boolean(prevDescEl);

    const prevCanonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = prevCanonicalEl ? prevCanonicalEl.getAttribute('href') : null;
    const hadCanonical = Boolean(prevCanonicalEl);

    const prevOgTitleEl = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const prevOgTitle = prevOgTitleEl ? prevOgTitleEl.getAttribute('content') : null;
    const hadOgTitle = Boolean(prevOgTitleEl);

    const prevOgDescEl = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const prevOgDesc = prevOgDescEl ? prevOgDescEl.getAttribute('content') : null;
    const hadOgDesc = Boolean(prevOgDescEl);

    const prevOgImageEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const prevOgImage = prevOgImageEl ? prevOgImageEl.getAttribute('content') : null;
    const hadOgImage = Boolean(prevOgImageEl);

    const runtimeSeo = storefrontSettings?.storefront?.settings?.seo || {};
    const themeSeo = theme.seo || {};
    const seo = {
      ...themeSeo,
      ...(typeof runtimeSeo === 'object' && runtimeSeo !== null ? runtimeSeo : {}),
    };
    const companySettings =
      storefrontSettings?.company?.settings &&
      typeof storefrontSettings.company.settings === 'object'
        ? storefrontSettings.company.settings
        : {};

    // Use storefront settings name → theme brand name → theme name as fallback
    const storeName =
      storefrontSettings?.storefront?.settings?.storeName ||
      storefrontSettings?.storefrontSettings?.storeName ||
      theme.header?.brandName ||
      storefrontSettings?.company?.name ||
      theme.name ||
      '';
    const titleTemplate = resolveTitleTemplate({
      runtimeSeo:
        typeof runtimeSeo === 'object' && runtimeSeo !== null
          ? (runtimeSeo as Record<string, unknown>)
          : {},
      themeSeo: themeSeo as Record<string, unknown>,
      themeBrandNames: [theme.header?.brandName, theme.name].filter(
        (value): value is string => Boolean(value),
      ),
      storeName,
    });
    const defaultDescription =
      seo.description ||
      storefrontSettings?.storefront?.settings?.description ||
      storefrontSettings?.storefrontSettings?.description ||
      (typeof companySettings.description === 'string' ? companySettings.description : '') ||
      `${storeName} — تسوق أونلاين بأفضل الأسعار والعروض. شحن لكل المحافظات.`;
    const faviconUrl =
      seo.faviconUrl ||
      theme.header?.logoUrl ||
      storefrontSettings?.storefront?.settings?.['logoUrl'] ||
      storefrontSettings?.company?.logo ||
      undefined;

    const segments = location.pathname.split('/').filter(Boolean);
    let routeSegments = segments[0] === 'store' ? segments.slice(1) : segments;
    if (
      segments[0] === 'store' &&
      routeSegments.length > 0 &&
      !['shop', 'products', 'product', 'cart', 'checkout', 'pages'].includes(routeSegments[0])
    ) {
      routeSegments = routeSegments.slice(1);
    }
    const pageSegment =
      routeSegments[0] === 'product'
        ? 'product'
        : routeSegments[0] || '';
    const pageTitle =
      PAGE_NAME_MAP[pageSegment] ||
      pageSegment.charAt(0).toUpperCase() + pageSegment.slice(1);

    // PAGE-1.2: Resolve active page configuration across theme & designTokens
    const allPages: Record<string, any> = {
      ...(theme?.pages || {}),
      ...(((storefrontSettings?.storefront?.settings as any)?.designTokens?.pages) || {}),
      ...(((storefrontSettings as any)?.designTokens?.pages) || {}),
    };

    let activePageKey = 'home';
    if (routeSegments.length === 0) {
      activePageKey = 'home';
    } else if (routeSegments[0] === 'pages' && routeSegments[1]) {
      activePageKey = routeSegments.slice(1).join('/');
    } else if (routeSegments[0] === 'shop' && routeSegments[1] === 'page' && routeSegments[2]) {
      activePageKey = routeSegments.slice(2).join('/');
    } else {
      const fullPath = routeSegments.join('/');
      if (allPages[fullPath]) {
        activePageKey = fullPath;
      } else if (allPages[routeSegments[0]]) {
        activePageKey = routeSegments[0];
      } else {
        activePageKey = routeSegments[0] || 'home';
      }
    }

    const activePage = allPages[activePageKey];
    const pageSeo = activePage?.seo;

    const isDynamicDetailRoute =
      pageSegment === 'product' ||
      pageSegment === 'article' ||
      pageSegment === 'articles' ||
      (pageSegment === 'category' && routeSegments.length > 1);

    const genericTitles = new Set([
      'المنتج',
      `المنتج | ${storeName}`,
      'المقال',
      `المقال | ${storeName}`,
      'التصنيف',
      `التصنيف | ${storeName}`,
    ]);

    const isCorruptedTitle = (t: string) => {
      const s = t.trim();
      return !s || /^\?{2,}/.test(s) || s.includes('???');
    };

    const shouldPreserveExistingTitle =
      isDynamicDetailRoute &&
      Boolean(originalTitle.trim()) &&
      !genericTitles.has(originalTitle.trim()) &&
      !isCorruptedTitle(originalTitle);

    // Apply Title: prefer pageSeo.title if configured, else fallback
    let finalTitle: string;
    if (pageSeo?.title?.trim()) {
      const customTitle = pageSeo.title.trim();
      finalTitle =
        storeName && !customTitle.includes(storeName)
          ? `${customTitle} | ${storeName}`
          : customTitle;
    } else if (shouldPreserveExistingTitle) {
      finalTitle = originalTitle;
    } else if (activePage?.title?.trim() && activePageKey !== 'home') {
      finalTitle = `${activePage.title.trim()} | ${storeName}`;
    } else if (pageSegment) {
      finalTitle = applyTitleTemplate(titleTemplate, pageTitle, storeName);
    } else {
      finalTitle = storeName;
    }

    if (pageSeo?.title?.trim() || !shouldPreserveExistingTitle) {
      document.title = finalTitle;
    }

    // Robots Tag: noindex in pageSeo -> "noindex, nofollow"
    const searchParams = new URLSearchParams(location.search);
    const hasSearchFilterParams =
      searchParams.has('search') ||
      searchParams.has('q') ||
      searchParams.has('minPrice') ||
      searchParams.has('maxPrice') ||
      searchParams.has('sortBy') ||
      searchParams.has('sort') ||
      searchParams.has('previewTheme');

    if (pageSeo?.noindex) {
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
    } else if (hasSearchFilterParams) {
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, follow');
    } else {
      setMetaTag(
        'meta[name="robots"]',
        'name',
        'robots',
        'index, follow, max-image-preview:large',
      );
    }

    // Meta Description: prefer pageSeo.description if available
    const finalDescription = pageSeo?.description?.trim() || defaultDescription;
    setMetaTag('meta[name="description"]', 'name', 'description', finalDescription);

    // Favicon — use store logo as favicon if no dedicated favicon
    let faviconLink: HTMLLinkElement | null = null;
    if (faviconUrl) {
      faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
    }

    // Dynamic og:url — use current page URL
    const currentUrl = window.location.href;
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag(
      'meta[property="og:type"]',
      'property',
      'og:type',
      pageSegment === 'product' ? 'product' : 'website',
    );

    // OG & Twitter Tags
    const ogTitle = pageSeo?.title?.trim() || finalTitle;
    const ogDescription = pageSeo?.description?.trim() || finalDescription;
    const defaultOgImage =
      seo.defaultOgImage ||
      storefrontSettings?.company?.logo ||
      undefined;
    const ogImage = pageSeo?.ogImage?.trim() || defaultOgImage;

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', storeName);

    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    // Twitter Card Tags
    setMetaTag(
      'meta[name="twitter:card"]',
      'name',
      'twitter:card',
      ogImage ? 'summary_large_image' : 'summary',
    );
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription);

    // Canonical URL — prefer pageSeo.canonical if provided, otherwise clean URL
    let canonicalUrl = currentUrl;
    if (pageSeo?.canonical?.trim()) {
      canonicalUrl = pageSeo.canonical.trim();
    } else {
      try {
        const parsedUrl = new URL(window.location.href);
        const trackingParams = [
          'utm_source',
          'utm_medium',
          'utm_campaign',
          'utm_term',
          'utm_content',
          'fbclid',
          'gclid',
          'msclkid',
          'previewTheme',
          '_ga',
          '_gl',
        ];
        trackingParams.forEach((param) => parsedUrl.searchParams.delete(param));
        canonicalUrl = parsedUrl.toString();
      } catch {
        canonicalUrl = `${window.location.origin}${window.location.pathname}`;
      }
    }
    setLinkTag('canonical', canonicalUrl);

    // PAGE-1.2: Cleanup on unmount — restore previous title and meta/link tags
    return () => {
      document.title = originalTitle;

      const currentRobotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (currentRobotsEl) {
        if (hadRobots && prevRobots !== null) {
          currentRobotsEl.setAttribute('content', prevRobots);
        } else {
          currentRobotsEl.remove();
        }
      }

      const currentDescEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (currentDescEl) {
        if (hadDesc && prevDesc !== null) {
          currentDescEl.setAttribute('content', prevDesc);
        } else {
          currentDescEl.remove();
        }
      }

      const currentCanonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (currentCanonicalEl) {
        if (hadCanonical && prevCanonical !== null) {
          currentCanonicalEl.setAttribute('href', prevCanonical);
        } else {
          currentCanonicalEl.remove();
        }
      }

      const currentOgTitleEl = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (currentOgTitleEl) {
        if (hadOgTitle && prevOgTitle !== null) {
          currentOgTitleEl.setAttribute('content', prevOgTitle);
        } else {
          currentOgTitleEl.remove();
        }
      }

      const currentOgDescEl = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (currentOgDescEl) {
        if (hadOgDesc && prevOgDesc !== null) {
          currentOgDescEl.setAttribute('content', prevOgDesc);
        } else {
          currentOgDescEl.remove();
        }
      }

      const currentOgImageEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (currentOgImageEl) {
        if (hadOgImage && prevOgImage !== null) {
          currentOgImageEl.setAttribute('content', prevOgImage);
        } else {
          currentOgImageEl.remove();
        }
      }
    };
  }, [theme, location, storefrontSettings]);

  return null;
};