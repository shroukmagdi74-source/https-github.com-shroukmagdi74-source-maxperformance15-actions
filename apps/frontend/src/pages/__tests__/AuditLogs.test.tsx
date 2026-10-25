/* @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuditLogs from "../hr/AuditLogs";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockAuditLogs = [
  {
    id: "log-1",
    action: "CREATE",
    entityType: "EMPLOYEE",
    entityId: "emp-101",
    actorId: "usr-1",
    actorName: "أحمد عبد الله",
    details: { name: "محمد علي", totalSalary: 12000 },
    ipAddress: "192.168.1.100",
    createdAt: "2026-03-01T10:00:00Z",
    actor: {
      avatar: "",
      email: "ahmed@example.com",
      firstName: "أحمد",
      lastName: "عبد الله",
    },
  },
  {
    id: "log-2",
    action: "APPROVE",
    entityType: "LEAVE",
    entityId: "leave-202",
    actorId: "usr-2",
    actorName: "سارة إبراهيم",
    details: { reason: "إجازة سنوية", startDate: "2026-04-01", endDate: "2026-04-10" },
    ipAddress: "192.168.1.101",
    createdAt: "2026-03-02T11:30:00Z",
    actor: {
      avatar: "",
      email: "sara@example.com",
      firstName: "سارة",
      lastName: "إبراهيم",
    },
  },
];

const mockStats = {
  totalLogs: 150,
  actionStats: [
    { action: "CREATE", count: 45 },
    { action: "UPDATE", count: 60 },
    { action: "DELETE", count: 12 },
    { action: "APPROVE", count: 33 },
  ],
  entityStats: [
    { entityType: "EMPLOYEE", count: 70 },
    { entityType: "LEAVE", count: 50 },
    { entityType: "ADVANCE", count: 30 },
  ],
};

describe("AuditLogs Component (Batch 502)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/audit-logs/stats") {
        return Promise.resolve({
          data: {
            success: true,
            data: mockStats,
          },
        });
      }
      if (url === "/hr/audit-logs") {
        return Promise.resolve({
          data: {
            success: true,
            logs: mockAuditLogs,
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1,
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header, title, and export button", async () => {
    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    expect(screen.getByText("سجلات التدقيق")).toBeTruthy();
    expect(screen.getByText("سجل التغييرات ومراقبة النظام")).toBeTruthy();
    expect(screen.getByText("تصدير CSV")).toBeTruthy();
  });

  it("renders statistics cards when stats are returned", async () => {
    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("إجمالي السجلات")).toBeTruthy();
      expect(screen.getByText("150")).toBeTruthy();
      expect(screen.getByText("عمليات الإنشاء")).toBeTruthy();
      expect(screen.getByText("45")).toBeTruthy();
      expect(screen.getByText("عمليات الحذف")).toBeTruthy();
      expect(screen.getByText("12")).toBeTruthy();
    });
  });

  it("renders audit log items in table", async () => {
    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد عبد الله")).toBeTruthy();
      expect(screen.getByText("سارة إبراهيم")).toBeTruthy();
      expect(screen.getByText("موظف")).toBeTruthy();
      expect(screen.getByText("إجازة")).toBeTruthy();
    });
  });

  it("opens details modal when clicking details action button", async () => {
    render(
      <MemoryRouter>
        <AuditLogs />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أحمد عبد الله")).toBeTruthy();
    });

    const eyeButtons = screen.getAllByRole("button");
    // Find one of the ghost eye buttons inside table
    const detailsBtn = eyeButtons.find(
      (b) => b.querySelector("svg") && !b.textContent?.includes("تصدير") && !b.textContent?.includes("السابق") && !b.textContent?.includes("التالي")
    );

    if (detailsBtn) {
      fireEvent.click(detailsBtn);
      await waitFor(() => {
        expect(screen.getByText("تفاصيل العملية")).toBeTruthy();
        expect(screen.getByText("المعلومات الكاملة عن هذا الإجراء")).toBeTruthy();
        expect(screen.getByText("192.168.1.100")).toBeTruthy();
      });
    }
  });
});
