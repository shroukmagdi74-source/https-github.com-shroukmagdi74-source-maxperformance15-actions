import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefrontTheme } from '../../../engine/ThemeProvider';
import { buildStorefrontPath, getStorefrontProductRouteKey } from '../../../utils/paths';
import { useStorefrontSettings } from '../../../hooks/useStorefrontSettings';
import { shouldStorefrontForceDocumentNavigation } from '../../../utils/navigationGuards';
import { footerSettingsService, type FooterSettings } from '../../../../services/footerSettingsService';
import type { StorefrontGlobalFooterConfig } from '../../../studio/StudioHeaderFooterPanel';
import type { StorefrontFooterProps, FooterContactRow, FooterLinkGroup } from './footerTypes';

export function normalizeSocialLinks(
  value: unknown,
  allowedKeys?: string[],
): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const allowed = allowedKeys?.length
    ? new Set(allowedKeys.map((key) => key.toLowerCase()))
    : null;

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (links, [key, url]) => {
      if (typeof url === 'string' && url.trim()) {
        if (allowed && !allowed.has(key.trim().toLowerCase())) {
          return links;
        }
        links[key] = url.trim();
      }
      return links;
    },
    {},
  );
}

export const useStorefrontFooterController = ({
  isMinimal,
  globalFooter: propGlobalFooter,
}: StorefrontFooterProps) => {
  const { theme } = useStorefrontTheme();
  const { settings } = useStorefrontSettings();
  const location = useLocation();

  const effectiveGlobalFooter = useMemo<StorefrontGlobalFooterConfig | undefined>(() => {
    if (propGlobalFooter) return propGlobalFooter;
    const fromTheme =
      (theme as any)?.global?.footer ||
      (theme as any)?.designTokens?.global?.footer;
    const fromSettings =
      (settings?.storefront?.designTokens as any)?.global?.footer ||
      (settings?.designTokens as any)?.global?.footer ||
      (settings?.storefront?.settings?.['designTokens'] as any)?.global?.footer;
    return fromTheme || fromSettings;
  }, [propGlobalFooter, theme, settings]);

  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    const companyId = settings?.company?.id;
    if (!companyId) return;

    let isMounted = true;
    const fetchFooter = () => {
      footerSettingsService
        .getPublicSettings(companyId)
        .then((res) => {
          if (isMounted && res?.success && res?.data) {
            setFooterSettings(res.data as FooterSettings);
          }
        })
        .catch(() => {
          // Ignore errors, theme.footer will be used as fallback
        });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(fetchFooter, { timeout: 2500 });
      return () => {
        isMounted = false;
        if ('cancelIdleCallback' in window) {
          (window as any).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(fetchFooter, 1000);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [settings?.company?.id]);

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const shouldForceDocumentNavigation = shouldStorefrontForceDocumentNavigation(
    theme.id,
    Boolean(getStorefrontProductRouteKey(normalizedPath)),
  );
  const isHomePath = normalizedPath === '/' || normalizedPath.endsWith('/store');
  const isAtelierNova = theme.id === 'atelier-nova';
  const isCartPath = normalizedPath.endsWith('/cart');
  const isCheckoutPath = normalizedPath.endsWith('/checkout');
  const isThankYouPath = normalizedPath.endsWith('/thank-you');
  const isAtelierNovaCommercePath =
    isAtelierNova && (isCartPath || isCheckoutPath || isThankYouPath);
  const isSoleaFemme = theme.id === 'solea-femme';
  const isIntruderNft = theme.id === 'intruder-nft';
  const isMenShoes = theme.id === 'men-shoes-eg';
  const isPcHub = theme.id === 'pc-hub-eg';
  const isMensGroomingPro = theme.id === 'mens-grooming-pro';
  const footerVariant = theme.footer?.variant?.trim().toLowerCase() || 'default';

  const isEditorialSoftFooter = footerVariant === 'editorial-soft';
  const isUtilityFrameFooter = footerVariant === 'utility-frame';
  const isSignaturePanelFooter = footerVariant === 'signature-panel';
  const isDigitalCommandFooter = footerVariant === 'digital-command';
  const isFashionRetailFooter = footerVariant === 'fashion-retail';
  const isButcherAtelierFooter = footerVariant === 'butcher-atelier';
  const isLegacyDefaultOldFooter = footerVariant === 'legacy-default-old';
  const isVelaFashionFooter = footerVariant === 'vela-fashion';
  const isAutomotiveChassis = theme.id === 'redline-auto' || footerVariant === 'automotive-chassis';
  const isThemePreview = new URLSearchParams(location.search).has('previewTheme');
  const isFastlyTheme = theme.id === 'fastly-eg';
  const homePath = buildStorefrontPath(location.pathname, '/', location.search);
  const shopPath = buildStorefrontPath(location.pathname, '/shop', location.search);
  const displayStoreName =
    (isThemePreview && theme.header?.brandName) ||
    settings?.storefront?.settings?.storeName ||
    theme.header?.brandName ||
    settings?.company?.name ||
    theme.name;
  const runtimeStoreName =
    settings?.storefront?.settings?.storeName ||
    settings?.company?.name ||
    '';
  const themeBrandNames = [theme.header?.brandName, theme.name].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const isAppliedRuntimeStorefront =
    !isThemePreview &&
    Boolean(runtimeStoreName) &&
    themeBrandNames.some((brandName) => brandName.trim() !== runtimeStoreName.trim());

  const replaceThemeBrandText = (value?: string | null): string => {
    if (!value) {
      return '';
    }

    return themeBrandNames.reduce((text, brandName) => {
      const trimmedBrandName = brandName.trim();
      if (!trimmedBrandName || trimmedBrandName === displayStoreName) {
        return text;
      }

      const escapedBrandName = trimmedBrandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(new RegExp(escapedBrandName, 'g'), displayStoreName);
    }, value);
  };

  const mergedFooterDescription = footerSettings?.aboutStore
    ? replaceThemeBrandText(footerSettings.aboutStore)
    : replaceThemeBrandText(theme.footer?.description);

  const mergedFooterCopyright = footerSettings?.copyrightText
    ? replaceThemeBrandText(footerSettings.copyrightText.replace('{year}', new Date().getFullYear().toString()))
    : replaceThemeBrandText(theme.footer?.copyrightText);

  const mergedFooterContactRows = (() => {
    const rows: FooterContactRow[] = [];
    if (footerSettings?.phone && footerSettings.showPhone) {
      rows.push({
        label: theme.direction === 'rtl' ? 'الهاتف' : 'Phone',
        value: footerSettings.phone,
        href: `tel:${footerSettings.phone}`,
      });
    }
    if (footerSettings?.email && footerSettings.showEmail) {
      rows.push({
        label: theme.direction === 'rtl' ? 'البريد الإلكتروني' : 'Email',
        value: footerSettings.email,
        href: `mailto:${footerSettings.email}`,
      });
    }
    if (footerSettings?.address && footerSettings.showAddress) {
      rows.push({
        label: theme.direction === 'rtl' ? 'العنوان' : 'Address',
        value: footerSettings.address,
      });
    }
    if (rows.length === 0 && !isAppliedRuntimeStorefront && theme.footer?.contactRows) {
      return theme.footer.contactRows.filter(
        (row): row is FooterContactRow => Boolean(row?.label && row?.value),
      );
    }
    return rows;
  })();

  const mergedFooterSocialLinks = normalizeSocialLinks(
    footerSettings?.socialLinks || footerSettings,
    [
      'facebook', 'instagram', 'whatsapp', 'messenger', 'x', 'twitter',
      'youtube', 'tiktok', 'snapchat', 'linkedin', 'telegram', 'pinterest',
      'ticktok', 'snap', 'x.com', 'twitter.com', 'instagram.com',
      'facebook.com', 'whatsapp.com', 'wa.me', 'tiktok.com', 'youtube.com',
      'linkedin.com', 'telegram.com', 'pinterest.com',
    ],
  );

  const runtimeStorefrontSettings =
    settings?.storefront?.settings && typeof settings.storefront.settings === 'object'
      ? (settings.storefront.settings as Record<string, unknown>)
      : {};
  const runtimeDesignTokens =
    settings?.storefront?.designTokens && typeof settings.storefront.designTokens === 'object'
      ? (settings.storefront.designTokens as Record<string, unknown>)
      : {};

  const getRuntimeFooterValue = (...keys: string[]): string =>
    keys
      .map((key) => runtimeStorefrontSettings[key])
      .find((value): value is string => typeof value === 'string' && Boolean(value.trim()))
      ?.trim() || '';

  const runtimePhoneValue = getRuntimeFooterValue(
    'phone',
    'phoneNumber',
    'supportPhone',
    'whatsapp',
    'whatsappNumber',
  );
  const runtimeEmailValue = getRuntimeFooterValue(
    'email',
    'supportEmail',
    'contactEmail',
  );

  const runtimeFooterContactRows: FooterContactRow[] = [
    runtimePhoneValue
      ? {
          label: theme.direction === 'rtl' ? 'واتساب' : 'WhatsApp',
          value: runtimePhoneValue,
          href: runtimePhoneValue.replace(/\D/g, '')
            ? `https://wa.me/${runtimePhoneValue.replace(/\D/g, '')}`
            : undefined,
        }
      : null,
    runtimeEmailValue
      ? {
          label: theme.direction === 'rtl' ? 'البريد' : 'Email',
          value: runtimeEmailValue,
          href: `mailto:${runtimeEmailValue}`,
        }
      : null,
  ].filter((row): row is FooterContactRow => Boolean(row?.value));

  const footerCopyrightText =
    typeof effectiveGlobalFooter?.copyright === 'string' && effectiveGlobalFooter.copyright.trim()
      ? replaceThemeBrandText(
          effectiveGlobalFooter.copyright.replace('{year}', new Date().getFullYear().toString()),
        )
      : mergedFooterCopyright;

  const showPaymentBadges = effectiveGlobalFooter?.showPaymentBadges !== false;
  const footerDescriptionText = mergedFooterDescription;

  const globalCols = Array.isArray(effectiveGlobalFooter?.columns)
    ? effectiveGlobalFooter.columns
    : undefined;

  const footerLinksData: FooterLinkGroup[] =
    Array.isArray(globalCols) && globalCols.length > 0
      ? globalCols.slice(0, 4).map((col) => ({
          title: col.title,
          links: (col.links || []).map((link) => ({
            label: link.label,
            to: buildStorefrontPath(location.pathname, link.href, location.search),
          })),
        }))
      : theme.footer?.navigation?.map((group) => ({
          title: group.title,
          links: group.links.map((link) => ({
            label: link.label,
            to: buildStorefrontPath(location.pathname, link.to, location.search),
          })),
        })) || [
          {
            title: theme.direction === 'rtl' ? 'المتجر' : 'Shop',
            links: [
              {
                label: theme.direction === 'rtl' ? 'كل المنتجات' : 'All Products',
                to: shopPath,
              },
              {
                label: theme.direction === 'rtl' ? 'وصل حديثاً' : 'New Arrivals',
                to: shopPath,
              },
            ],
          },
          {
            title: theme.direction === 'rtl' ? 'الدعم' : 'Support',
            links: [
              {
                label: theme.direction === 'rtl' ? 'اتصل بنا' : 'Contact Us',
                to: homePath,
              },
              {
                label: theme.direction === 'rtl' ? 'الأسئلة الشائعة' : 'FAQs',
                to: homePath,
              },
            ],
          },
        ];

  const customSocialLinks = {
    ...normalizeSocialLinks(runtimeStorefrontSettings.socialLinks),
    ...normalizeSocialLinks(runtimeDesignTokens.socialLinks),
    ...mergedFooterSocialLinks,
  };
  const hasCustomSocialLinks = Object.values(customSocialLinks).some((url) => Boolean(url && url.trim()));

  const socialIcons = hasCustomSocialLinks
    ? customSocialLinks
    : isAppliedRuntimeStorefront
      ? {}
      : theme.footer?.socialLinks || {};

  const legalLinks =
    theme.footer?.legalLinks?.map((link) => ({
      label: link.label,
      to: buildStorefrontPath(location.pathname, link.to, location.search),
    })) || [];

  const themeFooterContactRows = Array.isArray(theme.footer?.contactRows)
    ? theme.footer.contactRows.filter(
        (row): row is FooterContactRow => Boolean(row?.label && row?.value),
      )
    : [];

  const footerContactRows = mergedFooterContactRows.length
    ? mergedFooterContactRows
    : runtimeFooterContactRows.length
      ? runtimeFooterContactRows
      : isAppliedRuntimeStorefront
        ? []
        : themeFooterContactRows;

  return {
    theme,
    settings,
    location,
    isMinimal,
    effectiveGlobalFooter,
    showPaymentBadges,
    displayStoreName,
    homePath,
    shopPath,
    footerDescriptionText,
    footerCopyrightText,
    footerLinksData,
    legalLinks,
    footerContactRows,
    socialIcons,
    isHomePath,
    isEditorialSoftFooter,
    isUtilityFrameFooter,
    isSignaturePanelFooter,
    isDigitalCommandFooter,
    isFashionRetailFooter,
    isButcherAtelierFooter,
    isLegacyDefaultOldFooter,
    isVelaFashionFooter,
    isAutomotiveChassis,
    isMensGroomingPro,
    isPcHub,
    isSoleaFemme,
    isIntruderNft,
    isMenShoes,
    isFastlyTheme,
    isAtelierNovaCommercePath,
    shouldForceDocumentNavigation,
  };
};

export type StorefrontFooterController = ReturnType<typeof useStorefrontFooterController>;

