/** @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import Conversations from "../Conversations";

// Mock socketService
vi.mock("../../../services/socketService", () => ({
  socketService: {
    isConnected: vi.fn(() => false),
    connect: vi.fn(),
    onMessage: vi.fn(),
    onConversationUpdated: vi.fn(),
    onNewConversation: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock useDateFormat
vi.mock("../../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: () => "2026-10-27",
  }),
}));

describe("Conversations Component (Modular)", () => {
  const mockConversations = [
    {
      id: "conv-1",
      customerName: "أحمد علي",
      lastMessage: "السلام عليكم، هل المنتج متوفر؟",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
      platform: "facebook",
      pageName: "صفحة تجريبية",
    },
    {
      id: "conv-2",
      customerName: "سارة محمد",
      lastMessage: "تم استلام الطلب شكراً",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      platform: "whatsapp",
    },
  ];

  const mockMessages = [
    {
      id: "msg-1",
      content: "السلام عليكم، هل المنتج متوفر؟",
      senderId: "cust-1",
      senderName: "أحمد علي",
      timestamp: new Date().toISOString(),
      type: "text",
      isFromCustomer: true,
      status: "read",
    },
    {
      id: "msg-2",
      content: "أهلاً بك يا فندم! نعم المنتج متوفر وجاهز للشحن.",
      senderId: "agent-1",
      senderName: "الدعم الفني",
      timestamp: new Date().toISOString(),
      type: "text",
      isFromCustomer: false,
      status: "sent",
    },
  ];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url: string, options?: any) => {
      if (url.includes("conversations/conv-1/messages")) {
        if (options?.method === "POST") {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                id: "msg-3",
                content: JSON.parse(options.body).message,
                timestamp: new Date().toISOString(),
                isFromCustomer: false,
              },
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockMessages }),
        });
      }

      if (url.includes("conversations/conv-1/read")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        });
      }

      if (url.includes("conversations")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockConversations }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders conversations list and empty chat placeholder initially", async () => {
    render(<Conversations />);

    await waitFor(() => {
      expect(screen.getByText("المحادثات")).toBeInTheDocument();
    });

    expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    expect(screen.getByText("سارة محمد")).toBeInTheDocument();
    expect(screen.getByText("اختر محادثة للبدء")).toBeInTheDocument();
    expect(screen.getByText("جاهز للمحادثة")).toBeInTheDocument();
  });

  it("filters conversations by search query", async () => {
    render(<Conversations />);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("البحث في المحادثات...");
    fireEvent.change(searchInput, { target: { value: "سارة" } });

    expect(screen.queryByText("أحمد علي")).not.toBeInTheDocument();
    expect(screen.getByText("سارة محمد")).toBeInTheDocument();
  });

  it("selects a conversation, loads messages, and displays active chat header", async () => {
    render(<Conversations />);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("أحمد علي"));

    await waitFor(() => {
      expect(screen.getAllByText("السلام عليكم، هل المنتج متوفر؟").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("أهلاً بك يا فندم! نعم المنتج متوفر وجاهز للشحن.")).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("اكتب رسالتك هنا...")).toBeInTheDocument();
  });

  it("sends a new message successfully", async () => {
    render(<Conversations />);

    await waitFor(() => {
      expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("أحمد علي"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("اكتب رسالتك هنا...")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("اكتب رسالتك هنا...");
    fireEvent.change(textarea, { target: { value: "تمام، سيتم الشحن اليوم" } });

    const sendButton = screen.getByLabelText("إرسال الرسالة");
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("conversations/conv-1/messages"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("refreshes conversations when manual refresh button is clicked", async () => {
    render(<Conversations />);

    await waitFor(() => {
      expect(screen.getByTitle("تحديث المحادثات")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle("تحديث المحادثات");
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("conversations"),
      );
    });
  });
});
