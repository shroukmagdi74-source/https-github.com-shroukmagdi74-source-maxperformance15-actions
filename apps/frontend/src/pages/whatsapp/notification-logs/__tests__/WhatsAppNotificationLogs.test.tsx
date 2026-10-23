/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppNotificationLogs from '../../WhatsAppNotificationLogs';
import { apiClient } from '../../../../services/apiClient';

vi.mock('../../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultVal?: string | Record<string, unknown>) => {
        if (typeof defaultVal === 'string') return defaultVal;
        const map: Record<string, string> = {
          'whatsappNotificationLogs.title': 'سجلات إشعارات واتساب',
          'whatsappNotificationLogs.description': 'عرض وتتبع حالة جميع الرسائل والإشعارات المرسلة',
          'common.back': 'رجوع',
          'common.refresh': 'تحديث',
        };
        return map[key] || key;
      },
      i18n: { language: 'ar', dir: () => 'rtl' },
    }),
  };
});

const mockLogs = [
  {
    id: 'log-1',
    status: 'DELIVERED',
    messageType: 'TEMPLATE',
    sessionId: 'sess-1',
    sessionName: 'جلسة المبيعات',
    sessionPhone: '201011112222',
    recipientPhone: '201099998888',
    recipientName: 'أحمد محمود',
    eventType: 'ORDER_CREATED',
    category: 'ORDERS',
    content: 'مرحباً أحمد، تم استلام طلبك بنجاح!',
    failureReason: null,
    errorCode: null,
    whatsappMessageId: 'wamid.HBgLMjAxM',
    createdAt: '2026-10-23T14:30:00.000Z',
    templateName: 'order_confirmation',
    metaTemplateName: 'order_confirm_v1',
    orderNumber: 'ORD-9876',
  },
  {
    id: 'log-2',
    status: 'FAILED',
    messageType: 'TEXT',
    sessionId: 'sess-1',
    sessionName: 'جلسة المبيعات',
    sessionPhone: '201011112222',
    recipientPhone: '201055554444',
    recipientName: 'سارة علي',
    eventType: 'ABANDONED_CART',
    category: 'MARKETING',
    content: 'مرحباً سارة، لديك منتجات في سلتك بانتظارك',
    failureReason: 'User phone number not registered on WhatsApp',
    errorCode: '131026',
    whatsappMessageId: null,
    createdAt: '2026-10-23T15:00:00.000Z',
  },
];

describe('WhatsAppNotificationLogs (Batch 428)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/whatsapp-notifications/logs')) {
        return Promise.resolve({
          data: {
            logs: mockLogs,
            pagination: { total: 2, page: 1, limit: 20 },
          },
        });
      }
      if (url.includes('/whatsapp-notifications/settings')) {
        return Promise.resolve({
          data: {
            sessions: [{ id: 'sess-1', name: 'جلسة المبيعات' }],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders title, filter controls, and logs table', async () => {
    render(
      <MemoryRouter>
        <WhatsAppNotificationLogs />
      </MemoryRouter>
    );

    expect(await screen.findByText('سجلات إشعارات واتساب')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('أحمد محمود')).toBeInTheDocument();
      expect(screen.getByText('سارة علي')).toBeInTheDocument();
    });

    expect(screen.getByText('طلب جديد')).toBeInTheDocument();
    expect(screen.getByText('سلة متروكة')).toBeInTheDocument();
  });

  it('renders status badges with appropriate styles', async () => {
    render(
      <MemoryRouter>
        <WhatsAppNotificationLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('تم التسليم')).toBeInTheDocument();
      expect(screen.getByText('فشل')).toBeInTheDocument();
    });

    expect(screen.getByText(/User phone number not registered/)).toBeInTheDocument();
  });

  it('opens log details dialog on row click', async () => {
    render(
      <MemoryRouter>
        <WhatsAppNotificationLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمود')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('أحمد محمود'));

    await waitFor(() => {
      expect(screen.getByText('تفاصيل الإشعار المرسل')).toBeInTheDocument();
      expect(screen.getByText('مرحباً أحمد، تم استلام طلبك بنجاح!')).toBeInTheDocument();
      expect(screen.getByText('ORD-9876')).toBeInTheDocument();
    });
  });

  it('displays empty state when no logs are returned', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/whatsapp-notifications/logs')) {
        return Promise.resolve({
          data: {
            logs: [],
            pagination: { total: 0, page: 1, limit: 20 },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <WhatsAppNotificationLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('لا توجد سجلات مطابقة')).toBeInTheDocument();
    });
  });
});
