// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeaturedCollections } from '../../FeaturedCollections';
import {
  normalizeFeaturedCollectionsVariant,
  shouldPreferRuntimeFeaturedCollections,
} from '../index';

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat-1', name: 'Premium Cuts', slug: 'cuts', image: '/placeholders/sample.png' },
      { id: 'cat-2', name: 'Fresh Steaks', slug: 'steaks', image: '/placeholders/sample2.png' },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    themeId: 'default',
    theme: { id: 'default', direction: 'rtl' },
  }),
}));

describe('FeaturedCollections Modular Architecture (Batch 638)', () => {
  it('normalizes variant names safely with fallback', () => {
    expect(normalizeFeaturedCollectionsVariant('butcher-cut-map')).toBe('butcher-cut-map');
    expect(normalizeFeaturedCollectionsVariant('elessi-bag-categories')).toBe('elessi-bag-categories');
    expect(normalizeFeaturedCollectionsVariant('fragrance-ledger')).toBe('fragrance-ledger');
    expect(normalizeFeaturedCollectionsVariant('floating-bubbles')).toBe('floating-bubbles');
    expect(normalizeFeaturedCollectionsVariant(null)).toBe('standard-showcase');
    expect(normalizeFeaturedCollectionsVariant('unknown-variant')).toBe('standard-showcase');
  });

  it('evaluates runtime categories preference properly', () => {
    expect(
      shouldPreferRuntimeFeaturedCollections({
        themeId: 'khemet-luxe-eg',
        variant: 'gallery-columns',
      }),
    ).toBe(true);

    expect(
      shouldPreferRuntimeFeaturedCollections({
        themeId: 'other-theme',
        variant: 'gallery-columns',
      }),
    ).toBe(false);
  });

  it('renders standard-showcase variant by default', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCollections section={{ variant: 'standard-showcase' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Premium Cuts').length).toBeGreaterThan(0);
  });

  it('renders butcher-cut-map variant without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCollections section={{ variant: 'butcher-cut-map' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('CUT MAP').length).toBeGreaterThan(0);
  });

  it('renders elessi-bag-categories variant without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCollections section={{ variant: 'elessi-bag-categories' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Premium Cuts').length).toBeGreaterThan(0);
  });

  it('renders fragrance-ledger variant without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCollections section={{ variant: 'fragrance-ledger' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders floating-bubbles variant without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCollections section={{ variant: 'floating-bubbles' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Premium Cuts').length).toBeGreaterThan(0);
  });
});
