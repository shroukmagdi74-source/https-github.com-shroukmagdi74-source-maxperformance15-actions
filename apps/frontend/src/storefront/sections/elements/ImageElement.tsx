import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

export interface ImageElementWebpVariants {
  480?: string;
  960?: string;
  1440?: string;
  [key: number]: string | undefined;
  [key: string]: string | undefined;
}

export interface ImageElementSettings {
  src?: string;
  alt?: string;
  href?: string;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full' | 'store' | string | number;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1' | '3:4' | string;
  fit?: 'cover' | 'contain' | 'auto' | 'fill' | string;
  className?: string;
  webp?: ImageElementWebpVariants;
  srcSet?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

export interface ImageElementProps {
  section?: {
    type?: string;
    variant?: string;
    settings?: ImageElementSettings;
    [key: string]: any;
  };
  settings?: ImageElementSettings;
}

const resolveBorderRadius = (radius: unknown): string => {
  if (typeof radius === 'number') {
    return `${radius}px`;
  }
  const r = String(radius || 'store').trim().toLowerCase();
  switch (r) {
    case 'none':
    case '0':
      return '0px';
    case 'sm':
      return '4px';
    case 'md':
      return '8px';
    case 'lg':
      return '16px';
    case 'full':
      return '9999px';
    case 'store':
    default:
      return 'var(--store-radius, 8px)';
  }
};

export const buildImageSrcSet = (webp?: ImageElementWebpVariants): string | undefined => {
  if (!webp || typeof webp !== 'object') return undefined;

  const parts: string[] = [];
  const standardWidths = [480, 960, 1440];

  for (const w of standardWidths) {
    const url = webp[w] || webp[String(w)];
    if (url && typeof url === 'string') {
      parts.push(`${url} ${w}w`);
    }
  }

  // Also include any custom widths if present
  Object.keys(webp).forEach((k) => {
    const num = Number.parseInt(k, 10);
    if (!Number.isNaN(num) && !standardWidths.includes(num)) {
      const url = webp[k];
      if (url && typeof url === 'string') {
        parts.push(`${url} ${num}w`);
      }
    }
  });

  return parts.length > 0 ? parts.join(', ') : undefined;
};

const ImageElement: React.FC<ImageElementProps> = ({ section, settings: directSettings }) => {
  const mergedSettings = { ...section?.settings, ...directSettings };
  const src = mergedSettings?.src?.trim();
  const alt = mergedSettings?.alt?.trim() || 'صورة المتجر';
  const href = mergedSettings?.href?.trim();
  const radius = mergedSettings?.radius;
  const rawRatio = String(mergedSettings?.aspectRatio || 'auto').trim().toLowerCase();
  const rawFit = String(mergedSettings?.fit || 'cover').trim().toLowerCase();
  const customClass = mergedSettings?.className || '';

  const computedSrcSet = mergedSettings?.srcSet || buildImageSrcSet(mergedSettings?.webp);
  const sizes =
    mergedSettings?.sizes ||
    (computedSrcSet
      ? '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px'
      : undefined);

  const loading = mergedSettings?.loading || 'lazy';
  const decoding = mergedSettings?.decoding || 'async';
  const width = mergedSettings?.width;
  const height = mergedSettings?.height;

  const borderRadius = resolveBorderRadius(radius);

  // Aspect ratio classes
  let aspectClass = '';
  if (rawRatio === '16:9') {
    aspectClass = 'aspect-[16/9]';
  } else if (rawRatio === '4:3') {
    aspectClass = 'aspect-[4/3]';
  } else if (rawRatio === '1:1') {
    aspectClass = 'aspect-square';
  } else if (rawRatio === '3:4') {
    aspectClass = 'aspect-[3/4]';
  }

  // Object fit classes
  let fitClass = 'object-cover';
  if (rawFit === 'contain') {
    fitClass = 'object-contain';
  } else if (rawFit === 'fill') {
    fitClass = 'object-fill';
  }

  const renderContent = () => {
    if (!src) {
      return (
        <div
          data-storefront-element="image-placeholder"
          className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 border border-dashed border-border/70 bg-muted/30 p-6 text-muted-foreground transition-colors hover:bg-muted/40"
          style={{ borderRadius }}
        >
          <PhotoIcon className="h-8 w-8 opacity-50" aria-hidden="true" />
          <span className="text-xs font-medium">اختر صورة لعرضها</span>
        </div>
      );
    }

    return (
      <img
        src={src}
        srcSet={computedSrcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding={decoding}
        width={width}
        height={height}
        className={`w-full h-auto max-w-full ${fitClass} ${aspectClass} transition-opacity duration-200`}
        style={{ borderRadius }}
      />
    );
  };

  const content = renderContent();

  if (href) {
    return (
      <a
        href={href}
        data-storefront-element="image"
        data-element="image"
        className={`storefront-image-element group block w-full overflow-hidden transition-transform duration-150 hover:opacity-95 ${customClass}`.trim()}
        style={{ borderRadius }}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      data-storefront-element="image"
      data-element="image"
      className={`storefront-image-element block w-full overflow-hidden ${customClass}`.trim()}
      style={{ borderRadius }}
    >
      {content}
    </div>
  );
};

export default ImageElement;
