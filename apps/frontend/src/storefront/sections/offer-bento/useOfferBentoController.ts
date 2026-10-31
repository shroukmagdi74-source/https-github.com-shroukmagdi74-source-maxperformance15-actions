import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { buildVersionedStorefrontStaticAssetUrl } from '../../utils/productImages';
import {
  normalizeOfferBentoVariant,
  parseCards,
  resolveRedlineCardImage,
  type OfferBentoProps,
} from './types';

export const useOfferBentoController = ({ section, settings }: OfferBentoProps) => {
  const location = useLocation();
  const { theme } = useStorefrontTheme();
  const variant = normalizeOfferBentoVariant(section?.variant);
  const isBiteRush = theme.id === 'restaurant-demo';
  const isDistrictMarket = theme.id === 'district-market';

  const badge =
    settings?.badge ||
    (variant === 'campaign-stack'
      ? 'حملة هذا الأسبوع'
      : variant === 'daily-picks'
        ? 'اختيارات اليوم'
        : variant === 'combo-deals'
          ? 'Combo Deals'
          : variant === 'bundle-matrix'
            ? 'باقات جاهزة'
            : variant === 'boutique-duo'
              ? ''
            : 'عروض هذا الأسبوع');

  const title =
    typeof settings?.title === 'string'
      ? settings?.title
      : variant === 'boutique-duo'
        ? ''
        : 'اختيارات سريعة قبل أن تنفد الكمية';

  const subtitle =
    typeof settings?.subtitle === 'string'
      ? settings?.subtitle
      : variant === 'boutique-duo'
        ? ''
        : 'ركن مرتب للعروض الأكثر جاذبية مع سعر أوضح ورسائل ثقة جاهزة تساعد العميل على الحسم.';

  const hideSubtitle = settings?.hideSubtitle === true;

  const cards = useMemo(() => parseCards(settings?.cards), [settings?.cards])
    .slice(0, variant === 'vela-fashion-mosaic' ? 5 : variant === 'boutique-duo' ? 2 : 3)
    .map((card, index) => {
      const resolvedImg =
        card.image ||
        (theme.id === 'redline-auto' ? resolveRedlineCardImage(card, index) : undefined);
      return {
        ...card,
        image: resolvedImg ? buildVersionedStorefrontStaticAssetUrl(resolvedImg) : undefined,
      };
    });

  const isVelaFashionMosaic = variant === 'vela-fashion-mosaic';

  return {
    location,
    theme,
    variant,
    isBiteRush,
    isDistrictMarket,
    badge,
    title,
    subtitle,
    hideSubtitle,
    cards,
    isVelaFashionMosaic,
  };
};

export type OfferBentoController = ReturnType<typeof useOfferBentoController>;
