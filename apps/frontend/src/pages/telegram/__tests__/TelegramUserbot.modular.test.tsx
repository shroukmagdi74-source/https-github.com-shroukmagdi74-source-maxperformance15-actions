// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  UserbotHeader,
  UserbotSelectStep,
  UserbotChatList,
  UserbotChatArea,
  MediaMessage,
  buildChatReferencePayload,
  buildChatReferenceQuery,
  getMediaType,
  mediaCache,
} from "../telegram-userbot";
import TelegramUserbot from "../TelegramUserbot";

// Mock dependencies
vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "user-1", companyId: "comp-1" },
  }),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TelegramUserbot Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mediaCache.clear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Helper Functions", () => {
    it("buildChatReferencePayload formats correctly", () => {
      expect(buildChatReferencePayload(null)).toEqual({});
      const chat = {
        id: "12345",
        name: "Test Group",
        peerType: "channel",
        accessHash: "hash-abc",
        inputPeer: {
          className: "InputPeerChannel",
          channelId: "12345",
          accessHash: "hash-abc",
        },
        unreadCount: 0,
        lastMessage: "hello",
        date: 1700000000,
        isGroup: true,
        isUser: false,
        isChannel: true,
      };

      const payload = buildChatReferencePayload(chat);
      expect(payload).toEqual({
        chatId: "12345",
        peerType: "channel",
        accessHash: "hash-abc",
        inputPeer: chat.inputPeer,
      });
    });

    it("buildChatReferenceQuery serializes inputPeer object", () => {
      const chat = {
        id: "123",
        name: "User",
        inputPeer: { className: "InputPeerUser", userId: "123" },
        unreadCount: 0,
        lastMessage: "hi",
        date: 1700000000,
        isGroup: false,
        isUser: true,
        isChannel: false,
      };

      const query = buildChatReferenceQuery(chat);
      expect(query.chatId).toBe("123");
      expect(query.inputPeer).toBe(JSON.stringify(chat.inputPeer));
    });

    it("getMediaType correctly detects media types", () => {
      expect(getMediaType(null)).toBe("unknown");
      expect(getMediaType({ type: "MessageMediaPhoto" })).toBe("image");
      expect(getMediaType({ type: "MessageMediaVideo" })).toBe("video");
      expect(getMediaType({ type: "MessageMediaAudio" })).toBe("audio");
      expect(getMediaType({ type: "MessageMediaDocument" })).toBe("document");
      expect(getMediaType({ type: "MessageMediaWebPage" })).toBe("webpage");
    });
  });

  describe("UserbotHeader", () => {
    it("renders title and subtitle", () => {
      render(<UserbotHeader />);
      expect(screen.getByText("Telegram Userbot")).toBeDefined();
      expect(
        screen.getByText("Connect your personal Telegram account"),
      ).toBeDefined();
    });
  });

  describe("UserbotSelectStep", () => {
    it("renders empty state when no userbots exist", () => {
      render(<UserbotSelectStep userbots={[]} onSelectUserbot={vi.fn()} />);
      expect(
        screen.getByText("No Telegram Userbots connected yet."),
      ).toBeDefined();
      const settingsLink = screen.getByRole("link", {
        name: /Go to Settings to Connect/i,
      });
      expect(settingsLink.getAttribute("href")).toBe("/settings/telegram");
    });

    it("renders userbots list with connected status and triggers selection", () => {
      const onSelect = vi.fn();
      const mockBots = [
        {
          id: "bot-1",
          label: "Support Bot",
          clientPhone: "+201012345678",
          sessionString: "valid-session-string",
        },
      ];

      render(<UserbotSelectStep userbots={mockBots} onSelectUserbot={onSelect} />);

      expect(screen.getByText("Support Bot")).toBeDefined();
      expect(screen.getByText("+201012345678")).toBeDefined();
      expect(screen.getByText("Connected")).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: /Support Bot/i }));
      expect(onSelect).toHaveBeenCalledWith("bot-1", true);
    });

    it("renders warning when bots exist but none are connected", () => {
      const mockBots = [
        {
          id: "bot-unconnected",
          label: "Unconnected Bot",
          clientPhone: "+201099999999",
          sessionString: null,
        },
      ];

      render(<UserbotSelectStep userbots={mockBots} onSelectUserbot={vi.fn()} />);
      expect(
        screen.getByText("You have added Userbots but none are connected."),
      ).toBeDefined();
    });
  });

  describe("UserbotChatList", () => {
    const mockChats = [
      {
        id: "chat-1",
        name: "General Group",
        lastMessage: "Good morning",
        unreadCount: 3,
        date: 1700000000,
        isGroup: true,
        isUser: false,
        isChannel: false,
      },
      {
        id: "chat-2",
        name: "VIP Channel",
        lastMessage: "Daily update",
        unreadCount: 0,
        date: 1700000000,
        isGroup: false,
        isUser: false,
        isChannel: true,
      },
    ];

    it("renders chat items and handles selection", () => {
      const onSelectChat = vi.fn();
      const onRefresh = vi.fn();

      render(
        <UserbotChatList
          chats={mockChats}
          selectedChat={null}
          onSelectChat={onSelectChat}
          searchTerm=""
          onSearchChange={vi.fn()}
          onRefreshChats={onRefresh}
        />,
      );

      expect(screen.getByText("General Group")).toBeDefined();
      expect(screen.getByText("Good morning")).toBeDefined();
      expect(screen.getByText("3")).toBeDefined();

      fireEvent.click(screen.getByText("General Group"));
      expect(onSelectChat).toHaveBeenCalledWith(mockChats[0]);

      fireEvent.click(screen.getByRole("button", { name: "Refresh chats" }));
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe("UserbotChatArea", () => {
    const dummyRef = { current: null } as React.RefObject<HTMLDivElement>;

    it("renders placeholder when no chat is selected", () => {
      render(
        <UserbotChatArea
          selectedChat={null}
          selectedUserbot="bot-1"
          messages={[]}
          messageText=""
          onMessageTextChange={vi.fn()}
          onSendMessage={vi.fn()}
          onSendFile={vi.fn()}
          messagesEndRef={dummyRef}
        />,
      );

      expect(
        screen.getByText("Select a chat to view conversation"),
      ).toBeDefined();
    });

    it("renders messages and allows sending text", () => {
      const onSendMessage = vi.fn();
      const onMessageTextChange = vi.fn();
      const activeChat = {
        id: "chat-1",
        name: "Active Conversation",
        unreadCount: 0,
        lastMessage: "last msg",
        date: 1700000000,
        isGroup: false,
        isUser: true,
        isChannel: false,
      };
      const messages = [
        {
          id: "m1",
          text: "Incoming message from client",
          date: 1700000000,
          senderId: "cust-1",
          senderName: "Ahmed Ali",
          isOut: false,
          media: false,
        },
        {
          id: "m2",
          text: "Outgoing reply from userbot",
          date: 1700000010,
          senderId: "me",
          isOut: true,
          media: false,
        },
      ];

      render(
        <UserbotChatArea
          selectedChat={activeChat}
          selectedUserbot="bot-1"
          messages={messages}
          messageText="New message reply"
          onMessageTextChange={onMessageTextChange}
          onSendMessage={onSendMessage}
          onSendFile={vi.fn()}
          messagesEndRef={dummyRef}
        />,
      );

      expect(screen.getByText("Active Conversation")).toBeDefined();
      expect(screen.getByText("Ahmed Ali")).toBeDefined();
      expect(screen.getByText("Incoming message from client")).toBeDefined();
      expect(screen.getByText("Outgoing reply from userbot")).toBeDefined();

      const sendBtn = screen.getByRole("button", { name: "Send message" });
      fireEvent.click(sendBtn);
      expect(onSendMessage).toHaveBeenCalled();
    });
  });

  describe("MediaMessage Caching & Rendering", () => {
    it("renders cached image immediately without network fetch", () => {
      const activeChat = {
        id: "chat-1",
        name: "Active Chat",
        unreadCount: 0,
        lastMessage: "img",
        date: 1700000000,
        isGroup: false,
        isUser: true,
        isChannel: false,
      };

      mediaCache.set("bot-1-chat-1-msg-img-1", {
        blobUrl: "blob:http://localhost/test-img.jpg",
        mimeType: "image/jpeg",
        timestamp: Date.now(),
      });

      render(
        <MediaMessage
          msg={{
            id: "msg-img-1",
            text: "Look at this",
            date: 1700000000,
            senderId: "me",
            isOut: true,
            media: { type: "MessageMediaPhoto" },
          }}
          userbotId="bot-1"
          chat={activeChat}
        />,
      );

      const img = screen.getByRole("img", { name: "Media" });
      expect(img).toBeDefined();
      expect(img.getAttribute("src")).toBe("blob:http://localhost/test-img.jpg");
    });
  });

  describe("TelegramUserbot Coordinator Shell", () => {
    it("renders coordinator component cleanly", () => {
      render(<TelegramUserbot />);
      expect(screen.getByText("Telegram Userbot")).toBeDefined();
      expect(
        screen.getByText("Connect your personal Telegram account"),
      ).toBeDefined();
    });
  });
});
