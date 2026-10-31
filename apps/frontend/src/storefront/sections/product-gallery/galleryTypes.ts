import React from 'react';

export interface ProductGalleryProps {
  section?: {
    variant?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type ProductGalleryVariant =
  | 'standard'
  | 'grid'
  | 'stacked'
  | 'masonry'
  | 'neon-showcase'
  | 'mirror-carousel'
  | 'fashion-counter-stage'
  | 'atelier-editorial-stage'
  | 'boutique-portrait-stage'
  | 'command-stage'
  | 'elessi-bag-gallery'
  | 'elessi-showroom'
  | 'elessi-organic-gallery'
  | 'elessi-mosaic-stage'
  | 'elessi-detail-column'
  | 'elessi-digital-gallery'
  | 'elessi-plant-gallery'
  | 'elessi-bike-gallery';

export interface OptimizedGalleryImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  source?: string | null;
  mode?: 'hero' | 'detail' | 'thumb';
  responsiveSizes?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
  productName?: string;
  categoryLabel?: string;
  fallbackVariant?: 'default' | 'cyber';
  prefersArabicCopy?: boolean;
  fitMode?: 'cover' | 'contain';
}

export interface GallerySwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export interface GalleryBaseVariantProps {
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  swipeHandlers?: GallerySwipeHandlers;
  prefersArabicCopy?: boolean;
}

export interface GalleryZoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  product?: any;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  prefersArabicCopy?: boolean;
}
