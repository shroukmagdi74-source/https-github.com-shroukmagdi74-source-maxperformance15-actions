import React, { useMemo } from 'react';
import { buildOptimizedStorefrontImageUrl } from '../../../utils/productImages';

const IMG_TAG_REGEX = /<img\b([^>]*?)(\/?)>/gi;
const SRC_ATTR_REGEX = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

export const optimizeDescriptionHtmlImages = (html: string): string => {
  if (!html || !/<img\b/i.test(html)) {
    return html;
  }

  return html.replace(IMG_TAG_REGEX, (fullMatch, rawAttrs: string, selfClose: string) => {
    let nextAttrs = rawAttrs || '';
    const srcMatch = nextAttrs.match(SRC_ATTR_REGEX);

    if (srcMatch) {
      const rawSrc = (srcMatch[1] ?? srcMatch[2] ?? srcMatch[3] ?? '').trim();
      if (rawSrc) {
        const decodedSrc = rawSrc.replace(/&amp;/gi, '&');
        if (/\/uploads\//i.test(decodedSrc)) {
          const optimizedSrc = buildOptimizedStorefrontImageUrl(decodedSrc, {
            width: 720,
            quality: 78,
          });
          if (optimizedSrc && optimizedSrc !== decodedSrc) {
            nextAttrs = nextAttrs.replace(
              SRC_ATTR_REGEX,
              `src="${optimizedSrc.replace(/"/g, '&quot;')}"`,
            );
          }
        }
      }
    }

    if (!/\bloading\s*=/i.test(nextAttrs)) {
      nextAttrs += ' loading="lazy"';
    }
    if (!/\bdecoding\s*=/i.test(nextAttrs)) {
      nextAttrs += ' decoding="async"';
    }

    const closingSlash = selfClose ? ' /' : '';
    return `<img${nextAttrs}${closingSlash}>`;
  });
};

export const ProductDescription = ({
  safeDescription,
  emptyText = 'لا يوجد وصف متاح لهذا المنتج حالياً.',
}: {
  safeDescription: string;
  emptyText?: string;
}) => {
  const optimizedHtml = useMemo(
    () => (safeDescription ? optimizeDescriptionHtmlImages(safeDescription) : ''),
    [safeDescription],
  );

  return optimizedHtml ? (
    <div
      className="product-rich-description w-full max-w-none text-base leading-relaxed text-foreground/90 prose prose-base dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: optimizedHtml }}
    />
  ) : (
    <p className="text-base leading-relaxed text-muted-foreground/90">
      {emptyText}
    </p>
  );
};

ProductDescription.displayName = 'ProductDescription';
export default ProductDescription;
