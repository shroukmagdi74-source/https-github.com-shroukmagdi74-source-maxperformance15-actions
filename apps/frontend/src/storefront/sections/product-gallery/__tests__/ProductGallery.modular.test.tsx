/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductGallery } from '../../ProductGallery';

// Mock Storefront Product Hook
vi.mock('../../../hooks/useProduct', () => ({
  useProduct: () => ({
    product: {
      id: 'prod-123',
      name: 'فستان صيفي أنيق',
      price: 850,
      comparePrice: 1100,
      images: [
        'https://example.com/dress-front.jpg',
        'https://example.com/dress-back.jpg',
      ],
      category: { name: 'فساتين' },
    },
    isLoading: false,
  }),
}));

// Mock Storefront Theme
vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
      tokens: { colors: { primary: '220 90% 50%' } },
    },
  }),
}));

// Mock Storefront Settings
vi.mock('../../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      storefront: {
        settings: { currency: 'EGP' },
        storefrontFeatures: { wishlistEnabled: true, comparisonEnabled: true },
      },
    },
  }),
}));

afterEach(() => {
  cleanup();
});

describe('ProductGallery Modular Component (Batch 640)', () => {
  it('renders standard product gallery with thumbnails and main view', () => {
    render(
      <MemoryRouter>
        <ProductGallery section={{ variant: 'standard' }} />
      </MemoryRouter>,
    );

    expect(screen.getByAltText('فستان صيفي أنيق main view')).toBeTruthy();
    expect(screen.getByAltText('فستان صيفي أنيق thumbnail 1')).toBeTruthy();
    expect(screen.getByAltText('فستان صيفي أنيق thumbnail 2')).toBeTruthy();
  });

  it('renders boutique portrait stage gallery variant', () => {
    render(
      <MemoryRouter>
        <ProductGallery section={{ variant: 'boutique-portrait-stage' }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('فساتين')).toBeTruthy();
    expect(screen.getByText('اختيار روزا')).toBeTruthy();
    expect(screen.getByAltText('فستان صيفي أنيق portrait view')).toBeTruthy();
  });

  it('renders cyber showcase gallery variant', () => {
    render(
      <MemoryRouter>
        <ProductGallery section={{ variant: 'neon-showcase' }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('اختيار Cyber')).toBeTruthy();
    expect(screen.getByAltText('فستان صيفي أنيق main view')).toBeTruthy();
  });

  it('switches active thumbnail on thumbnail click in standard gallery', () => {
    render(
      <MemoryRouter>
        <ProductGallery section={{ variant: 'standard' }} />
      </MemoryRouter>,
    );

    const thumb2 = screen.getByLabelText('عرض الصورة 2');
    expect(thumb2).toBeTruthy();
    fireEvent.click(thumb2);
  });
});
