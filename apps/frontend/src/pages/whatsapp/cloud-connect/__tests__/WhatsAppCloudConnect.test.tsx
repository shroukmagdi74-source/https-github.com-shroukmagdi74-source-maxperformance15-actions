/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppCloudConnect from '../../WhatsAppCloudConnect';
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
        return key;
      },
      i18n: {
        language: 'ar',
        dir: () => 'rtl',
      },
    }),
  };
});

describe('WhatsAppCloudConnect (Batch 426)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/facebook/config')) {
        return Promise.resolve({
          data: {
            appId: '1234567890',
            redirectUri: 'http://localhost/whatsapp/cloud-connect',
            configId: 'cfg-123',
            configured: true,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders intro card, Meta compliance banner, and requirements', async () => {
    render(
      <MemoryRouter>
        <WhatsAppCloudConnect />
      </MemoryRouter>
    );

    expect(screen.getByText('ربط واتساب السحابي عبر Facebook')).toBeInTheDocument();
    expect(screen.getByText('الربط السحابي المضمن (Embedded Sign-Up)')).toBeInTheDocument();
    expect(screen.getByText('معتمد رسمياً من Meta — أمان كامل بدون مخاطر حظر')).toBeInTheDocument();
    expect(screen.getByText('المتطلبات الأساسية')).toBeInTheDocument();
  });

  it('renders session name input and connect with facebook button', async () => {
    render(
      <MemoryRouter>
        <WhatsAppCloudConnect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('المتابعة باستخدام Facebook')).toBeInTheDocument();
    });

    const sessionInput = screen.getByPlaceholderText('مثلاً: واتساب المبيعات الرئيسي');
    expect(sessionInput).toBeInTheDocument();
    fireEvent.change(sessionInput, { target: { value: 'واتساب الدعم الفني' } });
    expect(sessionInput).toHaveValue('واتساب الدعم الفني');
  });

  it('renders method comparison card', async () => {
    render(
      <MemoryRouter>
        <WhatsAppCloudConnect />
      </MemoryRouter>
    );

    expect(screen.getByText('مقارنة طرق الربط')).toBeInTheDocument();
    expect(screen.getByText('الربط السحابي (موصى به)')).toBeInTheDocument();
    expect(screen.getByText('ربط الويب المباشر (Baileys)')).toBeInTheDocument();
    expect(screen.getByText('الربط اليدوي للمطورين (Manual API)')).toBeInTheDocument();
  });

  it('displays error state when redirected with error query param', async () => {
    render(
      <MemoryRouter initialEntries={['/whatsapp/cloud-connect?error=access_denied']}>
        <WhatsAppCloudConnect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('فشل الاتصال')).toBeInTheDocument();
      expect(screen.getByText('تم إلغاء الاتصال بحساب Facebook')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /إعادة المحاولة/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('الربط السحابي المضمن (Embedded Sign-Up)')).toBeInTheDocument();
    });
  });

  it('exchanges OAuth code and transitions to success state', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        session: {
          id: 'sess-cloud-99',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/whatsapp/cloud-connect?code=valid-code-123&state=csrf-token-abc']}>
        <WhatsAppCloudConnect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('تم الربط بنجاح!')).toBeInTheDocument();
      expect(screen.getByText('رقم واتساب الأعمال مرتبط وجاهز للإرسال')).toBeInTheDocument();
    });
  });
});
