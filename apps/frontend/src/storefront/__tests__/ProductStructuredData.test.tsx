/**
 * @vitest-environment jsdom
 */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductStructuredData } from '../engine/ProductStructuredData';
import { StorefrontHead, __resetStorefrontHeadStateForTests__ } from '../engine/StorefrontHead';

// Mock ThemeProvider
vi.mock('../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'swan-boutique',
      name: 'Swan Store',
      seo: {
        titleTemplate: '%s | Swan Store',
        description: 'Default store description',
        defaultOgImage: 'https://swan.maxp.online/uploads/default-og.png',
      },
      header: {
        brandName: 'Swan Store',
      },
    },
  }),
}));

// Mock useStorefrontSettings
vi.mock('../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: {
        logo: 'https://swan.maxp.online/uploads/company-logo.png',
      },
      storefront: {
        settings: {
          storeName: 'Swan Store',
        },
      },
    },
  }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ProductStructuredData & StorefrontHead productImage', () => {
  beforeEach(() => {
    __resetStorefrontHeadStateForTests__();
    document.title = '';
    document.head.querySelectorAll('script[type="application/ld+json"], meta, link[rel="canonical"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.head.querySelectorAll('script[type="application/ld+json"], meta, link[rel="canonical"]').forEach((el) => el.remove());
  });

  it('injects exactly one Product ld+json script when there was none', async () => {
    const mockProduct = {
      id: 'p1',
      name: 'Test Sneaker',
      price: 150,
      stock: 10,
      trackInventory: true,
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      sku: 'SNK-001',
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ProductStructuredData product={mockProduct} currency="EGP" />);
    });

    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);

    const parsed = JSON.parse(scripts[0].textContent || '{}');
    expect(parsed['@type']).toBe('Product');
    expect(parsed.name).toBe('Test Sneaker');
    expect(parsed.image).toEqual(['https://example.com/img1.jpg', 'https://example.com/img2.jpg']);
    expect(parsed.offers.price).toBe(150);
    expect(parsed.offers.priceCurrency).toBe('EGP');
    expect(parsed.offers.availability).toBe('https://schema.org/InStock');

    await act(async () => {
      root.unmount();
    });

    // Verify unmount removes the script
    const afterUnmount = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(afterUnmount.length).toBe(0);
    container.remove();
  });

  it('preserves SSR Product ld+json and does not inject a duplicate (exactly ONE script after hydration)', async () => {
    // Simulate SSR-injected Product JSON-LD script
    const ssrScript = document.createElement('script');
    ssrScript.type = 'application/ld+json';
    ssrScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'SSR Hydrated Product',
      offers: {
        '@type': 'Offer',
        price: 200,
        priceCurrency: 'USD',
      },
    });
    document.head.appendChild(ssrScript);

    const mockProduct = {
      id: 'p1',
      name: 'SSR Hydrated Product',
      price: 200,
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ProductStructuredData product={mockProduct} currency="USD" />);
    });

    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    expect(document.getElementById('pdp-product-jsonld')).toBeNull();

    const parsed = JSON.parse(scripts[0].textContent || '{}');
    expect(parsed['@type']).toBe('Product');
    expect(parsed.name).toBe('SSR Hydrated Product');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('sets og:image to productImage when productImage prop is passed', async () => {
    const productImageUrl = 'https://example.com/product-hero.jpg';

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/product/swan-motion']}>
          <StorefrontHead productImage={productImageUrl} />
        </MemoryRouter>
      );
    });

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    expect(ogImageMeta?.getAttribute('content')).toBe(productImageUrl);

    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    expect(twitterImageMeta?.getAttribute('content')).toBe(productImageUrl);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
