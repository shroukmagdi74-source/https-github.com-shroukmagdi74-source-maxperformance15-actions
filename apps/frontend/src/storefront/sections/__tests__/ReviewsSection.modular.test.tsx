// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReviewsSection from '../ReviewsSection';
import {
  normalizeReviewsVariant,
  formatDisplayDate,
  StarRating,
} from '../reviews-section/types';

// Mock dependencies
const mockProduct = {
  id: 'prod-1',
  name: 'Premium Perfume',
  description: 'Luxury fragrance with amber notes',
  category: { name: 'Fragrance' },
};

vi.mock('../../hooks/useProduct', () => ({
  useProduct: () => ({ product: mockProduct }),
}));

let mockReviewsState = {
  reviews: [
    {
      id: 'rev-1',
      author: 'Sara M.',
      rating: 5,
      title: 'رائع جداً',
      comment: 'تجربة ممتازة وجودة عالية وسرعة توصيل',
      createdAt: '2026-10-20T10:00:00.000Z',
      verified: true,
      helpfulCount: 3,
      media: [],
    },
    {
      id: 'rev-2',
      author: 'Omar K.',
      rating: 4,
      title: 'جيد جداً',
      comment: 'المنتج ممتاز والتوصيل سريع',
      createdAt: '2026-10-21T12:00:00.000Z',
      verified: true,
      helpfulCount: 0,
      media: [],
    },
  ],
  totalCount: 2,
  averageRating: 4.5,
  ratingDistribution: [
    { rating: 5, count: 1 },
    { rating: 4, count: 1 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ],
  isLoading: false,
};

vi.mock('../../hooks/useProductReviews', () => ({
  useProductReviews: () => mockReviewsState,
  getRatingDistribution: () => [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0 })),
  normalizeProductReviewRecord: (raw: any) => raw,
}));

vi.mock('../../hooks/useDeferredSectionActivation', () => ({
  useDeferredSectionActivation: () => ({
    isActive: true,
    sectionRef: { current: null },
  }),
}));

vi.mock('../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: { id: 'default', name: 'Default Store', direction: 'rtl' },
  }),
}));

vi.mock('../../hooks/useStorefrontSettings', () => ({
  useStorefrontSettings: () => ({
    settings: {
      companyId: 'comp-123',
    },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'prod-1' }),
  };
});

vi.mock('../../components/WriteReviewDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="write-review-dialog">Write Review Dialog Open</div> : null,
}));

describe('Storefront ReviewsSection Modular Suite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockReviewsState = {
      reviews: [
        {
          id: 'rev-1',
          author: 'Sara M.',
          rating: 5,
          title: 'رائع جداً',
          comment: 'تجربة ممتازة وجودة عالية وسرعة توصيل',
          createdAt: '2026-10-20T10:00:00.000Z',
          verified: true,
          helpfulCount: 3,
          media: [],
        },
        {
          id: 'rev-2',
          author: 'Omar K.',
          rating: 4,
          title: 'جيد جداً',
          comment: 'المنتج ممتاز والتوصيل سريع',
          createdAt: '2026-10-21T12:00:00.000Z',
          verified: true,
          helpfulCount: 0,
          media: [],
        },
      ],
      totalCount: 2,
      averageRating: 4.5,
      ratingDistribution: [
        { rating: 5, count: 1 },
        { rating: 4, count: 1 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
      isLoading: false,
    };
  });

  afterEach(() => {
    cleanup();
  });

  const renderSection = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReviewsSection
            section={{
              id: 'reviews-sec-1',
              type: 'reviews',
              variant: 'standard',
              settings: {},
            }}
            settings={{}}
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders reviews rating summary with average rating and trust info', () => {
    renderSection();

    // Average rating
    expect(screen.getByText(/4\.5/)).toBeDefined();
    // Reviews count
    expect(screen.getByText(/2 مراجعات/)).toBeDefined();
  });

  it('renders individual review cards with author, title, comment, and verified badge', () => {
    renderSection();

    expect(screen.getByText('Sara M.')).toBeDefined();
    expect(screen.getByText('Omar K.')).toBeDefined();
    expect(screen.getByText('رائع جداً')).toBeDefined();
    expect(screen.getByText('تجربة ممتازة وجودة عالية وسرعة توصيل')).toBeDefined();
    expect(screen.getAllByText('عميل موثق').length).toBe(2);
  });

  it('renders empty state when there are no reviews', () => {
    mockReviewsState = {
      reviews: [],
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: [
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
      isLoading: false,
    };

    renderSection();

    expect(screen.getByText('لا توجد مراجعات بعد')).toBeDefined();
  });

  it('opens write review dialog when clicking write review action', () => {
    renderSection();

    const writeButtons = screen.getAllByRole('button', { name: /اكتب مراجعتك|Write a review/i });
    expect(writeButtons.length).toBeGreaterThan(0);
    fireEvent.click(writeButtons[0]);

    expect(screen.getByTestId('write-review-dialog')).toBeDefined();
  });

  it('verifies helper functions and variant normalizer', () => {
    expect(normalizeReviewsVariant('elessi-story-grid')).toBe('elessi-story-grid');
    expect(normalizeReviewsVariant('editorial')).toBe('editorial');
    expect(normalizeReviewsVariant('command-proof')).toBe('command-proof');
    expect(normalizeReviewsVariant('unknown')).toBe('standard');

    const formatted = formatDisplayDate('2026-10-20T10:00:00.000Z');
    expect(formatted).toBeTruthy();
  });
});
