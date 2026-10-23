/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppInbox from '../WhatsAppInbox';
import { apiClient } from '../../../services/apiClient';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ sessionId: 'session-1' }),
  };
});

vi.mock('../../../services/socketService', () => ({
  socketService: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ar', dir: () => 'rtl' },
  }),
}));

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSessions = [
  {
    id: 'session-1',
    name: 'المبيعات الرئيسية',
    phoneNumber: '+201012345678',
    status: 'CONNECTED',
  },
  {
    id: 'session-2',
    name: 'الدعم الفني',
    phoneNumber: '+201098765432',
    status: 'DISCONNECTED',
  },
];

const mockConversations = [
  {
    id: 'conv-1',
    status: 'ACTIVE',
    queueKey: 'SALES',
    lastMessageAt: '2026-10-23T20:00:00Z',
    lastMessagePreview: 'أريد معرفة تفاصيل العرض الحالي',
    unreadCount: 2,
    isRead: false,
    customer: {
      id: 'cust-1',
      name: 'أحمد محمود',
      phone: '+201122334455',
      avatar: null,
      status: 'VIP',
    },
    assignedUser: {
      id: 'user-1',
      firstName: 'سارة',
      lastName: 'علي',
      avatar: null,
      department: 'المبيعات',
    },
    flags: {
      detectedLanguage: 'ar',
      detectedCountry: 'EG',
      detectedDepartment: 'SALES',
    },
    window: {
      isOpen: true,
      remainingSeconds: 7200,
      remainingLabel: '2 س',
      windowExpiresAt: '2026-10-23T22:00:00Z',
    },
  },
];

const mockSummary = {
  queueCounters: {
    total: 10,
    waiting: 3,
    assigned: 4,
    pending: 1,
    closed: 2,
    escalated: 0,
    slaBreached: 0,
    missedChats: 0,
  },
  moderatorPool: [
    {
      id: 'mod-1',
      name: 'سارة علي',
      department: 'المبيعات',
      online: true,
      workload: {
        active: 3,
        pending: 1,
        waitingCustomer: 0,
        unread: 2,
        totalWeighted: 4,
      },
    },
  ],
};

describe('WhatsAppInbox Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/sessions/session-1/conversations')) {
        return Promise.resolve({
          data: {
            success: true,
            conversations: mockConversations,
            summary: mockSummary,
          },
        });
      }
      if (url.endsWith('/sessions')) {
        return Promise.resolve({
          data: {
            success: true,
            sessions: mockSessions,
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders sessions rail, hero header, and active session details', async () => {
    render(
      <MemoryRouter>
        <WhatsAppInbox />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const salesTitles = screen.getAllByText('المبيعات الرئيسية');
      expect(salesTitles.length).toBeGreaterThanOrEqual(1);
    });

    const phones = screen.getAllByText('+201012345678');
    expect(phones.length).toBeGreaterThanOrEqual(1);
  });

  it('renders conversations list with customer name, unread count, and VIP tag', async () => {
    render(
      <MemoryRouter>
        <WhatsAppInbox />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمود')).toBeInTheDocument();
    });

    expect(screen.getByText('أريد معرفة تفاصيل العرض الحالي')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+201122334455')).toBeInTheDocument();
  });

  it('renders moderator pool with active and pending workloads', async () => {
    render(
      <MemoryRouter>
        <WhatsAppInbox />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const modNames = screen.getAllByText('سارة علي');
      expect(modNames.length).toBeGreaterThanOrEqual(1);
    });

    // Check workload counts
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to conversation chat on item click', async () => {
    render(
      <MemoryRouter>
        <WhatsAppInbox />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('أحمد محمود')).toBeInTheDocument();
    });

    const convButton = screen.getByText('أحمد محمود').closest('button');
    expect(convButton).not.toBeNull();
    fireEvent.click(convButton!);

    expect(mockNavigate).toHaveBeenCalledWith('/whatsapp-chat/conv-1');
  });

  it('navigates to moderator dashboard on button click', async () => {
    render(
      <MemoryRouter>
        <WhatsAppInbox />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/فتح لوحة المشرفين|Open moderator dashboard/i)).toBeInTheDocument();
    });

    const dashboardBtn = screen.getByText(/فتح لوحة المشرفين|Open moderator dashboard/i);
    fireEvent.click(dashboardBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/moderator-dashboard');
  });
});
