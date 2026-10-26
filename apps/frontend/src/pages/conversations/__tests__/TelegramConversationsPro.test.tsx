// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

import { Conversation, Message } from "../telegram-conversations-pro/types";
import { TelegramConversationsSidebar } from "../telegram-conversations-pro/TelegramConversationsSidebar";
import { TelegramChatHeader } from "../telegram-conversations-pro/TelegramChatHeader";
import { TelegramMediaGalleryDrawer } from "../telegram-conversations-pro/TelegramMediaGalleryDrawer";
import { TelegramMessagesList } from "../telegram-conversations-pro/TelegramMessagesList";
import { TelegramInputBar } from "../telegram-conversations-pro/TelegramInputBar";
import { TelegramUserInfoPanel } from "../telegram-conversations-pro/TelegramUserInfoPanel";
import { TelegramEmptyChat } from "../telegram-conversations-pro/TelegramEmptyChat";

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    customerId: "tg_12345",
    customerName: "Mahmoud Hassan",
    lastMessage: "السلام عليكم، هل المنتج متاح؟",
    lastMessageTime: new Date("2026-10-26T12:00:00Z"),
    unreadCount: 2,
    platform: "telegram",
    isOnline: true,
    messages: [],
    aiEnabled: true,
  },
  {
    id: "conv-2",
    customerId: "tg_67890",
    customerName: "Sara Ahmed",
    lastMessage: "شكراً تم استلام الطلب",
    lastMessageTime: new Date("2026-10-26T11:30:00Z"),
    unreadCount: 0,
    platform: "telegram",
    isOnline: false,
    messages: [],
    aiEnabled: false,
  },
];

const mockMessages: Message[] = [
  {
    id: "msg-1",
    content: "السلام عليكم، هل المنتج متاح؟",
    senderId: "tg_12345",
    senderName: "Customer",
    timestamp: new Date("2026-10-26T12:00:00Z"),
    type: "text",
    isFromCustomer: true,
    status: "read",
    conversationId: "conv-1",
  },
  {
    id: "msg-2",
    content: "أهلاً بك يا فندم، نعم متاح بجميع المقاسات",
    senderId: "agent-1",
    senderName: "Agent",
    timestamp: new Date("2026-10-26T12:01:00Z"),
    type: "text",
    isFromCustomer: false,
    status: "delivered",
    conversationId: "conv-1",
  },
  {
    id: "msg-3",
    content: "",
    senderId: "tg_12345",
    senderName: "Customer",
    timestamp: new Date("2026-10-26T12:02:00Z"),
    type: "image",
    fileUrl: "/uploads/sample-item.png",
    isFromCustomer: true,
    status: "read",
    conversationId: "conv-1",
  },
];

describe("TelegramConversationsSidebar", () => {
  it("renders conversation list and handles search and selection", () => {
    const onSelect = vi.fn();
    const setSearchQuery = vi.fn();

    render(
      <TelegramConversationsSidebar
        isRTL={true}
        searchQuery=""
        setSearchQuery={setSearchQuery}
        loading={false}
        filteredConversations={mockConversations}
        selectedConversationId="conv-1"
        onSelectConversation={onSelect}
      />,
    );

    expect(screen.getByText("محادثات تيليجرام")).toBeDefined();
    expect(screen.getByText("Mahmoud Hassan")).toBeDefined();
    expect(screen.getByText("Sara Ahmed")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined(); // unread count

    const searchInput = screen.getByPlaceholderText("بحث في المحادثات...");
    fireEvent.change(searchInput, { target: { value: "Mahmoud" } });
    expect(setSearchQuery).toHaveBeenCalledWith("Mahmoud");

    fireEvent.click(screen.getByText("Sara Ahmed"));
    expect(onSelect).toHaveBeenCalledWith("conv-2");
  });
});

describe("TelegramChatHeader", () => {
  it("renders active conversation details and handles toggles", () => {
    const onToggleAi = vi.fn();
    const onToggleChatSearch = vi.fn();
    const onToggleMediaGallery = vi.fn();
    const onToggleInfo = vi.fn();

    render(
      <TelegramChatHeader
        activeConversation={mockConversations[0]}
        isRTL={true}
        isTyping={true}
        isInfoOpen={true}
        showMediaGallery={false}
        chatSearchQuery=""
        onToggleAi={onToggleAi}
        onToggleChatSearch={onToggleChatSearch}
        onToggleMediaGallery={onToggleMediaGallery}
        onToggleInfo={onToggleInfo}
      />,
    );

    expect(screen.getByText("Mahmoud Hassan")).toBeDefined();
    expect(screen.getByText("مشترك بوت")).toBeDefined();
    expect(screen.getByText("يكتب...")).toBeDefined();

    const aiBtn = screen.getByTitle("إيقاف الرد الآلي");
    fireEvent.click(aiBtn);
    expect(onToggleAi).toHaveBeenCalled();

    const searchBtn = screen.getByTitle("بحث في المحادثة");
    fireEvent.click(searchBtn);
    expect(onToggleChatSearch).toHaveBeenCalled();
  });
});

describe("TelegramMediaGalleryDrawer", () => {
  it("renders media gallery thumbnails and search input", () => {
    const setChatSearchQuery = vi.fn();
    render(
      <TelegramMediaGalleryDrawer
        isRTL={true}
        chatSearchQuery="متاح"
        setChatSearchQuery={setChatSearchQuery}
        showMediaGallery={true}
        mediaMessages={[mockMessages[2]]}
      />,
    );

    expect(screen.getByText("الوسائط المشتركة")).toBeDefined();
    const searchInput = screen.getByDisplayValue("متاح");
    expect(searchInput).toBeDefined();
  });
});

describe("TelegramMessagesList", () => {
  it("renders messages with text and media attachments", () => {
    const onReply = vi.fn();
    const messagesEndRef = { current: null };

    render(
      <TelegramMessagesList
        messages={mockMessages}
        filteredMessages={mockMessages}
        isRTL={true}
        messagesEndRef={messagesEndRef}
        onReply={onReply}
        onForward={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("السلام عليكم، هل المنتج متاح؟")).toBeDefined();
    expect(
      screen.getByText("أهلاً بك يا فندم، نعم متاح بجميع المقاسات"),
    ).toBeDefined();
  });
});

describe("TelegramInputBar", () => {
  it("handles text input, enter key send, and file menu toggle", () => {
    const setInputText = vi.fn();
    const onSendMessage = vi.fn();
    const setShowFileMenu = vi.fn();

    render(
      <TelegramInputBar
        isRTL={true}
        inputText="شكراً جزيلاً"
        setInputText={setInputText}
        replyingTo={null}
        setReplyingTo={vi.fn()}
        editingMessage={null}
        setEditingMessage={vi.fn()}
        showFileMenu={false}
        setShowFileMenu={setShowFileMenu}
        fileInputRef={{ current: null }}
        videoInputRef={{ current: null }}
        audioInputRef={{ current: null }}
        documentInputRef={{ current: null }}
        onSendMessage={onSendMessage}
        onEditMessage={vi.fn()}
        onFileSelect={vi.fn()}
        onSendLocation={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText("اكتب رسالة...");
    expect(input).toBeDefined();

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(onSendMessage).toHaveBeenCalled();

    const attachBtn = screen.getByTitle("إرفاق ملف");
    fireEvent.click(attachBtn);
    expect(setShowFileMenu).toHaveBeenCalledWith(true);
  });
});

describe("TelegramUserInfoPanel", () => {
  it("renders customer profile info and triggers delete", () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();

    render(
      <TelegramUserInfoPanel
        activeConversation={mockConversations[0]}
        isRTL={true}
        onClose={onClose}
        mediaMessages={[]}
        onDeleteConversation={onDelete}
      />,
    );

    expect(screen.getByText("معلومات المستخدم")).toBeDefined();
    expect(screen.getByText("@mahmoudhassan")).toBeDefined();
    expect(screen.getByText("tg_12345")).toBeDefined();

    const delBtn = screen.getByText("حذف المحادثة");
    fireEvent.click(delBtn);
    expect(onDelete).toHaveBeenCalled();
  });
});

describe("TelegramEmptyChat", () => {
  it("renders placeholder when no chat is selected", () => {
    render(<TelegramEmptyChat isRTL={true} />);
    expect(screen.getByText("اختر محادثة للبدء")).toBeDefined();
  });
});
