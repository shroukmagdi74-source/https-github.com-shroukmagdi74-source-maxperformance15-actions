/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import CustomerOccasionsWhatsAppNotify from '../../CustomerOccasionsWhatsAppNotify';
import { apiClient } from '../../../../services/apiClient';

vi.mock('../../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../components/MetaTemplatesModal', () => ({
  default: () => <div data-testid="meta-templates-modal" />,
}));

vi.mock('../../components/TemplateStatsPanel', () => ({
  default: () => <div data-testid="template-stats-panel">لوحة أداء القوالب</div>,
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

const mockOccasions = [
  {
    id: 'occ-1',
    name: 'عيد الفطر المبارك',
    message: 'كل عام وأنتم بخير بمناسبة حلول عيد الفطر المبارك، خصم خاص لعملائنا الكرام!',
    mediaUrl: null,
    scheduledAt: '2026-04-10T09:00:00.000Z',
    recurrence: 'yearly',
    customerListIds: '[]',
    status: 'scheduled',
    lastSentAt: null,
    totalSent: 1500,
    sendLimit: 0,
    templateName: 'eid_alfitr_promo',
  },
  {
    id: 'occ-2',
    name: 'عروض الجمعة البيضاء',
    message: 'عروض حصرية بدأت الآن!',
    mediaUrl: 'https://example.com/banner.jpg',
    scheduledAt: '2026-11-25T12:00:00.000Z',
    recurrence: 'none',
    customerListIds: '[]',
    status: 'draft',
    lastSentAt: null,
    totalSent: 0,
    sendLimit: 500,
  },
];

const mockSessions = [
  {
    sessionId: 'sess-occ-1',
    phoneNumber: '201011112222',
    isConnected: true,
  },
];

describe('CustomerOccasionsWhatsAppNotify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/occasions')) {
        return Promise.resolve({ data: { success: true, data: mockOccasions } });
      }
      if (url.includes('/sessions')) {
        return Promise.resolve({ data: { success: true, sessions: mockSessions } });
      }
      if (url.includes('/preview-audience')) {
        return Promise.resolve({ data: { success: true, count: 420 } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders header, channel status, and occasions count badge', async () => {
    render(
      <MemoryRouter>
        <CustomerOccasionsWhatsAppNotify />
      </MemoryRouter>
    );

    expect(screen.getByText('مناسبات العملاء')).toBeInTheDocument();
    expect(screen.getByText('مناسبة جديدة')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('عيد الفطر المبارك')).toBeInTheDocument();
      expect(screen.getByText('عروض الجمعة البيضاء')).toBeInTheDocument();
    });

    expect(screen.getByText('جلسة واتساب متصلة — الإرسال الفوري جاهز')).toBeInTheDocument();
  });

  it('renders occasion cards with correct status badges and recurrence info', async () => {
    render(
      <MemoryRouter>
        <CustomerOccasionsWhatsAppNotify />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('عيد الفطر المبارك')).toBeInTheDocument();
    });

    expect(screen.getByText('مجدولة')).toBeInTheDocument();
    expect(screen.getByText('مسودة')).toBeInTheDocument();
    expect(screen.getByText('سنوي')).toBeInTheDocument();
    expect(screen.getByText('مرة واحدة')).toBeInTheDocument();
  });

  it('filters occasions based on search query', async () => {
    render(
      <MemoryRouter>
        <CustomerOccasionsWhatsAppNotify />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('عيد الفطر المبارك')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('ابحث باسم المناسبة...');
    fireEvent.change(searchInput, { target: { value: 'الجمعة' } });

    expect(screen.queryByText('عيد الفطر المبارك')).not.toBeInTheDocument();
    expect(screen.getByText('عروض الجمعة البيضاء')).toBeInTheDocument();
  });

  it('opens occasion creation dialog on clicking "مناسبة جديدة"', async () => {
    render(
      <MemoryRouter>
        <CustomerOccasionsWhatsAppNotify />
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('button', { name: /مناسبة جديدة/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('جدولة رسالة لإرسالها تلقائياً للعملاء في الموعد المحدد أو دورياً')).toBeInTheDocument();
    });
  });

  it('opens occasion view dialog on clicking view icon', async () => {
    render(
      <MemoryRouter>
        <CustomerOccasionsWhatsAppNotify />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('عيد الفطر المبارك')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByRole('button', { name: /عرض تفاصيل الرسالة/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('قالب مرتبط: eid_alfitr_promo')).toBeInTheDocument();
    });
  });
});
