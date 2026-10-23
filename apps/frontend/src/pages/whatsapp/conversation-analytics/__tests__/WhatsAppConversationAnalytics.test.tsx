/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import WhatsAppConversationAnalytics from "../../WhatsAppConversationAnalytics";
import { apiClient } from "../../../../services/apiClient";

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: {
        dir: () => "rtl",
        language: "ar",
      },
      t: (key: string) => key,
    }),
  };
});

vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container" style={{ width: 400, height: 260 }}>
        {children}
      </div>
    ),
  };
});

describe("WhatsAppConversationAnalytics", () => {
  const mockAnalyticsResponse = {
    success: true,
    period: { start: "2026-09-24", end: "2026-10-23" },
    summary: {
      totalConversations: 142,
      totalMessages: 1200,
      incomingMessages: 520,
      outgoingMessages: 680,
      manualOutgoing: 400,
      broadcastOutgoing: 180,
      autoOutgoing: 100,
      avgMessagesPerConversation: 8.4,
      assignedCount: 110,
      unassignedCount: 32,
      waitingForReply: 15,
      awaitingCustomer: 85,
      totalUnread: 12,
      conversationsWithUnread: 8,
      avgResponseTimeMs: 180000,
      avgResponseTimeMin: 3.0,
    },
    statusDistribution: {
      NEW: 25,
      ASSIGNED: 40,
      PENDING: 15,
      CLOSED: 58,
      ARCHIVED: 4,
    },
    hourlyDistribution: [0, 0, 0, 0, 0, 5, 12, 35, 60, 95, 110, 80, 75, 90, 85, 70, 55, 40, 25, 15, 10, 5, 2, 0],
    dailyDistribution: [
      { date: "2026-10-20", incoming: 45, outgoing: 60, conversations: 20 },
      { date: "2026-10-21", incoming: 50, outgoing: 70, conversations: 24 },
      { date: "2026-10-22", incoming: 60, outgoing: 85, conversations: 28 },
    ],
    tagDistribution: [
      { tag: "VIP Customer", count: 42 },
      { tag: "Inquiry", count: 35 },
    ],
    recentConversations: [
      {
        id: "conv-1",
        status: "NEW",
        assignedUserId: "usr-1",
        lastMessageAt: "2026-10-23T10:30:00Z",
        lastMessageIsFromCustomer: true,
        unreadCount: 2,
        messageCount: 6,
      },
      {
        id: "conv-2",
        status: "CLOSED",
        assignedUserId: null,
        lastMessageAt: "2026-10-23T09:15:00Z",
        lastMessageIsFromCustomer: false,
        unreadCount: 0,
        messageCount: 12,
      },
    ],
    userMap: {
      "usr-1": "سارة أحمد",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({ data: mockAnalyticsResponse });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <WhatsAppConversationAnalytics companyId="comp-1" />
      </MemoryRouter>
    );

  it("renders page header, preset buttons, and resolves hero metrics", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("تحليل المحادثات")).toBeInTheDocument();
    });

    // Check Hero Card labels
    expect(screen.getByText("إجمالي المحادثات")).toBeInTheDocument();
    expect(screen.getByText("رسائل واردة")).toBeInTheDocument();
    expect(screen.getByText("رسائل صادرة")).toBeInTheDocument();
    expect(screen.getByText("متوسط الرد")).toBeInTheDocument();

    // Check Values
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("520")).toBeInTheDocument();
    expect(screen.getByText("680")).toBeInTheDocument();
    expect(screen.getByText("3 د")).toBeInTheDocument();
  });

  it("renders outgoing breakdown card with manual, broadcast, and auto stats", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("تفصيل الرسائل الصادرة")).toBeInTheDocument();
    });

    expect(screen.getByText("يدوي (ردود)")).toBeInTheDocument();
    expect(screen.getByText("برودكاست")).toBeInTheDocument();
    expect(screen.getByText("تلقائي (فلو + AI)")).toBeInTheDocument();

    expect(screen.getByText("400")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    // Operational queue counters
    expect(screen.getByText("بانتظار رد الفريق")).toBeInTheDocument();
    expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("بانتظار رد العميل")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders status distribution and recent conversations table", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("توزيع الحالات")).toBeInTheDocument();
    });

    expect(screen.getByText("آخر المحادثات")).toBeInTheDocument();
    expect(screen.getByText("سارة أحمد")).toBeInTheDocument();
    expect(screen.getByText("VIP Customer")).toBeInTheDocument();
  });

  it("triggers data reload when clicking a date preset button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("تحليل المحادثات")).toBeInTheDocument();
    });

    const todayBtn = screen.getByRole("button", { name: "اليوم" });
    fireEvent.click(todayBtn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
