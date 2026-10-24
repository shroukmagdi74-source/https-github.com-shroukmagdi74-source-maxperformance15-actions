/** @vitest-environment jsdom */

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerBlockSettings from '../../CustomerBlockSettings';

const mockGetSettings = vi.fn();
const mockListRules = vi.fn();
const mockUpdateSettings = vi.fn();
const mockCreateRule = vi.fn();
const mockLiftRule = vi.fn();

vi.mock('../../../../services/customerBlocklistService', () => ({
  customerBlocklistService: {
    getSettings: () => mockGetSettings(),
    listRules: (params?: any) => mockListRules(params),
    updateSettings: (data: any) => mockUpdateSettings(data),
    createRule: (data: any) => mockCreateRule(data),
    liftRule: (id: string, reason?: string) => mockLiftRule(id, reason),
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultValue?: string) => defaultValue || key,
      i18n: { language: 'ar', dir: () => 'rtl' },
    }),
  };
});

const sampleSettings = {
  enabled: true,
  blockCheckout: true,
  blockManualOrders: true,
  blockAffiliateManualOrders: true,
  blockAiOrderCreation: true,
  matchPhone: true,
  matchEmail: true,
  matchFacebook: true,
  matchWhatsapp: true,
  allowManagerOverride: true,
  defaultAction: 'BLOCK_ORDERS',
  checkoutMessage: 'عذراً، لا يمكن إتمام الطلب بناءً على سياسات المتجر.',
  internalWarningMessage: 'تحذير: هذا العميل موجود في قائمة الحظر.',
};

const sampleRules = [
  {
    id: 'rule-1',
    status: 'ACTIVE',
    customer: {
      firstName: 'أيمن',
      lastName: 'ممدوح',
    },
    phone: '01011223344',
    email: 'ayman@example.com',
    action: 'BLOCK_ORDERS',
    reasonCode: 'REPEATED_REFUSAL',
    reasonNote: 'رفض 3 شحنات متتالية',
    expiresAt: '2026-12-31T00:00:00.000Z',
  },
];

describe('CustomerBlockSettings Component (Batch 443)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSettings.mockResolvedValue(sampleSettings);
    mockListRules.mockResolvedValue({ data: sampleRules, total: 1 });
    mockUpdateSettings.mockResolvedValue(sampleSettings);
    mockCreateRule.mockResolvedValue({ id: 'rule-2', ...sampleRules[0] });
    mockLiftRule.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders header, active rules count, and table with customer data', async () => {
    render(<CustomerBlockSettings />);

    await waitFor(() => {
      expect(screen.getByText('إعدادات حظر العملاء والقائمة السوداء')).toBeInTheDocument();
      expect(screen.getByText('أيمن ممدوح')).toBeInTheDocument();
      expect(screen.getByText('01011223344')).toBeInTheDocument();
      expect(screen.getAllByText(/رفض الاستلام مكرر/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/رفض 3 شحنات متتالية/)).toBeInTheDocument();
      expect(screen.getByText('عميل محظور حالياً')).toBeInTheDocument();
    });
  });

  it('saves global block configuration changes', async () => {
    render(<CustomerBlockSettings />);

    await waitFor(() => {
      expect(screen.getByText('حفظ الإعدادات العامة')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('حفظ الإعدادات العامة'));

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          blockCheckout: true,
          defaultAction: 'BLOCK_ORDERS',
        }),
      );
      expect(screen.getByText('تم حفظ إعدادات الحظر بنجاح')).toBeInTheDocument();
    });
  });

  it('creates a new blocking rule via sidebar form', async () => {
    render(<CustomerBlockSettings />);

    await waitFor(() => {
      expect(screen.getByText('إضافة عميل لقائمة الحظر')).toBeInTheDocument();
    });

    const phoneInput = screen.getByPlaceholderText('01xxxxxxxxx');
    fireEvent.change(phoneInput, { target: { value: '01234567890' } });

    fireEvent.click(screen.getByRole('button', { name: 'إضافة للحظر' }));

    await waitFor(() => {
      expect(mockCreateRule).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '01234567890',
          action: 'BLOCK_ORDERS',
        }),
      );
      expect(screen.getByText('تمت إضافة العميل إلى قائمة الحظر بنجاح')).toBeInTheDocument();
    });
  });

  it('lifts an existing customer block rule', async () => {
    render(<CustomerBlockSettings />);

    await waitFor(() => {
      expect(screen.getByText('رفع الحظر')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('رفع الحظر'));

    await waitFor(() => {
      expect(mockLiftRule).toHaveBeenCalledWith('rule-1', expect.any(String));
      expect(screen.getByText('تم رفع الحظر بنجاح')).toBeInTheDocument();
    });
  });
});
