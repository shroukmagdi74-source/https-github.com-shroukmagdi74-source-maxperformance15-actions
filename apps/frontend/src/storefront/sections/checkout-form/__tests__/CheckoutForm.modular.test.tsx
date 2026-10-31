// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutForm } from '../../CheckoutForm';
import { useCheckoutStore } from '../../../store/useCheckoutStore';
import { useCartStore } from '../../../store/useCartStore';

vi.mock('../../../engine/ThemeProvider', () => ({
  useStorefrontTheme: () => ({
    theme: {
      id: 'default',
      name: 'Default Store',
      direction: 'rtl',
    },
  }),
}));

vi.mock('../../../hooks/useTierProgress', () => ({
  useTierProgress: () => ({
    refreshTierProgress: vi.fn(),
  }),
}));

vi.mock('../../../components/TierProgressBanner', () => ({
  default: () => <div data-testid="tier-progress-banner" />,
}));

describe('CheckoutForm Modular Architecture', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    cleanup();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useCheckoutStore.getState().resetCheckout();
    useCartStore.setState({
      items: [
        {
          id: 'test-item-1',
          productId: 'prod-1',
          name: 'Test Product',
          price: 250,
          quantity: 1,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders contact and shipping sections and updates store on input change', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckoutForm />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText('الاسم الكامل')).toBeInTheDocument();
    expect(screen.getByLabelText('رقم الهاتف')).toBeInTheDocument();
    expect(screen.getByLabelText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByLabelText('العنوان بالتفصيل')).toBeInTheDocument();
    expect(screen.getByLabelText('المدينة')).toBeInTheDocument();
    expect(screen.getByLabelText('المحافظة')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('الاسم الكامل');
    fireEvent.change(nameInput, { target: { name: 'customerName', value: 'محمد علي' } });
    expect(useCheckoutStore.getState().formData.customerName).toBe('محمد علي');

    const phoneInput = screen.getByLabelText('رقم الهاتف');
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '01012345678' } });
    expect(useCheckoutStore.getState().formData.phone).toBe('01012345678');
  });

  it('auto-detects governorate from city name after debounce', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckoutForm />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const cityInput = screen.getByLabelText('المدينة');
    fireEvent.change(cityInput, { target: { name: 'city', value: 'المنصورة' } });

    await waitFor(
      () => {
        expect(useCheckoutStore.getState().formData.governorate).toBe('Dakahlia');
      },
      { timeout: 1500 },
    );
  });

  it('hides notes section when showNotesSection is false', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckoutForm settings={{ showNotesSection: false }} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.queryByLabelText('ملاحظات على الطلب')).not.toBeInTheDocument();
  });

  it('returns null when cart is empty', () => {
    useCartStore.setState({ items: [] });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckoutForm />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
