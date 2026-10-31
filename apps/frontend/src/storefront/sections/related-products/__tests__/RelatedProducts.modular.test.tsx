// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RelatedProducts } from '../../RelatedProducts';
import { ElessiCompleteSetCard } from '../ElessiCompleteSetCard';
import type { Product } from '../../../hooks/useProducts';

const useDeferredSectionActivationMock = vi.hoisted(() =>
  vi.fn(() => ({
    isActive: true,
    sectionRef: { current: null },
  })),
);

const mockCurrentProduct: Product = {
  id: 'prod-main',
  slug: 'main-product',
  name: 'Main Test Product',
  price: 500,
  categoryId: 'category-1',
};

const mockRelatedProducts: Product[] = [
  {
    id: 'rel-1',
    slug: 'related-1',
    name: 'Related Product 1',
    price: 250,
    comparePrice: 300,
    category: { name: 'Category 1' },
    tags: ['Best Seller', 'New'],
  },
  {
    id: 'rel-2',
    slug: 'related-2',
    name: 'Related Product 2',
    price: 400,
    comparePrice: 0,
    category: { name: 'Category 1' },
  },
];

vi.mock('../../../hooks/useProduct', () => ({
  useProduct: () => ({ product: mockCurrentProduct, isLoading: false }),
  fetchStorefrontProduct: vi.fn(),
  getStorefrontProductQueryKey: vi.fn((target: string) => ['storefront', 'product', target]),
}));

vi.mock('../../../hooks/useProducts', () => ({
  useProducts: () => ({
    products: mockRelatedProducts,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      company: { currency: 'EGP' },
      storefront: {
        settings: { currency: 'EGP' },
      },
    },
  }),
}));

vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
    },
  }),
}));

vi.mock('../../../hooks/useDeferredSectionActivation', () => ({
  useDeferredSectionActivation: useDeferredSectionActivationMock,
}));

vi.mock('../../../utils/marketplaceApps', () => ({
  getStorefrontMarketplaceAppSettings: () => ({}),
  isStorefrontMarketplaceAppEnabled: () => false,
}));

vi.mock('../../../components/StorefrontProductImage', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} data-testid="storefront-product-image" />,
}));

vi.mock('../../../components/ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid={`product-card-${product.id}`}>
      <h3>{product.name}</h3>
      <span>{product.price}</span>
    </div>
  ),
}));

describe('RelatedProducts Modular Architecture', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    cleanup();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useDeferredSectionActivationMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders standard related products section with title and products', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/product/main-product']}>
          <RelatedProducts
            section={{ variant: 'standard' }}
            settings={{ title: 'منتجات مقترحة', subtitle: 'قد تعجبك هذه المنتجات' }}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('منتجات مقترحة')).toBeInTheDocument();
    expect(screen.getByText('قد تعجبك هذه المنتجات')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-rel-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-rel-2')).toBeInTheDocument();
  });

  it('renders closet pairings variant correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/product/main-product']}>
          <RelatedProducts
            section={{ variant: 'closet-pairings' }}
            settings={{ title: 'تنسيقات إضافية' }}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('تنسيق قريب')).toBeInTheDocument();
    expect(screen.getByText('بدائل لنفس الإحساس')).toBeInTheDocument();
  });

  it('renders command alternatives variant with decision badges', () => {
    const commandRelatedProducts: Product[] = [
      {
        id: 'cmd-1',
        slug: 'pc-1',
        name: 'Gaming Rig X',
        price: 25000,
        decisionBadge: 'خيار الأداء العالي',
        modelLabel: 'PC HUB RTX',
        commandFacts: [{ label: 'GPU', value: 'RTX 4080' }],
      } as unknown as Product,
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/product/main-product']}>
          <RelatedProducts
            section={{ variant: 'command-alternatives' }}
            settings={{ title: 'بدائل القرار' }}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText('بدائل القرار').length).toBeGreaterThan(0);
  });

  it('renders ElessiCompleteSetCard correctly with prefetch triggers', () => {
    const testLocation = {
      pathname: '/product/main-product',
      search: '',
      hash: '',
      state: null,
      key: 'test',
    };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ElessiCompleteSetCard
            relatedProduct={mockRelatedProducts[0]}
            location={testLocation}
            queryClient={queryClient}
            currency="EGP"
            prefersArabicCopy={true}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Related Product 1')).toBeInTheDocument();
    expect(screen.getByText('عرض')).toBeInTheDocument();
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('شوفي التفاصيل')).toBeInTheDocument();

    const link = screen.getByRole('link');
    fireEvent.mouseEnter(link);
    fireEvent.touchStart(link);
  });
});
