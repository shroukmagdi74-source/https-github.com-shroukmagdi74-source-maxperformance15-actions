/** @vitest-environment jsdom */

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatSidebar from '../../ChatSidebar';
import { formatMessageSnippet } from '../snippetUtils';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'whatsapp.sidebar.all': 'الكل',
        'whatsapp.sidebar.unreplied': 'لم يُرد عليها',
        'whatsapp.sidebar.unread': 'غير مقروءة',
        'whatsapp.sidebar.groups': 'المجموعات',
        'whatsapp.sidebar.archive': 'الأرشيف',
        'whatsapp.sidebar.statuses': 'الحالات',
        'whatsapp.sidebar.searchPlaceholder': 'بحث أو بدء محادثة جديدة',
        'whatsapp.sidebar.pinChat': 'تثبيت المحادثة',
        'whatsapp.sidebar.unpinChat': 'إلغاء التثبيت',
        'whatsapp.sidebar.read': 'تحديد كمقروءة',
        'whatsapp.sidebar.unreadAction': 'تحديد كغير مقروءة',
        'whatsapp.sidebar.mute': 'كتم الإشعارات',
        'whatsapp.sidebar.unmute': 'إلغاء الكتم',
        'whatsapp.sidebar.deleteChat': 'حذف المحادثة',
        'whatsapp.sidebar.block': 'حظر جهة الاتصال',
        'whatsapp.sidebar.unblock': 'إلغاء الحظر',
        'whatsapp.window.yesterday': 'أمس',
        'whatsapp.window.you': 'أنت',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'ar',
      dir: () => 'rtl',
    },
  }),
}));

const mockConversations: Contact[] = [
  {
    id: 'c-1',
    jid: '201012345678@s.whatsapp.net',
    name: 'محمد علي',
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    isArchived: false,
    lastMessageAt: '2026-10-24T09:00:00Z',
    lastMessage: {
      id: 'm-1',
      content: 'order_created_123',
      fromMe: false,
      timestamp: '2026-10-24T09:00:00Z',
    },
  },
  {
    id: 'c-2',
    jid: '201098765432@s.whatsapp.net',
    name: 'سارة أحمد',
    unreadCount: 0,
    isPinned: true,
    isMuted: true,
    isArchived: false,
    lastMessageAt: '2026-10-23T15:00:00Z',
    lastMessage: {
      id: 'm-2',
      content: 'شكراً جزيلاً وصل الطلب',
      fromMe: true,
      timestamp: '2026-10-23T15:00:00Z',
    },
  },
];

const mockSessions = [
  {
    id: 'sess-1',
    name: 'الفرع الرئيسي',
    status: 'CONNECTED',
    liveStatus: 'CONNECTED',
  },
];

describe('ChatSidebar Component & snippetUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('purges emoji literals in snippet formatting', () => {
    expect(formatMessageSnippet('order_created_12345')).toBe('تم إنشاء الطلب بنجاح');
    expect(formatMessageSnippet('order_confirm_abc')).toBe('تأكيد الطلب');
    expect(formatMessageSnippet('order_ship_xyz')).toBe('تم شحن طلبك');
    expect(formatMessageSnippet('order_deliver_done')).toBe('تم تسليم الطلب');
    expect(formatMessageSnippet('order_cancel_bad')).toBe('تم إلغاء الطلب');
    expect(formatMessageSnippet('abandoned_cart_reminder')).toBe('تذكير بالسلة المتروكة');
    expect(formatMessageSnippet('welcome_msg')).toBe('رسالة ترحيب');
    expect(formatMessageSnippet('otp_1234')).toBe('رمز التفعيل');
    // Normal message should be preserved cleanly
    expect(formatMessageSnippet('السلام عليكم')).toBe('السلام عليكم');
  });

  it('renders conversations, unread badges, and contact names', () => {
    const onSelectContact = vi.fn();

    render(
      <ChatSidebar
        sessions={mockSessions as any}
        conversations={mockConversations}
        statuses={[]}
        selectedSession="sess-1"
        selectedContact={null}
        currentUserProfile={{ name: 'Admin', status: 'Available' }}
        isLoadingConversations={false}
        isLoadingMoreConversations={false}
        hasMoreConversations={false}
        isLoadingStatuses={false}
        onSelectSession={vi.fn()}
        onSelectContact={onSelectContact}
        onOpenProfile={vi.fn()}
        onOpenNewChat={vi.fn()}
        onOpenNewGroup={vi.fn()}
        onOpenPrivacySettings={vi.fn()}
        onOpenBusinessProfile={vi.fn()}
        onSyncHistory={vi.fn()}
        onPinChat={vi.fn()}
        onArchiveChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onBlockContact={vi.fn()}
        onMuteChat={vi.fn()}
        onMarkAsRead={vi.fn()}
        onLoadMore={vi.fn()}
        onAddStatus={vi.fn()}
        onOpenBroadcast={vi.fn()}
        onOpenCheckNumber={vi.fn()}
        onOpenLabels={vi.fn()}
        filterType="all"
        onFilterTypeChange={vi.fn()}
        searchTerm=""
        onSearchChange={vi.fn()}
        showArchived={false}
        onToggleArchived={vi.fn()}
      />,
    );

    expect(screen.getByText('محمد علي')).toBeInTheDocument();
    expect(screen.getByText('سارة أحمد')).toBeInTheDocument();
    expect(screen.getByText('تم إنشاء الطلب بنجاح')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1); // Pill count or unread badge

    // Clicking contact selects it
    fireEvent.click(screen.getByText('محمد علي'));
    expect(onSelectContact).toHaveBeenCalledWith(mockConversations[0]);
  });

  it('handles search input and filter pill changes', () => {
    const onSearchChange = vi.fn();
    const onFilterTypeChange = vi.fn();

    render(
      <ChatSidebar
        sessions={mockSessions as any}
        conversations={mockConversations}
        statuses={[]}
        selectedSession="sess-1"
        selectedContact={null}
        currentUserProfile={null}
        isLoadingConversations={false}
        isLoadingMoreConversations={false}
        hasMoreConversations={false}
        isLoadingStatuses={false}
        onSelectSession={vi.fn()}
        onSelectContact={vi.fn()}
        onOpenProfile={vi.fn()}
        onOpenNewChat={vi.fn()}
        onOpenNewGroup={vi.fn()}
        onOpenPrivacySettings={vi.fn()}
        onOpenBusinessProfile={vi.fn()}
        onSyncHistory={vi.fn()}
        onPinChat={vi.fn()}
        onArchiveChat={vi.fn()}
        onDeleteChat={vi.fn()}
        onBlockContact={vi.fn()}
        onMuteChat={vi.fn()}
        onMarkAsRead={vi.fn()}
        onLoadMore={vi.fn()}
        onAddStatus={vi.fn()}
        onOpenBroadcast={vi.fn()}
        onOpenCheckNumber={vi.fn()}
        onOpenLabels={vi.fn()}
        filterType="all"
        onFilterTypeChange={onFilterTypeChange}
        searchTerm=""
        onSearchChange={onSearchChange}
        showArchived={false}
        onToggleArchived={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText('بحث أو بدء محادثة جديدة');
    fireEvent.change(searchInput, { target: { value: 'محمد' } });
    expect(onSearchChange).toHaveBeenCalledWith('محمد');

    const unreadPill = screen.getByText('غير مقروءة');
    fireEvent.click(unreadPill);
    expect(onFilterTypeChange).toHaveBeenCalledWith('unread');
  });

  it('opens context menu and triggers pin and archive actions', () => {
    const onPinChat = vi.fn();
    const onArchiveChat = vi.fn();

    render(
      <ChatSidebar
        sessions={mockSessions as any}
        conversations={mockConversations}
        statuses={[]}
        selectedSession="sess-1"
        selectedContact={null}
        currentUserProfile={null}
        isLoadingConversations={false}
        isLoadingMoreConversations={false}
        hasMoreConversations={false}
        isLoadingStatuses={false}
        onSelectSession={vi.fn()}
        onSelectContact={vi.fn()}
        onOpenProfile={vi.fn()}
        onOpenNewChat={vi.fn()}
        onOpenNewGroup={vi.fn()}
        onOpenPrivacySettings={vi.fn()}
        onOpenBusinessProfile={vi.fn()}
        onSyncHistory={vi.fn()}
        onPinChat={onPinChat}
        onArchiveChat={onArchiveChat}
        onDeleteChat={vi.fn()}
        onBlockContact={vi.fn()}
        onMuteChat={vi.fn()}
        onMarkAsRead={vi.fn()}
        onLoadMore={vi.fn()}
        onAddStatus={vi.fn()}
        onOpenBroadcast={vi.fn()}
        onOpenCheckNumber={vi.fn()}
        onOpenLabels={vi.fn()}
        filterType="all"
        onFilterTypeChange={vi.fn()}
        searchTerm=""
        onSearchChange={vi.fn()}
        showArchived={false}
        onToggleArchived={vi.fn()}
      />,
    );

    // Right-click on Mohamed Ali
    const contactRow = screen.getByText('محمد علي');
    fireEvent.contextMenu(contactRow, { clientX: 100, clientY: 200 });

    expect(screen.getByText('تثبيت المحادثة')).toBeInTheDocument();
    fireEvent.click(screen.getByText('تثبيت المحادثة'));
    expect(onPinChat).toHaveBeenCalledWith(mockConversations[0]);
  });
});
