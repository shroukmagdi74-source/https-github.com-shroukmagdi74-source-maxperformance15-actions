import React from 'react';
import type ProductCard from '../../components/ProductCard';
import { resolveSectionVariant } from '../../variants';
import {
  type CardImagePriorityMode,
  type ProductCardVariant,
  type ProductGridVariant,
  PRODUCT_GRID_SECTION_FAMILY,
} from './gridTypes';

export const isShopIndexRoute = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '').endsWith('/shop');

export const isSaleIndexRoute = (pathname: string): boolean =>
  pathname.replace(/\/+$/, '').endsWith('/sale');

export const normalizeGridVariant = (
  rawVariant: unknown,
  fallback: ProductGridVariant = 'standard',
): ProductGridVariant => {
  const value = String(rawVariant || '').trim().toLowerCase();

  if (!value) {
    return fallback;
  }

  return resolveSectionVariant<ProductGridVariant>(
    PRODUCT_GRID_SECTION_FAMILY,
    value,
    fallback,
  );
};

export const resolveDefaultGridClass = (variant: ProductGridVariant): string => {
  if (variant === 'compact') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5';
  }

  if (variant === 'curated-rack') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'fit-catalog') {
    return 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'deal-edit') {
    return 'grid grid-cols-2 gap-3 lg:grid-cols-4';
  }

  if (variant === 'perfume-cabinet') {
    return 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'perfume-shelf') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'minimal-card') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-8';
  }

  if (variant === 'boutique-shelf') {
    return 'grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'retail-air-grid') {
    return 'grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4';
  }

  if (variant === 'retail-direct-grid') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'quick-view-fashion-grid') {
    return 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'fastly-offer-wall') {
    return 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5';
  }

  if (variant === 'spec-rack') {
    return 'grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4';
  }

  if (variant === 'elessi-bag-grid' || variant === 'elessi-bag-shop-grid') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'elessi-spotlight-grid') {
    return 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'elessi-listing-grid') {
    return 'grid grid-cols-1 gap-5 xl:grid-cols-2';
  }

  if (variant === 'elessi-compact-shelf') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'elessi-editorial-stack') {
    return 'grid grid-cols-1 gap-6 xl:grid-cols-2';
  }

  if (variant === 'elessi-organic-market-grid') {
    return 'grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'butcher-cut-grid') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'butcher-atelier-grid') {
    return 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'elessi-organic-shop-grid') {
    return 'grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'elessi-digital-launch-grid') {
    return 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'elessi-digital-catalog-grid') {
    return 'grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'elessi-plant-favorites' || variant === 'elessi-plant-nursery-grid') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'elessi-bike-grid' || variant === 'elessi-bike-shop-grid') {
    return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  }

  if (variant === 'luxury-card') {
    return 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3';
  }

  if (variant === 'editorial-card') {
    return 'grid grid-cols-1 gap-6 xl:grid-cols-2';
  }

  if (variant === 'glass-card') {
    return 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4';
  }

  if (variant === 'list-card') {
    return 'grid grid-cols-1 gap-5';
  }

  if (variant === 'legacy-compact-listing') {
    return 'grid grid-cols-1 gap-4 xl:grid-cols-2';
  }

  if (variant === 'playful-toybox') {
    return 'grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4 [&>*:nth-child(even)]:translate-y-8 pb-12';
  }

  return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
};

export const resolveCardVariant = (
  variant: ProductGridVariant,
  studioVariant?: string,
): ProductCardVariant => {
  if (variant === 'overlay-card') return 'overlay';
  if (variant === 'minimal-card') return 'minimal';
  if (variant === 'boutique-shelf') return 'boutique-air';
  if (variant === 'boutique-rail') return 'editorial-bare';
  if (variant === 'retail-air-grid') return 'retail-air';
  if (variant === 'retail-direct-grid') return 'retail-direct';
  if (variant === 'quick-view-fashion-grid') return 'pastel-fashion';
  if (variant === 'fastly-offer-wall') return 'fastly-offer';
  if (variant === 'spec-rack') return 'retail-air';
  if (variant === 'elessi-bag-grid' || variant === 'elessi-bag-shop-grid') return 'carry-frame';
  if (variant === 'elessi-spotlight-grid') return 'luxury';
  if (variant === 'elessi-listing-grid') return 'list';
  if (variant === 'elessi-compact-shelf') return 'compact';
  if (variant === 'elessi-editorial-stack') return 'editorial';
  if (variant === 'butcher-cut-grid') return 'harvest-crate';
  if (variant === 'butcher-atelier-grid') return 'butcher-black-label';
  if (variant === 'elessi-organic-market-grid' || variant === 'elessi-organic-shop-grid') return 'harvest-crate';
  if (variant === 'elessi-digital-launch-grid' || variant === 'elessi-digital-catalog-grid') return 'signal-rack';
  if (variant === 'elessi-plant-favorites' || variant === 'elessi-plant-nursery-grid') return 'plant-bare';
  if (variant === 'elessi-bike-grid' || variant === 'elessi-bike-shop-grid') return 'pedal-frame';
  if (variant === 'compact') return 'compact';
  if (variant === 'curated-rack') return 'overlay';
  if (variant === 'fit-catalog') return 'compact';
  if (variant === 'deal-edit') return 'overlay';
  if (variant === 'perfume-cabinet') return 'luxury';
  if (variant === 'perfume-shelf') return 'luxury';
  if (variant === 'luxury-card') return 'luxury';
  if (variant === 'editorial-card') return 'editorial';
  if (variant === 'glass-card') return 'glass';
  if (variant === 'list-card') return 'list';
  if (variant === 'legacy-compact-listing') return 'list';
  if (variant === 'playful-toybox') return 'playful';

  const normalizedStudioVariant = String(studioVariant || '').trim().toLowerCase();
  if (normalizedStudioVariant === 'vogue') {
    return 'overlay';
  }
  if (normalizedStudioVariant === 'minimal') {
    return 'minimal';
  }
  if (normalizedStudioVariant === 'creative') {
    return 'compact';
  }
  if (normalizedStudioVariant === 'brutal') {
    return 'luxury';
  }
  if (normalizedStudioVariant === 'fashion') {
    return 'editorial';
  }
  if (normalizedStudioVariant === 'glass') {
    return 'glass';
  }
  if (normalizedStudioVariant === 'list') {
    return 'list';
  }

  return 'standard';
};

export const resolveCardImageLoading = (
  index: number,
  mode: CardImagePriorityMode = 'default',
): React.ComponentProps<typeof ProductCard>['imageLoading'] =>
  mode === 'mobile-first' ? (index < 2 ? 'eager' : 'lazy') : index < 4 ? 'eager' : 'lazy';

export const resolveCardImageFetchPriority = (
  index: number,
  mode: CardImagePriorityMode = 'default',
): React.ComponentProps<typeof ProductCard>['imageFetchPriority'] =>
  mode === 'mobile-first'
    ? index === 0
      ? 'high'
      : index === 1
        ? 'auto'
        : 'low'
    : index < 2
      ? 'high'
      : index < 4
        ? 'auto'
        : 'low';

export const getVisiblePageNumbers = (current: number, total: number) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
};

export interface GridBackgroundParams {
  isBiteRush?: boolean;
  isAnyElessiBagGrid?: boolean;
  isButcherCutGrid?: boolean;
  isAnyElessiOrganicGrid?: boolean;
  isElessiPlantFavorites?: boolean;
  isElessiPlantNurseryGrid?: boolean;
  isElessiGrid?: boolean;
  variant?: string;
  isVelaQuickViewFashionGrid?: boolean;
  isDistrictMarket?: boolean;
  isNovaMobile?: boolean;
}

export const resolveProductGridSectionBackground = (params: GridBackgroundParams): string => {
  const {
    isBiteRush,
    isAnyElessiBagGrid,
    isButcherCutGrid,
    isAnyElessiOrganicGrid,
    isElessiPlantFavorites,
    isElessiPlantNurseryGrid,
    isElessiGrid,
    variant,
    isVelaQuickViewFashionGrid,
    isDistrictMarket,
    isNovaMobile,
  } = params;

  if (isBiteRush) {
    return 'bg-[linear-gradient(180deg,#fff8f3_0%,#fff4ec_52%,#fffdfb_100%)]';
  }
  if (isAnyElessiBagGrid) {
    return 'bg-[linear-gradient(180deg,#fffcf8_0%,#f7efe7_26%,#fffaf4_54%,#fffdf9_100%)]';
  }
  if (isButcherCutGrid) {
    return 'bg-[linear-gradient(180deg,#fffaf4_0%,#f3eadf_26%,#fff8f2_58%,#fffdf9_100%)]';
  }
  if (isAnyElessiOrganicGrid) {
    return 'bg-[linear-gradient(180deg,#fffdf9_0%,#f6efe4_24%,#fbf7f0_56%,#fffdf9_100%)]';
  }
  if (isElessiPlantFavorites || isElessiPlantNurseryGrid) {
    return 'bg-[linear-gradient(180deg,#faf9f3_0%,#eef5ea_32%,#fbfaf5_72%,#ffffff_100%)]';
  }
  if (isElessiGrid) {
    return 'bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe5_24%,#fffaf4_52%,#fffdf9_100%)]';
  }
  if (variant === 'perfume-cabinet') {
    return 'bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe6_32%,#fffdf9_100%)]';
  }
  if (variant === 'perfume-shelf') {
    return 'bg-[linear-gradient(180deg,#fffdf9_0%,#faf2ea_24%,#fffdf9_100%)]';
  }
  if (variant === 'curated-rack') {
    return 'bg-[linear-gradient(180deg,#fffdfb_0%,#fff7f3_22%,#fffdfb_100%)]';
  }
  if (variant === 'boutique-rail') {
    return 'bg-[linear-gradient(180deg,#fcf7f1_0%,#f6efe8_26%,#fdfaf6_100%)]';
  }
  if (variant === 'fit-catalog') {
    return 'bg-[linear-gradient(180deg,#fffdfb_0%,#fff8f4_18%,#fffdfb_100%)]';
  }
  if (variant === 'quick-view-fashion-grid') {
    return isVelaQuickViewFashionGrid
      ? 'bg-[#fcf8f6]'
      : 'bg-[linear-gradient(180deg,#fffdfb_0%,#fff6f1_22%,#fffdfb_100%)]';
  }
  if (variant === 'deal-edit') {
    return 'bg-[linear-gradient(180deg,#fffaf7_0%,#fff1ea_24%,#fffdfb_100%)]';
  }
  if (variant === 'spec-rack') {
    return 'bg-[linear-gradient(180deg,#fffdf8_0%,#f7f0dd_20%,#f8fafc_100%)]';
  }
  if (variant === 'retail-air-grid') {
    return 'bg-[#f4f6f8]';
  }
  if (isDistrictMarket) {
    return 'bg-[linear-gradient(180deg,#fffdfb_0%,#fff6ef_26%,#fffdfb_100%)]';
  }
  if (isNovaMobile) {
    return 'bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.05),transparent_40%),hsl(var(--background))]';
  }
  return 'bg-background';
};

