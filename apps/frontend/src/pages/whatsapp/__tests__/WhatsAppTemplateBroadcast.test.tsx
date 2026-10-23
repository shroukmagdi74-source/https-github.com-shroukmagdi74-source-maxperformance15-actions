/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppTemplateBroadcast from '../WhatsAppTemplateBroadcast';
import { apiClient } from '../../../services/apiClient';
import { broadcastService } from '../../../services/broadcastService';
import { customerService } from '../../../services/customerService';

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../../../services/broadcastService', () => ({
  broadcastService: {
    getCustomerLists: vi.fn(),
    getCustomersInListPaginated: vi.fn(),
    getCampaigns: vi.fn(),
    createCampaign: vi.fn(),
    sendCampaign: vi.fn(),
    deleteCustomerList: vi.fn(),
    createCustomerList: vi.fn(),
    refreshCustomerListCount: vi.fn(),
  },
}));

vi.mock('../../../services/customerService', () => ({
  customerService: {
    getDistinctTags: vi.fn().mockResolvedValue([]),
    getCustomers: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultVal?: string | Record<string, unknown>) => {
        if (typeof defaultVal === 'string') return defaultVal;
        const map: Record<string, string> = { 'common.back': 'رجوع' };
        return map[key] || key;
      },
      i18n: { language: 'ar', dir: () => 'rtl' },
    }),
  };
});

describe('WhatsAppTemplateBroadcast (Batch 427)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/whatsapp/sessions') {
        return Promise.resolve({
          data: {
            sessions: [
              {
                id: 's1',
                name: 'رقم المبيعات',
                phoneNumber: '201000000001',
                provider: 'META_CLOUD',
                metaWabaId: 'waba1',
              },
            ],
          },
        });
      }
      if (url.includes('/whatsapp-templates/templates')) {
        return Promise.resolve({
          data: {
            templates: [
              { name: 'promo', status: 'APPROVED', category: 'MARKETING', language: 'en' },
            ],
          },
        });
      }
      if (url.includes('/whatsapp/lead-categories')) {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    (broadcastService.getCustomerLists as any).mockResolvedValue([
      { id: 'l1', name: 'عملاء VIP', count: 120, isDefault: false, criteria: {} },
    ]);
    (broadcastService.getCampaigns as any).mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders heading, tabs, and disabled send button when empty', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <WhatsAppTemplateBroadcast />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'حملات بث قوالب واتساب' })).toBeInTheDocument();
    expect(screen.getByText('إنشاء وإدارة حملات إرسال قوالب Meta API مع تتبع الفتح والضغط')).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /إرسال البث/ });
    expect(sendBtn).toBeDisabled();
  });

  it('allows switching between tabs (Create, Campaigns, Analytics, Lists)', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <WhatsAppTemplateBroadcast />
      </MemoryRouter>
    );

    // Click on Lists Tab
    const listsTab = screen.getByRole('tab', { name: /قوائم العملاء/ });
    fireEvent.click(listsTab);

    await waitFor(() => {
      expect(screen.getByText('عملاء VIP')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    // Click on Analytics Tab
    const analyticsTab = screen.getByRole('tab', { name: /التحليلات/ });
    fireEvent.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText('لا توجد بيانات إحصائية بعد')).toBeInTheDocument();
    });
  });

  it('adds recipients from textarea and updates count', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <WhatsAppTemplateBroadcast />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('0 مستلم محدد')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/اكتب أرقام الهواتف/);
    fireEvent.change(textarea, { target: { value: '201234567890\n201098765432' } });

    const addBtn = screen.getByRole('button', { name: /إضافة الأرقام للقائمة/ });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('2 مستلم محدد')).toBeInTheDocument();
      expect(screen.getByText('201234567890')).toBeInTheDocument();
      expect(screen.getByText('201098765432')).toBeInTheDocument();
    });
  });

  it('loads sessions and lists in select options', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <WhatsAppTemplateBroadcast />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('رقم المبيعات (201000000001)')).toBeInTheDocument();
    });
  });
});
