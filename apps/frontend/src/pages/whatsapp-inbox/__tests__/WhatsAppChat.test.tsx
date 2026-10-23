/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WhatsAppChat from '../WhatsAppChat';
import { apiClient } from '../../../services/apiClient';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ conversationId: 'conv-123' }),
  };
});

vi.mock('../chat/WhatsAppChatModals', () => ({
  WhatsAppChatModals: () => <div data-testid="chat-modals" />,
}));

vi.mock('../../../services/socketService', () => ({
  socketService: {
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'ar', dir: () => 'rtl' },
    }),
  };
});

vi.mock('../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockConversation = {
  id: 'conv-123',
  status: 'ACTIVE',
  aiEnabled: true,
  queueKey: 'SUPPORT',
  customer: {
    id: 'cust-456',
    name: 'محمود عبد الرحمن',
    phone: '+201011223344',
    email: 'mahmoud@example.com',
    avatar: null,
    status: 'VIP',
  },
  messages: [
    {
      id: 'msg-1',
      content: 'السلام عليكم، عندي استفسار بخصوص الشحن',
      type: 'TEXT',
      isFromCustomer: true,
      createdAt: '2026-10-23T19:30:00Z',
      user: null,
    },
    {
      id: 'msg-2',
      content: 'أهلاً بك، الشحن يستغرق من يومين إلى 3 أيام عمل',
      type: 'TEXT',
      isFromCustomer: false,
      createdAt: '2026-10-23T19:31:00Z',
      user: null, // bot message
    },
  ],
  notes: [
    {
      id: 'note-1',
      content: 'العميل مهتم بعروض نهاية الشهر',
      type: 'INTERNAL',
      createdAt: '2026-10-23T19:35:00Z',
      author: { id: 'u1', firstName: 'منى', lastName: 'حسين', avatar: null },
    },
  ],
  conversationTags: [
    { id: 'tag-1', tag: 'شحن_سريع', color: '#3b82f6' },
  ],
  assignedUser: {
    id: 'u1',
    firstName: 'منى',
    lastName: 'حسين',
    avatar: null,
    department: 'الدعم الفني',
  },
  availableModerators: [],
  flags: {
    detectedLanguage: 'ar',
    detectedCountry: 'EG',
    detectedDepartment: 'SUPPORT',
    ownerLock: {},
    sla: {},
  },
  canTransfer: false,
  window: {
    isOpen: true,
    remainingSeconds: 3600,
    remainingLabel: '1 س',
    windowExpiresAt: '2026-10-23T21:00:00Z',
  },
};

describe('WhatsAppChat Component (whatsapp-inbox)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/conversations/conv-123')) {
        return Promise.resolve({
          data: {
            success: true,
            conversation: mockConversation,
          },
        });
      }
      if (url.includes('/customers/cust-456/orders')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'ord-1', orderNumber: '1001', status: 'DELIVERED', total: 450 },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders chat header with customer info, window timer, and AI badge', async () => {
    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const names = screen.getAllByText('محمود عبد الرحمن');
      expect(names.length).toBeGreaterThanOrEqual(1);
    });

    const phones = screen.getAllByText('+201011223344');
    expect(phones.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('1 س')).toBeInTheDocument();
  });

  it('renders message stream with incoming and outgoing bot responses', async () => {
    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('السلام عليكم، عندي استفسار بخصوص الشحن')).toBeInTheDocument();
    });

    expect(screen.getByText('أهلاً بك، الشحن يستغرق من يومين إلى 3 أيام عمل')).toBeInTheDocument();
    expect(screen.getByText('رد تلقائي من الوكيل')).toBeInTheDocument();
  });

  it('sends outgoing message when clicking send button', async () => {
    (apiClient.post as any).mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/رد كمالك المحادثة|reply/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/رد كمالك المحادثة|reply/i);
    fireEvent.change(input, { target: { value: 'شكراً جزيلاً' } });

    const sendBtn = screen.getByRole('button', { name: /إرسال الرد|Send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.objectContaining({ content: 'شكراً جزيلاً', type: 'TEXT' }),
      );
    });
  });

  it('navigates back to routing inbox when clicking back button', async () => {
    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/رجوع|Back/i)).toBeInTheDocument();
    });

    const backBtn = screen.getByText(/رجوع|Back/i);
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/whatsapp/routing');
  });

  it('renders customer orders in details sidebar', async () => {
    render(
      <MemoryRouter>
        <WhatsAppChat />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/#1001/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/450 ج.م/i)).toBeInTheDocument();
  });
});
