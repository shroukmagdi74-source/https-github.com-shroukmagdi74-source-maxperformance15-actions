/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import WhatsAppEmployeeAnalytics from "../../WhatsAppEmployeeAnalytics";
import { apiClient } from "../../../../services/apiClient";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { dir: () => "rtl", language: "ar" },
      t: (key: string) => key,
    }),
  };
});

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock("../../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAnalyticsResponse = {
  success: true,
  period: { start: "2026-10-23", end: "2026-10-23" },
  summary: {
    totalIncomingConversations: 120,
    totalAssigned: 110,
    totalReplied: 95,
    totalUnreplied: 25,
    totalIncomingMessages: 450,
    totalOutgoingMessages: 620,
    overallResponseRate: 79.2,
    overallAvgResponseTimeMs: 180000,
    overallAvgResponseTimeMin: 3,
    activeEmployees: 3,
  },
  employees: [
    {
      userId: "emp-1",
      userName: "أحمد علي",
      userEmail: "ahmed@example.com",
      userImage: null,
      assignedConversations: 50,
      repliedConversations: 45,
      unrepliedConversations: 5,
      incomingMessages: 200,
      outgoingMessages: 300,
      responseRate: 90,
      avgResponseTimeMs: 120000,
      avgResponseTimeMin: 2,
    },
    {
      userId: "emp-2",
      userName: "سارة محمد",
      userEmail: "sara@example.com",
      userImage: null,
      assignedConversations: 40,
      repliedConversations: 35,
      unrepliedConversations: 5,
      incomingMessages: 150,
      outgoingMessages: 220,
      responseRate: 87.5,
      avgResponseTimeMs: 180000,
      avgResponseTimeMin: 3,
    },
    {
      userId: "emp-3",
      userName: "محمود حسن",
      userEmail: "mahmoud@example.com",
      userImage: null,
      assignedConversations: 20,
      repliedConversations: 15,
      unrepliedConversations: 5,
      incomingMessages: 100,
      outgoingMessages: 100,
      responseRate: 75,
      avgResponseTimeMs: 300000,
      avgResponseTimeMin: 5,
    },
  ],
};

describe("WhatsAppEmployeeAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({
      data: mockAnalyticsResponse,
    });
  });

  it("renders page shell, header and date preset buttons", async () => {
    render(
      <MemoryRouter>
        <WhatsAppEmployeeAnalytics />
      </MemoryRouter>,
    );

    expect(screen.getByText("تحليل أداء الموظفين")).toBeInTheDocument();
    expect(screen.getAllByText("اليوم").length).toBeGreaterThan(0);
    expect(screen.getAllByText("آخر ٧ أيام").length).toBeGreaterThan(0);
    expect(screen.getAllByText("هذا الشهر").length).toBeGreaterThan(0);
  });

  it("loads and displays summary metrics, charts and rankings", async () => {
    render(
      <MemoryRouter>
        <WhatsAppEmployeeAnalytics />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        "/whatsapp-inbox/employee-analytics",
        expect.anything(),
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("محادثات واردة").length).toBeGreaterThan(0);
      expect(screen.getAllByText("مردود عليها").length).toBeGreaterThan(0);
      expect(screen.getAllByText("غير مردود عليها").length).toBeGreaterThan(0);
      expect(screen.getAllByText("رسائل صادرة").length).toBeGreaterThan(0);
      expect(screen.getAllByText("أحمد علي").length).toBeGreaterThan(0);
      expect(screen.getAllByText("سارة محمد").length).toBeGreaterThan(0);
      expect(screen.getAllByText("محمود حسن").length).toBeGreaterThan(0);
    });
  });

  it("changes preset to 7days and refreshes data", async () => {
    render(
      <MemoryRouter>
        <WhatsAppEmployeeAnalytics />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("أحمد علي").length).toBeGreaterThan(0);
    });

    const callsBefore = (apiClient.get as any).mock.calls.length;
    const sevenDaysBtn = screen.getAllByText("آخر ٧ أيام")[0];
    fireEvent.click(sevenDaysBtn);

    await waitFor(() => {
      expect((apiClient.get as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("triggers manual refresh when clicking refresh button", async () => {
    render(
      <MemoryRouter>
        <WhatsAppEmployeeAnalytics />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("أحمد علي").length).toBeGreaterThan(0);
    });

    const callsBefore = (apiClient.get as any).mock.calls.length;
    const refreshButtons = screen.getAllByRole("button", { name: /تحديث/ });
    fireEvent.click(refreshButtons[0]);

    await waitFor(() => {
      expect((apiClient.get as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
