import React, { useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useStorefrontTheme } from "../engine/ThemeProvider";
import { PageComposer } from "../engine/PageComposer";
import { useStorefrontSettings } from "../hooks/useStorefrontSettings";
import { useStorePage } from "../../hooks/useStorePage";
import StorefrontNotFound from "../components/StorefrontNotFound";
import { createStorefrontThemeTextReplacer } from "../utils/runtimeBrandText";
import { resolveStorefrontPageLayout, StorefrontSectionFrame } from "../layout/StorefrontSectionFrame";
import { sanitizeStorefrontHtml } from "../utils/html";
import { getStorefrontLocale, getLocaleDirection, localizePageConfig } from "../i18n";

const DynamicStorefrontPage: React.FC = () => {
  const { theme } = useStorefrontTheme();
  const { settings, isLoading: settingsLoading } = useStorefrontSettings();
  const { pageSlug, "*": pageSplat } = useParams<{
    pageSlug: string;
    "*": string;
  }>();
  const location = useLocation();
  const locale = getStorefrontLocale(location.search);
  const direction = getLocaleDirection(locale);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = direction;
      document.documentElement.lang = locale;
    }
  }, [direction, locale]);

  const runtimeText = useMemo(
    () =>
      createStorefrontThemeTextReplacer({
        theme,
        settings,
        isThemePreview: new URLSearchParams(location.search).has("previewTheme"),
      }),
    [location.search, settings, theme],
  );
  const resolvedPageKey = [pageSlug, pageSplat].filter(Boolean).join("/");
  const pageConfig = resolvedPageKey
    ? theme.pages[resolvedPageKey] || (pageSlug ? theme.pages[pageSlug] : undefined)
    : undefined;

  const localizedPageConfig = useMemo(() => {
    if (!pageConfig) return undefined;
    return localizePageConfig(pageConfig, locale);
  }, [pageConfig, locale]);

  const hasSections = Boolean(
    localizedPageConfig && Array.isArray(localizedPageConfig.sections) && localizedPageConfig.sections.length > 0
  );

  // If page exists in designTokens/theme with sections, render via PageComposer directly.
  // Otherwise fall back to DB page content (rich-text).
  const shouldFetchDbPage = !hasSections && resolvedPageKey !== "home" && resolvedPageKey !== "shop";
  const { page: dbPage, loading: dbLoading } = useStorePage(
    shouldFetchDbPage ? pageSlug : undefined,
    shouldFetchDbPage ? settings?.company?.id : undefined,
  );

  // Sync dynamic page metadata with browser head (including PAGE-1 SEO)
  useEffect(() => {
    const rawStoreName =
      settings?.storefront?.settings?.["storeName"] ||
      (settings?.storefront as Record<string, any> | undefined)?.["name"] ||
      theme.header?.brandName ||
      theme.name ||
      "";
    const storeName = typeof rawStoreName === "string" ? rawStoreName : "";
    const currentSeo = (localizedPageConfig as any)?.seo || (pageConfig as any)?.seo;

    // 1. Title
    if (currentSeo?.title?.trim()) {
      const customTitle = currentSeo.title.trim();
      document.title =
        storeName && !customTitle.includes(storeName)
          ? `${customTitle} | ${storeName}`
          : customTitle;
    } else if (hasSections && localizedPageConfig) {
      const pageTitle =
        (localizedPageConfig as any).title?.trim() ||
        (localizedPageConfig as any).label?.trim() ||
        pageSlug ||
        "";
      document.title = pageTitle ? `${pageTitle} | ${storeName}` : storeName;
    } else if (dbPage) {
      const pageTitle =
        dbPage.metaTitle?.trim() ||
        (dbPage.title ? `${dbPage.title} | ${storeName}` : storeName);
      document.title = pageTitle;
    }

    // 2. Meta Description
    const metaDesc =
      currentSeo?.description?.trim() ||
      dbPage?.metaDescription?.trim() ||
      dbPage?.content?.replace(/<[^>]*>/g, "").slice(0, 160).trim();
    if (metaDesc) {
      let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!descEl) {
        descEl = document.createElement("meta");
        descEl.setAttribute("name", "description");
        document.head.appendChild(descEl);
      }
      descEl.setAttribute("content", metaDesc);
    }

    // 3. OG Image
    if (currentSeo?.ogImage?.trim()) {
      let ogEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (!ogEl) {
        ogEl = document.createElement("meta");
        ogEl.setAttribute("property", "og:image");
        document.head.appendChild(ogEl);
      }
      ogEl.setAttribute("content", currentSeo.ogImage.trim());
    }

    // 4. Canonical
    if (currentSeo?.canonical?.trim()) {
      let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", currentSeo.canonical.trim());
    }

    // 5. Noindex
    let robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (currentSeo?.noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta");
        robotsEl.setAttribute("name", "robots");
        document.head.appendChild(robotsEl);
      }
      robotsEl.setAttribute("content", "noindex");
    } else if (robotsEl && robotsEl.getAttribute("content") === "noindex") {
      robotsEl.remove();
    }
  }, [dbPage, settings, theme, hasSections, localizedPageConfig, pageConfig, pageSlug]);

  const isDraft =
    (localizedPageConfig as any)?.status === "draft" ||
    (pageConfig as any)?.status === "draft";

  const draftPreviewBadge = isDraft ? (
    <div
      data-testid="draft-preview-badge"
      className="w-full bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-xs"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span>معاينة — مسودة غير منشورة</span>
    </div>
  ) : null;

  if (hasSections && localizedPageConfig) {
    return (
      <div dir={direction} data-storefront-locale={locale} className="w-full">
        {draftPreviewBadge}
        <PageComposer
          pageConfig={localizedPageConfig}
          layout={resolveStorefrontPageLayout(localizedPageConfig)}
          runtimeText={runtimeText}
          renderSectionFrame={StorefrontSectionFrame}
        />
      </div>
    );
  }

  if (shouldFetchDbPage && (settingsLoading || dbLoading)) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (shouldFetchDbPage && dbPage) {
    return (
      <div className="custom-store-page container max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-8 text-start" dir={direction} data-storefront-locale={locale}>
        {draftPreviewBadge}
        <div className="border-b border-muted pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
            {dbPage.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {direction === "rtl" ? "آخر تحديث" : "Last updated"}:{" "}
            {new Date(dbPage.updatedAt).toLocaleDateString(direction === "rtl" ? "ar-EG" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div 
          className="prose dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: sanitizeStorefrontHtml(dbPage.content) }}
        />
      </div>
    );
  }

  if (!resolvedPageKey || (!localizedPageConfig && !dbPage)) {
    return <StorefrontNotFound />;
  }

  return (
    <div dir={direction} data-storefront-locale={locale} className="w-full">
      {draftPreviewBadge}
      <PageComposer
        pageConfig={localizedPageConfig || pageConfig!}
        layout={resolveStorefrontPageLayout(localizedPageConfig || pageConfig!)}
        runtimeText={runtimeText}
        renderSectionFrame={StorefrontSectionFrame}
      />
    </div>
  );
};

export default DynamicStorefrontPage;
