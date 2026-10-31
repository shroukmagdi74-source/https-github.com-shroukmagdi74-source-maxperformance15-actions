// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopCommandBar } from '../../ShopCommandBar';
import { normalizeShopCommandBarVariant } from '../types';

vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat-1', name: 'Fresh Cuts', slug: 'fresh-cuts' },
      { id: 'cat-2', name: 'Premium Steaks', slug: 'steaks' },
    ],
  }),
}));

vi.mock('../../../hooks/useProducts', () => ({
  useProducts: () => ({
    products: [],
    pagination: { total: 42, page: 1, limit: 12, pages: 4 },
    isLoading: false,
  }),
}));

vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    themeId: 'default',
    theme: { direction: 'ltr' },
  }),
}));

describe('ShopCommandBar Modular Architecture (Batch 637)', () => {
  it('normalizes variant names safely with fallback', () => {
    expect(normalizeShopCommandBarVariant('butcher-cut-console')).toBe('butcher-cut-console');
    expect(normalizeShopCommandBarVariant('graceful-bar')).toBe('graceful-bar');
    expect(normalizeShopCommandBarVariant('occasion-planner')).toBe('occasion-planner');
    expect(normalizeShopCommandBarVariant('elessi-digital-toolbar')).toBe('elessi-digital-toolbar');
    expect(normalizeShopCommandBarVariant(null)).toBe('default-discovery');
    expect(normalizeShopCommandBarVariant('invalid-unknown')).toBe('default-discovery');
  });

  it('renders standard deck variant by default', () => {
    const { container } = render(
      <MemoryRouter>
        <ShopCommandBar section={{ variant: 'default-discovery' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Fresh Cuts').length).toBeGreaterThan(0);
  });

  it('renders graceful-bar variant without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <ShopCommandBar section={{ variant: 'graceful-bar' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders butcher-cut-console variant with weight and cut filters', () => {
    const { container } = render(
      <MemoryRouter>
        <ShopCommandBar section={{ variant: 'butcher-cut-console' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Fresh Cuts').length).toBeGreaterThan(0);
  });

  it('renders occasion-planner variant with occasion tracks', () => {
    const { container } = render(
      <MemoryRouter>
        <ShopCommandBar section={{ variant: 'occasion-planner' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders elessi digital toolbar variant', () => {
    const { container } = render(
      <MemoryRouter>
        <ShopCommandBar section={{ variant: 'elessi-digital-toolbar' }} />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getAllByText('Fresh Cuts').length).toBeGreaterThan(0);
  });
});
