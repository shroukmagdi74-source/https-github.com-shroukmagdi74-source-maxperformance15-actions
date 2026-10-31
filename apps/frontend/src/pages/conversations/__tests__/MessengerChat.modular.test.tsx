// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  MessengerConversationsSidebar,
  MessengerChatHeader,
  MessengerMessageList,
  MessengerMessageInput,
  MessengerDeleteModal,
  buildMockMessages,
  buildMockCustomerProfile,
  isMockConversation,
  Conversation,
  Message,
} from "../messenger-chat";
import MessengerChat from "../MessengerChat-final";

// Mock apiService
vi.mock("../../../services/apiService", () => ({
  default: {
    getConversations: vi.fn().mockResolvedValue([]),
    getMessages: vi.fn().mockResolvedValue([]),
    getSavedReplies: vi.fn().mockResolvedValue([]),
    getCustomerProfile: vi.fn().mockResolvedValue(null),
    updateConversation: vi.fn().mockResolvedValue({}),
    deleteConversation: vi.fn().mockResolvedValue({}),
  },
}));

// Mock LinkifiedText
vi.mock("../../../components/common/LinkifiedText", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

// Mock SavedReplies
vi.mock("../../../components/conversations/SavedReplies", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="saved-replies-modal">
      <button onClick={onClose}>إغلاق الردود</button>
    </div>
  ),
}));

// Mock CustomerProfile
vi.mock("../../../components/conversations/CustomerProfile", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="customer-profile-modal">
      <button onClick={onClose}>إغلاق الملف</button>
    </div>
  ),
}));

const mockConversation: Conversation = {
  id: "conv-101",
  customerId: "cust-101",
  customerName: "محمود حسن",
  lastMessage: "هل يتوفر شحن للإسكندرية؟",
  lastMessageTime: new Date("2026-10-30T10:00:00Z"),
  status: "active",
  unreadCount: 1,
  platform: "facebook",
  pageName: "متجر الأزياء",
  isOnline: true,
  aiEnabled: true,
  messages: [],
};

const mockMessages: Message[] = [
  {
    id: "m-1",
    content: "السلام عليكم، هل المقاس متوفر؟",
    senderId: "cust-101",
    senderName: "محمود حسن",
    timestamp: new Date("2026-10-30T10:00:00Z"),
    type: "text",
    isFromCustomer: true,
    status: "read",
    conversationId: "conv-101",
  },
  {
    id: "m-2",
    content: "أهلاً بك يا فندم! نعم متوفر بجميع المقاسات.",
    senderId: "agent-1",
    senderName: "المندوب",
    timestamp: new Date("2026-10-30T10:02:00Z"),
    type: "text",
    isFromCustomer: false,
    status: "sent",
    conversationId: "conv-101",
  },
];

describe("MessengerChat Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Helper Functions", () => {
    it("buildMockMessages returns initial customer message", () => {
      const msgs = buildMockMessages(mockConversation);
      expect(msgs).toHaveLength(1);
      expect(msgs[0].content).toBe("هل يتوفر شحن للإسكندرية؟");
      expect(msgs[0].isFromCustomer).toBe(true);
    });

    it("buildMockCustomerProfile returns fallback customer profile", () => {
      const profile = buildMockCustomerProfile("cust-101", "محمود حسن");
      expect(profile.id).toBe("cust-101");
      expect(profile.name).toBe("محمود حسن");
      expect(profile.phone).toBe("+201234567890");
    });

    it("isMockConversation correctly identifies mock IDs", () => {
      expect(isMockConversation(null)).toBe(false);
      expect(
        isMockConversation({
          ...mockConversation,
          id: "mock-conversation-1",
        }),
      ).toBe(true);
      expect(isMockConversation(mockConversation)).toBe(false);
    });
  });

  describe("MessengerConversationsSidebar", () => {
    it("renders conversations and triggers selection", () => {
      const onSelect = vi.fn();
      const onFilterChange = vi.fn();
      const onSearchChange = vi.fn();

      render(
        <MessengerConversationsSidebar
          conversations={[mockConversation]}
          selectedConversation={null}
          onSelectConversation={onSelect}
          loading={false}
          searchQuery=""
          onSearchQueryChange={onSearchChange}
          conversationFilter="all"
          onConversationFilterChange={onFilterChange}
        />,
      );

      expect(screen.getByText("المحادثات")).toBeDefined();
      expect(screen.getByText("محمود حسن")).toBeDefined();
      expect(screen.getByText("متجر الأزياء")).toBeDefined();
      expect(screen.getByText("هل يتوفر شحن للإسكندرية؟")).toBeDefined();

      fireEvent.click(screen.getByText("محمود حسن"));
      expect(onSelect).toHaveBeenCalledWith(mockConversation);

      fireEvent.click(screen.getByRole("button", { name: "نشط" }));
      expect(onFilterChange).toHaveBeenCalledWith("active");
    });
  });

  describe("MessengerChatHeader", () => {
    it("renders customer info and action triggers", () => {
      const onToggleAi = vi.fn();
      const onOpenProfile = vi.fn();
      const onOpenSavedReplies = vi.fn();
      const onTriggerUpload = vi.fn();
      const onRequestDelete = vi.fn();

      render(
        <MessengerChatHeader
          conversation={mockConversation}
          onToggleAi={onToggleAi}
          onOpenCustomerProfile={onOpenProfile}
          onOpenSavedReplies={onOpenSavedReplies}
          onTriggerFileUpload={onTriggerUpload}
          onRequestDelete={onRequestDelete}
        />,
      );

      expect(screen.getByText("محمود حسن")).toBeDefined();
      expect(screen.getByText("نشط الآن")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "تبديل الرد الآلي" }));
      expect(onToggleAi).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "ملف العميل" }));
      expect(onOpenProfile).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "الردود المحفوظة" }));
      expect(onOpenSavedReplies).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "إرفاق ملف" }));
      expect(onTriggerUpload).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "حذف المحادثة" }));
      expect(onRequestDelete).toHaveBeenCalled();
    });
  });

  describe("MessengerMessageList", () => {
    const dummyRef = { current: null } as React.RefObject<HTMLDivElement>;

    it("renders incoming and outgoing messages", () => {
      render(
        <MessengerMessageList
          messages={mockMessages}
          expandedMessages={new Set()}
          onToggleMessageExpansion={vi.fn()}
          typingUsers={[]}
          messagesContainerRef={dummyRef}
          messagesEndRef={dummyRef}
        />,
      );

      expect(screen.getByText("السلام عليكم، هل المقاس متوفر؟")).toBeDefined();
      expect(
        screen.getByText("أهلاً بك يا فندم! نعم متوفر بجميع المقاسات."),
      ).toBeDefined();
      expect(screen.getByText("✓")).toBeDefined();
    });
  });

  describe("MessengerMessageInput", () => {
    const dummyRef = { current: null } as React.RefObject<HTMLInputElement>;

    it("renders input and handles message submit", () => {
      const onSend = vi.fn();
      const onTextChange = vi.fn();
      const onOpenSavedReplies = vi.fn();

      render(
        <MessengerMessageInput
          newMessage="رسالة تجريبية جديدة"
          onNewMessageChange={onTextChange}
          onSendMessage={onSend}
          onOpenSavedReplies={onOpenSavedReplies}
          onFileUpload={vi.fn()}
          sending={false}
          fileInputRef={dummyRef}
        />,
      );

      expect(screen.getByDisplayValue("رسالة تجريبية جديدة")).toBeDefined();

      const sendBtn = screen.getByRole("button", { name: "إرسال الرسالة" });
      fireEvent.click(sendBtn);
      expect(onSend).toHaveBeenCalled();

      const savedBtn = screen.getByRole("button", { name: "الردود المحفوظة" });
      fireEvent.click(savedBtn);
      expect(onOpenSavedReplies).toHaveBeenCalled();
    });
  });

  describe("MessengerDeleteModal", () => {
    it("renders confirm delete modal and handles delete action", () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <MessengerDeleteModal
          isOpen={true}
          conversation={mockConversation}
          onClose={onClose}
          onConfirmDelete={onConfirm}
        />,
      );

      expect(screen.getByText("تأكيد الحذف")).toBeDefined();
      expect(
        screen.getByText(/هل أنت متأكد من حذف محادثة محمود حسن؟/),
      ).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "حذف" }));
      expect(onConfirm).toHaveBeenCalledWith(mockConversation);

      fireEvent.click(screen.getByRole("button", { name: "إلغاء" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("MessengerChat Coordinator Shell", () => {
    it("renders coordinator component cleanly", () => {
      render(<MessengerChat />);
      expect(screen.getByText("المحادثات")).toBeDefined();
    });
  });
});
