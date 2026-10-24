/** @vitest-environment jsdom */

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatRightPanel from '../../ChatRightPanel';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

vi.mock('@/components/orders/EnhancedOrderModal', () => ({
  default: () => null,
}));

vi.mock('../../../../returns/ReturnDetailsModal', () => ({
  default: () => null,
}));

vi.mock('../ChatRightPanelOrderModals', () => ({
  ChatRightPanelOrderModals: () => null,
}));

vi.mock('../../../../../contexts/CompanyContext', () => ({
  useCompany: () => ({
    company: { id: 'comp-1', name: 'Test Co' },
  }),
}));

vi.mock('../../../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

vi.mock('../../../../../services/customerService', () => ({
  customerService: {
    getDistinctTags: vi.fn().mockResolvedValue([]),
    getTagSuggestions: vi.fn().mockReturnValue([]),
    updateCustomerTags: vi.fn().mockResolvedValue({ success: true }),
  },
}));

const mockCustomerData = {
  id: 'cust-1',
  name: 'محمود حسن',
  phone: '01012345678',
  email: 'mahmoud@example.com',
  city: 'القاهرة',
  country: 'مصر',
  tags: ['VIP', 'دائم'],
  status: 'VIP',
};

const mockOrdersData = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-123456',
    status: 'DELIVERED',
    total: 1250,
    createdAt: '2026-10-20T10:00:00Z',
    items: [{ id: 'i-1' }, { id: 'i-2' }],
    type: 'STORE',
  },
  {
    id: 'ord-2',
    orderNumber: 'SRV-987654',
    status: 'PROCESSING',
    total: 800,
    paid: 400,
    createdAt: '2026-10-22T14:00:00Z',
    serviceName: 'صيانة فورية',
    type: 'SERVICE',
  },
];

const mockActivitiesData = [
  {
    id: 'act-1',
    description: 'تم تسجيل زيارة للمتجر',
    createdAt: '2026-10-24T08:00:00Z',
  },
];

const mockLoadCustomerData = vi.fn();
const mockResetCustomer = vi.fn();
const mockUpdateCustomerPhone = vi.fn().mockResolvedValue({ success: true });
const mockUpdateCustomerPhone2 = vi.fn().mockResolvedValue({ success: true });
const mockCalculateLTV = vi.fn().mockReturnValue(2050);

vi.mock('../../../../../hooks/inbox/useCustomerProfile', () => ({
  useCustomerProfile: () => ({
    customer: mockCustomerData,
    orders: mockOrdersData,
    activities: mockActivitiesData,
    loading: false,
    loadCustomerData: mockLoadCustomerData,
    resetCustomer: mockResetCustomer,
    updateCustomerPhone: mockUpdateCustomerPhone,
    updateCustomerPhone2: mockUpdateCustomerPhone2,
    calculateLTV: mockCalculateLTV,
  }),
}));

const mockContact: Contact = {
  id: 'c-1',
  jid: '201012345678@s.whatsapp.net',
  name: 'محمود حسن',
  customer: {
    id: 'cust-1',
    name: 'محمود حسن',
    phone: '01012345678',
    status: 'VIP',
  },
  unreadCount: 0,
  isGroup: false,
  lastMessageAt: '2026-10-24T09:00:00Z',
};

describe('ChatRightPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders placeholder when contact is null', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <ChatRightPanel
          contact={null}
          onOpenOrder={vi.fn()}
          onOpenTasks={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('معلومات جهة الاتصال')).toBeInTheDocument();
    expect(screen.getByText('اختر محادثة لعرض بيانات العميل والطلبات')).toBeInTheDocument();
  });

  it('renders contact details, tabs, and tags when contact is provided', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <ChatRightPanel
          contact={mockContact}
          onOpenOrder={vi.fn()}
          onOpenTasks={vi.fn()}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('محمود حسن')).toBeInTheDocument();
    expect(screen.getByText('عميل مميز')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('دائم')).toBeInTheDocument();
    expect(screen.getByText('+20 101 234 5678')).toBeInTheDocument();
    expect(screen.getByText('mahmoud@example.com')).toBeInTheDocument();
  });

  it('switches to Orders tab and renders orders and service order badges', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <ChatRightPanel
          contact={mockContact}
          onOpenOrder={vi.fn()}
          onOpenServiceOrder={vi.fn()}
          onOpenTasks={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /الطلبات/ }));

    expect(screen.getByText('#ORD-123456')).toBeInTheDocument();
    expect(screen.getByText('#SRV-987654')).toBeInTheDocument();
    expect(screen.getByText('خدمة')).toBeInTheDocument();
    expect(screen.getByText('صيانة فورية')).toBeInTheDocument();
    expect(screen.getByText('1,250 ج.م')).toBeInTheDocument();
  });

  it('switches to Activity tab and renders timeline', () => {
    render(
      <QueryClientProvider client={mockQueryClient}>
        <ChatRightPanel
          contact={mockContact}
          onOpenOrder={vi.fn()}
          onOpenTasks={vi.fn()}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByText('النشاط'));

    expect(screen.getByText('تم تسجيل زيارة للمتجر')).toBeInTheDocument();
  });
});
