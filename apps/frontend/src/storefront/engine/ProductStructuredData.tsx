import React, { useEffect } from 'react';

export interface ProductStructuredDataProps {
  product?: any;
  currency?: string;
  reviews?: any;
  storeName?: string;
  activeVariant?: any;
}

const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const resolveImages = (product: any): string[] => {
  if (!product) return [];
  const list: string[] = [];

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim()) {
        list.push(img.trim());
      } else if (img && typeof img === 'object') {
        const url = img.url || img.src || img.image;
        if (typeof url === 'string' && url.trim()) list.push(url.trim());
      }
    }
  } else if (typeof product.images === 'string' && product.images.trim()) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string' && item.trim()) list.push(item.trim());
          else if (item?.url) list.push(String(item.url).trim());
        }
      }
    } catch {
      list.push(product.images.trim());
    }
  }

  if (list.length === 0 && product.image && typeof product.image === 'string' && product.image.trim()) {
    list.push(product.image.trim());
  }

  return list;
};

export const buildProductJsonLd = ({
  product,
  currency = 'USD',
  reviews,
  storeName = '',
  activeVariant,
}: ProductStructuredDataProps): Record<string, any> => {
  if (!product) return {};

  let brandName = storeName;
  if (product.metadata) {
    if (typeof product.metadata === 'object' && product.metadata.brand) {
      brandName = String(product.metadata.brand).trim();
    } else if (typeof product.metadata === 'string') {
      try {
        const parsedMeta = JSON.parse(product.metadata);
        if (parsedMeta?.brand) brandName = String(parsedMeta.brand).trim();
      } catch {}
    }
  }
  if (!brandName && product.brand) {
    brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name || storeName;
  }

  const images = resolveImages(product);
  const description = stripHtml(product.description || product.metaDescription || product.name).slice(0, 5000);
  const sku = product.sku ? String(product.sku).trim() : undefined;

  const priceCandidate = activeVariant?.price ?? product.price;
  const priceNumber = Number(priceCandidate);
  const price = Number.isFinite(priceNumber) && priceNumber > 0 ? priceNumber : undefined;

  const isOutOfStock = Boolean(product.trackInventory && Number(product.stock) <= 0);
  const availability = isOutOfStock
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';

  let canonicalUrl = '';
  if (typeof window !== 'undefined') {
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonicalUrl = canonicalLink?.href || window.location.href;
  }

  let priceValidUntil: string | undefined;
  if (product.saleEndDate) {
    try {
      priceValidUntil = new Date(product.saleEndDate).toISOString().split('T')[0];
    } catch {}
  }

  const offers: Record<string, any> = {
    '@type': 'Offer',
    priceCurrency: currency || 'USD',
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    url: canonicalUrl,
  };
  if (price !== undefined) {
    offers.price = price;
  }
  if (priceValidUntil) {
    offers.priceValidUntil = priceValidUntil;
  }

  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name || '',
    image: images,
    description,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers,
  };

  if (sku) {
    productSchema.sku = sku;
  }
  if (product.barcode) {
    productSchema.gtin = String(product.barcode).trim();
  }

  const reviewCount = Number(reviews?.count ?? (Array.isArray(reviews) ? reviews.length : 0));
  const avgRating = Number(reviews?.avgRating ?? reviews?.averageRating ?? 0);
  if (reviewCount > 0 && avgRating > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return productSchema;
};

export function useProductStructuredData(props: ProductStructuredDataProps) {
  const { product, currency = 'USD', reviews, storeName = '', activeVariant } = props;

  useEffect(() => {
    if (typeof document === 'undefined' || !product) {
      return;
    }

    // Check if script[id="pdp-product-jsonld"] already exists
    if (document.getElementById('pdp-product-jsonld')) {
      return;
    }

    // Check if existing ld+json script has @type === 'Product' (SSR case)
    const existingLdJsonScripts = document.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    );
    for (const script of Array.from(existingLdJsonScripts)) {
      try {
        const text = script.textContent || script.innerText || '';
        if (text) {
          const parsed = JSON.parse(text);
          if (
            parsed &&
            (parsed['@type'] === 'Product' ||
              (Array.isArray(parsed['@graph']) &&
                parsed['@graph'].some((item: any) => item?.['@type'] === 'Product')))
          ) {
            return;
          }
        }
      } catch {}
    }

    const productSchema = buildProductJsonLd({
      product,
      currency,
      reviews,
      storeName,
      activeVariant,
    });

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.setAttribute('data-seo', 'product');
    scriptEl.id = 'pdp-product-jsonld';
    scriptEl.text = JSON.stringify(productSchema);
    document.head.appendChild(scriptEl);

    return () => {
      if (scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [product, currency, reviews, storeName, activeVariant]);
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = (props) => {
  useProductStructuredData(props);
  return null;
};

export default ProductStructuredData;
