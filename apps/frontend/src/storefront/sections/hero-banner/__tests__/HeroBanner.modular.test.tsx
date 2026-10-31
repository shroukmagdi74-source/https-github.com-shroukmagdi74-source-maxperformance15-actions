/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroBanner } from '../../HeroBanner';
import { useHeroBannerController } from '../useHeroBannerController';

// Mock ThemeProvider
vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      direction: 'rtl',
      tokens: { colors: { primary: '220 90% 50%' } },
    },
  }),
}));

describe('HeroBanner Modular Component (Batch 639)', () => {
  it('renders default centered hero correctly', () => {
    render(
      <MemoryRouter>
        <HeroBanner
          section={{ id: 'hero-1', type: 'HeroBanner' }}
          settings={{
            title: 'مرحبا بكم في متجرنا',
            subtitle: 'أفضل العروض والمنتجات الحصرية',
            primaryCtaText: 'تسوق الآن',
            primaryCtaLink: '/shop',
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('مرحبا بكم في متجرنا')).toBeTruthy();
    expect(screen.getByText('أفضل العروض والمنتجات الحصرية')).toBeTruthy();
    expect(screen.getByText('تسوق الآن')).toBeTruthy();
  });

  it('renders fashion billboard variant correctly', () => {
    render(
      <MemoryRouter>
        <HeroBanner
          section={{ id: 'hero-fashion', type: 'HeroBanner', variant: 'fashion-billboard' }}
          settings={{
            title: 'تشكيلة صيف 2026',
            subtitle: 'أناقة وتألق لكل يوم',
            ctaText: 'اكتشف الكولكشن',
            ctaLink: '/collections/summer',
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('تشكيلة صيف 2026')).toBeTruthy();
    expect(screen.getByText('أناقة وتألق لكل يوم')).toBeTruthy();
    expect(screen.getByText('اكتشف الكولكشن')).toBeTruthy();
  });

  it('renders elessi spotlight variant correctly', () => {
    render(
      <MemoryRouter>
        <HeroBanner
          section={{ id: 'hero-elessi', type: 'HeroBanner', variant: 'elessi-spotlight' }}
          settings={{
            title: 'إطلالة الموسم الحصرية',
            subtitle: 'تصاميم مختارة بعناية',
            highlights: [
              { label: 'الخامة', value: 'قطن مصري 100%' },
              { label: 'التوصيل', value: 'سريع' },
            ],
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('إطلالة الموسم الحصرية')).toBeTruthy();
    expect(screen.getByText('تصاميم مختارة بعناية')).toBeTruthy();
    expect(screen.getByText('قطن مصري 100%')).toBeTruthy();
  });

  it('useHeroBannerController resolves scoped links and props properly', () => {
    const TestConsumer: React.FC = () => {
      const { variant, props } = useHeroBannerController(
        { id: 'h1', type: 'HeroBanner' },
        {
          title: 'Custom Title',
          primaryCtaLink: 'products',
          secondaryCtaLink: '/about',
          compact: true,
        },
      );

      return (
        <div>
          <span data-testid="variant">{variant}</span>
          <span data-testid="title">{props.title}</span>
          <span data-testid="primaryHref">{props.primaryHref}</span>
          <span data-testid="compact">{props.compact ? 'true' : 'false'}</span>
        </div>
      );
    };

    render(
      <MemoryRouter initialEntries={['/en/store']}>
        <TestConsumer />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('variant').textContent).toBe('centered');
    expect(screen.getByTestId('title').textContent).toBe('Custom Title');
    expect(screen.getByTestId('compact').textContent).toBe('true');
  });
});
