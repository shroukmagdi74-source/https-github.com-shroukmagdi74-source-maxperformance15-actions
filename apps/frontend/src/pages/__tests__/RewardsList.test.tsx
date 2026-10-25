// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RewardsList from "../hr/rewards/RewardsList";
import {
  getRewardCategoryBadgeConfig,
  REWARD_STATUS_BADGE_CONFIG,
} from "../hr/rewards/list/helpers";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-1", role: "OWNER" },
  }),
}));

const mockGet = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/apiClient", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

describe("RewardsList Helpers", () => {
  it("resolves category and status badge configurations", () => {
    expect(getRewardCategoryBadgeConfig("PERFORMANCE").label).toBe(
      "أداء متميز",
    );
    expect(getRewardCategoryBadgeConfig("UNKNOWN_CAT").label).toBe("أخرى");
    expect(REWARD_STATUS_BADGE_CONFIG.APPROVED.label).toBe("معتمد");
  });
});

describe("RewardsList Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith("/hr/rewards/records")) {
        return Promise.resolve({
          data: {
            success: true,
            records: [
              {
                id: "rew-1",
                rewardName: "مكافأة المبيعات",
                rewardCategory: "SALES",
                calculatedValue: 2500,
                status: "PENDING",
                appliedMonth: 10,
                appliedYear: 2026,
                periodStart: "2026-10-01",
                periodEnd: "2026-10-31",
                reason: "تحقيق المستهدف الشهري",
                createdAt: "2026-10-15T10:00:00Z",
                user: {
                  id: "emp-10",
                  firstName: "أحمد",
                  lastName: "سمير",
                  employeeNumber: "EMP-310",
                },
                rewardType: {
                  name: "Sales Bonus",
                  nameAr: "مكافأة المبيعات",
                  category: "SALES",
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        });
      }
      if (url.startsWith("/hr/rewards/statistics")) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              total: 5,
              totalValue: 12500,
              byStatus: [
                { status: "APPROVED", count: 3, value: 7500 },
                { status: "PENDING", count: 2, value: 5000 },
              ],
              byCategory: [],
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  it("renders statistics KPIs and reward records table", async () => {
    render(
      <MemoryRouter>
        <RewardsList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/أحمد سمير/)).toBeTruthy();
    });

    expect(screen.getByText("EMP-310")).toBeTruthy();
    expect(screen.getByText("2,500")).toBeTruthy();
    expect(screen.getByText("12,500")).toBeTruthy();
    expect(screen.getByText("10/2026")).toBeTruthy();
  });

  it("toggles filter panel when clicking الفلاتر", async () => {
    render(
      <MemoryRouter>
        <RewardsList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("الفلاتر")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("الفلاتر"));

    expect(screen.getByPlaceholderText("ابحث...")).toBeTruthy();
  });
});
