/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LoyaltySystemMap from "../customers/LoyaltySystemMap";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn((url: string) => {
      if (url.includes("/hr/customer-loyalty/programs")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "prog-1",
                name: "برنامج ولاء العملاء المميزين",
                status: "ACTIVE",
                customersCount: 150,
                totalPointsIssued: 50000,
                totalPointsRedeemed: 20000,
                createdAt: "2026-01-01T00:00:00Z",
              },
            ],
          },
        });
      }
      if (url.includes("/wallet/stats")) {
        return Promise.resolve({
          data: {
            data: {
              totalCashback: 4500,
            },
          },
        });
      }
      if (url.includes("/hr/customer-loyalty/system-analytics")) {
        return Promise.resolve({
          data: {
            data: {
              system: "POINTS",
            },
          },
        });
      }
      if (url.includes("/hr/customer-loyalty/loyalty-config")) {
        return Promise.resolve({
          data: {
            data: {
              tiers: { enabled: true },
              autoDiscount: { enabled: false },
              cashback: { enabled: true },
            },
          },
        });
      }
      if (url.includes("/whatsapp/sessions")) {
        return Promise.resolve({
          data: {
            sessions: [
              {
                id: "sess-1",
                name: "رقم خدمة العملاء",
                phoneNumber: "01012345678",
                provider: "META_CLOUD",
                status: "CONNECTED",
                isDefault: true,
              },
            ],
          },
        });
      }
      if (url.includes("/whatsapp/automation/flows")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "flow-1",
                name: "سلسلة بعد الاستلام",
                isEnabled: true,
              },
            ],
          },
        });
      }
      if (url.includes("/whatsapp-automation/journeys")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "j-1",
                name: "رحلة تقييم الطلب",
                status: "ACTIVE",
                createdAt: "2026-02-01T00:00:00Z",
              },
            ],
          },
        });
      }
      if (url.includes("/birthday-automation/settings")) {
        return Promise.resolve({
          data: {
            data: {
              isEnabled: true,
              dailySendTime: "12:00",
              channel: "meta_api",
              messageTemplate: "كل سنة وأنت طيب!",
            },
          },
        });
      }
      if (url.includes("/occasions")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "occ-1",
                name: "عيد الفطر",
                scheduledAt: "2026-04-10T00:00:00Z",
                status: "SCHEDULED",
                message: "تهنئة خاصة بمناسبة العيد",
              },
            ],
          },
        });
      }
      if (url.includes("/campaigns/history")) {
        return Promise.resolve({
          data: {
            campaigns: [
              {
                id: "camp-1",
                name: "حملة الصيف",
                createdAt: "2026-06-01T00:00:00Z",
              },
            ],
          },
        });
      }
      if (url.includes("/lead-categories")) {
        return Promise.resolve({
          data: {
            data: [{ id: "cat-1", name: "عملاء VIP" }],
          },
        });
      }
      if (url.includes("/broadcast/customer-lists")) {
        return Promise.resolve({
          data: {
            data: [{ id: "list-1", name: "قائمة المشترين الدائمين", isDefault: false }],
          },
        });
      }
      if (url.includes("/customers/whatsapp-notify/birthday-automation/upcoming")) {
        return Promise.resolve({
          data: {
            total: 12,
            data: [
              { name: "محمود حسن", phone: "01000000001", formattedNextDate: "15 نوفمبر" },
            ],
          },
        });
      }
      if (url.includes("/hr/customer-loyalty/re-engagement/settings")) {
        return Promise.resolve({
          data: {
            data: {
              inactiveDays: 30,
              loops: { occasion: true, inactive: true, points: false },
            },
          },
        });
      }
      if (url.includes("/hr/customer-loyalty/re-engagement/counts")) {
        return Promise.resolve({
          data: {
            data: {
              inactive: 45,
              points: 80,
              occasion: 25,
              inactiveTrend: { last7d: 10, prev7d: 5 },
              pointsTrend: { last30d: 30, prev30d: 20 },
            },
          },
        });
      }
      if (url.includes("/customers?")) {
        return Promise.resolve({
          data: {
            pagination: { total: 100 },
            data: [{ createdAt: "2025-01-01T00:00:00Z" }],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LoyaltySystemMap Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and title correctly after loading", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    // Initial loading indicator
    expect(screen.getByText("جاري تحميل خريطة نظام الولاء...")).toBeTruthy();

    // After loading completes
    await waitFor(() => {
      expect(screen.getByText("خريطة نظام الولاء + إعادة الاستهداف")).toBeTruthy();
    });

    expect(
      screen.getByText(
        "خريطة أدوات قسم العملاء، تدفقها الزمني، توجيه الرسائل، وحلقات إعادة الاستهداف"
      )
    ).toBeTruthy();
  });

  it("renders KPI cards with formatted values", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("العملاء المشتركين")).toBeTruthy();
    });

    expect(screen.getByText("متوسط النقاط للعميل")).toBeTruthy();
    expect(screen.getByText("نسبة الاستبدال")).toBeTruthy();
    expect(screen.getByText("إجمالي الكاش باك")).toBeTruthy();
  });

  it("renders all 4 stages in the tools map", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("الاشتراك والطلب")).toBeTruthy();
    });

    expect(screen.getByText("جمع النقاط والولاء")).toBeTruthy();
    expect(screen.getByText("الاستبدال والكاش باك")).toBeTruthy();
    expect(screen.getByText("إعادة الاستهداف")).toBeTruthy();
  });

  it("renders re-engagement section and tools routing table", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("أداة إعادة الاستهداف (Re-engagement)")).toBeTruthy();
    });

    expect(screen.getByText("توجيه الرسائل (WhatsApp Routing)")).toBeTruthy();
    expect(screen.getAllByText("Meta Cloud API").length).toBeGreaterThan(0);
  });

  it("allows switching date range filter", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("30 يوم")).toBeTruthy();
    });

    const btn30d = screen.getByText("30 يوم");
    fireEvent.click(btn30d);

    expect(btn30d.className).toContain("bg-fuchsia-600");
  });

  it("opens node detail sheet when a map node is clicked", async () => {
    render(
      <MemoryRouter>
        <LoyaltySystemMap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("برامج الولاء")).toBeTruthy();
    });

    const loyaltyProgramsNode = screen.getByText("برامج الولاء");
    fireEvent.click(loyaltyProgramsNode);

    await waitFor(() => {
      expect(screen.getByText("افتح الأداة")).toBeTruthy();
    });
  });
});
