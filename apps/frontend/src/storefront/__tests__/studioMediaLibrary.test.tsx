// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ImageElement, { buildImageSrcSet } from '../sections/elements/ImageElement';
import IconElement from '../sections/elements/IconElement';
import { StudioIconPicker, STOREFRONT_ICONS } from '../studio/StudioIconPicker';
import { StudioMediaLibraryPanel } from '../studio/StudioMediaLibraryPanel';

// Standard in-memory localStorage mock for node/vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock imageGalleryService
vi.mock('../../services/imageGalleryService', () => ({
  default: {
    listImages: vi.fn().mockResolvedValue([
      {
        id: 'img-1',
        url: '/uploads/storefront/product-alpha.webp',
        filename: 'product-alpha.webp',
        uploadedAt: '2026-10-27T10:00:00Z',
      },
    ]),
    uploadImage: vi.fn().mockResolvedValue({
      id: 'img-2',
      url: '/uploads/storefront/uploaded.webp',
      filename: 'uploaded.webp',
    }),
  },
}));

// Mock apiClient
vi.mock('../../services/apiClient', () => ({
  apiClient: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        url: '/uploads/storefront/new-product.webp',
        webp: {
          480: '/uploads/storefront/new-product-480w.webp',
          960: '/uploads/storefront/new-product-960w.webp',
          1440: '/uploads/storefront/new-product-1440w.webp',
        },
        width: 1600,
        height: 1200,
        bytes: 14500,
      },
    }),
  },
}));

describe('MEDIA-1: Media Library, Icons & Srcset/WebP', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: ImageElement with full 3 webp variants
  it('1. ImageElement renders srcSet with 3 responsive widths (480w, 960w, 1440w), loading="lazy", decoding="async", width and height', () => {
    const webpVariants = {
      480: '/uploads/storefront/hero-banner-480w.webp',
      960: '/uploads/storefront/hero-banner-960w.webp',
      1440: '/uploads/storefront/hero-banner-1440w.webp',
    };

    const { container } = render(
      <ImageElement
        settings={{
          src: '/uploads/storefront/hero-banner.webp',
          alt: 'بانر المتجر الصيفي',
          webp: webpVariants,
          width: 1440,
          height: 800,
        }}
      />
    );

    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/uploads/storefront/hero-banner.webp');
    expect(img?.getAttribute('alt')).toBe('بانر المتجر الصيفي');

    // Assert: srcset has all 3 widths
    const srcSet = img?.getAttribute('srcset');
    expect(srcSet).toBeTruthy();
    expect(srcSet).toContain('/uploads/storefront/hero-banner-480w.webp 480w');
    expect(srcSet).toContain('/uploads/storefront/hero-banner-960w.webp 960w');
    expect(srcSet).toContain('/uploads/storefront/hero-banner-1440w.webp 1440w');

    // Assert: loading="lazy" & decoding="async"
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('decoding')).toBe('async');

    // Assert: width & height attributes prevent CLS
    expect(img?.getAttribute('width')).toBe('1440');
    expect(img?.getAttribute('height')).toBe('800');
  });

  // Test 2: ImageElement handles subset without enlargement
  it('2. ImageElement builds srcset without 1440 when image original width was smaller', () => {
    const webpSubset = {
      480: '/uploads/storefront/thumb-480w.webp',
      960: '/uploads/storefront/thumb-960w.webp',
    };

    const srcSet = buildImageSrcSet(webpSubset);
    expect(srcSet).toBe(
      '/uploads/storefront/thumb-480w.webp 480w, /uploads/storefront/thumb-960w.webp 960w'
    );
    expect(srcSet).not.toContain('1440w');

    const { container } = render(
      <ImageElement
        settings={{
          src: '/uploads/storefront/thumb.webp',
          webp: webpSubset,
          width: 960,
          height: 600,
        }}
      />
    );

    const img = container.querySelector('img');
    expect(img?.getAttribute('srcset')).not.toContain('1440w');
  });

  // Test 3: ImageElement fallback and placeholder
  it('3. ImageElement falls back safely when webp is omitted or when src is missing', () => {
    // Normal image without webp variants
    const { container: c1 } = render(
      <ImageElement
        settings={{
          src: '/uploads/products/regular.jpg',
          alt: 'صورة عادية',
        }}
      />
    );
    const img = c1.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/uploads/products/regular.jpg');
    expect(img?.getAttribute('srcset')).toBeNull();

    // Missing src -> renders placeholder
    const { container: c2 } = render(<ImageElement settings={{}} />);
    const placeholder = c2.querySelector('[data-storefront-element="image-placeholder"]');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent).toContain('اختر صورة لعرضها');
  });

  // Test 4: Icon Library has >= 60 icons
  it('4. StudioIconPicker provides a library of >= 60 embedded SVG icons', () => {
    const iconKeys = Object.keys(STOREFRONT_ICONS);
    expect(iconKeys.length).toBeGreaterThanOrEqual(60);

    const onSelect = vi.fn();
    const { getByTestId } = render(<StudioIconPicker onSelectIcon={onSelect} />);

    // Renders the icon picker container
    expect(getByTestId('studio-icon-picker')).toBeTruthy();
  });

  // Test 5: Bilingual search in StudioIconPicker
  it('5. StudioIconPicker filters icons by Arabic and English search terms', () => {
    const onSelect = vi.fn();
    const { getByTestId } = render(<StudioIconPicker onSelectIcon={onSelect} />);

    const searchInput = getByTestId('studio-icon-search-input');

    // Search Arabic term: "سلة"
    fireEvent.change(searchInput, { target: { value: 'سلة' } });
    expect(getByTestId('icon-item-cart')).toBeTruthy();

    // Search English term: "whatsapp"
    fireEvent.change(searchInput, { target: { value: 'whatsapp' } });
    expect(getByTestId('icon-item-whatsapp')).toBeTruthy();

    // Clicking an icon invokes callback
    fireEvent.click(getByTestId('icon-item-whatsapp'));
    expect(onSelect).toHaveBeenCalledWith('whatsapp');
  });

  // Test 6: IconElement renders extended icons from library
  it('6. IconElement renders icons from the extended 60+ icon library', () => {
    const { container: cartContainer } = render(
      <IconElement settings={{ name: 'cart', size: 'lg', color: 'accent' }} />
    );
    const cartEl = cartContainer.querySelector('[data-element="icon"]');
    expect(cartEl).toBeTruthy();
    expect(cartEl?.getAttribute('data-icon-name')).toBe('cart');
    expect(cartEl?.querySelector('svg')).toBeTruthy();

    const { container: waContainer } = render(
      <IconElement settings={{ name: 'whatsapp', size: 'md' }} />
    );
    const waEl = waContainer.querySelector('[data-element="icon"]');
    expect(waEl).toBeTruthy();
    expect(waEl?.getAttribute('data-icon-name')).toBe('whatsapp');
    expect(waEl?.querySelector('svg')).toBeTruthy();
  });

  // Test 7: StudioMediaLibraryPanel renders grid and triggers insert
  it('7. StudioMediaLibraryPanel displays uploaded images and triggers onInsertImage', async () => {
    const onInsert = vi.fn();

    // Pre-populate with item
    localStorageMock.setItem(
      'storefront_media_library_items',
      JSON.stringify([
        {
          id: 'test-item-1',
          url: '/uploads/storefront/product-1.webp',
          filename: 'product-1.webp',
          alt: 'منتج رائع',
          webp: {
            480: '/uploads/storefront/product-1-480w.webp',
            960: '/uploads/storefront/product-1-960w.webp',
            1440: '/uploads/storefront/product-1-1440w.webp',
          },
          width: 1440,
          height: 900,
        },
      ])
    );

    const { getByTestId } = render(<StudioMediaLibraryPanel onInsertImage={onInsert} />);

    expect(getByTestId('studio-media-library-panel')).toBeTruthy();
    expect(getByTestId('media-item-test-item-1')).toBeTruthy();

    // Click "إدراج كصورة"
    const insertBtn = getByTestId('media-insert-test-item-1');
    fireEvent.click(insertBtn);

    expect(onInsert).toHaveBeenCalledWith({
      url: '/uploads/storefront/product-1.webp',
      alt: 'منتج رائع',
      webp: {
        480: '/uploads/storefront/product-1-480w.webp',
        960: '/uploads/storefront/product-1-960w.webp',
        1440: '/uploads/storefront/product-1-1440w.webp',
      },
      width: 1440,
      height: 900,
    });
  });

  // Test 8: StudioMediaLibraryPanel supports search, alt updating, and deletion
  it('8. StudioMediaLibraryPanel supports search filtering, Alt updating, and deletion', () => {
    localStorageMock.setItem(
      'storefront_media_library_items',
      JSON.stringify([
        {
          id: 'item-shoes',
          url: '/uploads/storefront/shoes.webp',
          filename: 'shoes.webp',
          alt: 'حذاء رياضي مريح',
        },
        {
          id: 'item-shirt',
          url: '/uploads/storefront/shirt.webp',
          filename: 'shirt.webp',
          alt: 'قميص أبيض قطني',
        },
      ])
    );

    const { getByTestId, queryByTestId } = render(<StudioMediaLibraryPanel />);

    expect(getByTestId('media-item-item-shoes')).toBeTruthy();
    expect(getByTestId('media-item-item-shirt')).toBeTruthy();

    // Filter by search
    const searchInput = getByTestId('media-search-input');
    fireEvent.change(searchInput, { target: { value: 'حذاء' } });

    expect(getByTestId('media-item-item-shoes')).toBeTruthy();
    expect(queryByTestId('media-item-item-shirt')).toBeNull();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    // Update alt text
    const altInput = getByTestId('media-alt-input-item-shoes') as HTMLInputElement;
    fireEvent.change(altInput, { target: { value: 'حذاء جري احترافي' } });
    expect(altInput.value).toBe('حذاء جري احترافي');

    // Delete item
    const deleteBtn = getByTestId('media-delete-item-shoes');
    fireEvent.click(deleteBtn);

    expect(queryByTestId('media-item-item-shoes')).toBeNull();
  });
});
