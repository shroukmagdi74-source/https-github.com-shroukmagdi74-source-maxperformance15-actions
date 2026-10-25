// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RewardDetails from "../hr/rewards/RewardDetails";
import {
  formatCalculationDetails,
  deriveRewardTypeMeta,
} from "../hr/rewards/details/helpers";

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-1", role: "OWNER" },
  }),
}));

vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe("RewardDetails Helpers", () => {
  it("formats JSON calculation details and derives reward type metadata", () => {
    expect(formatCalculationDetails('{"base":1000,"rate":0.1}')).toContain(
      '"base": 1000',
    );
    const meta = deriveRewardTypeMeta({
      id: "r-1",
      rewardName: "مكافأة استثنائية",
      rewardCategory: "PERFORMANCE",
      calculatedValue: 3000,
      status: "APPROVED",
      appliedMonth: 10,
      appliedYear: 2026,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      isIncludedInPayroll: true,
      isLocked: false,
      createdAt: "2026-10-10T10:00:00Z",
      updatedAt: "2026-10-10T10:00:00Z",
      user: {
        id: "emp-1",
        firstName: "رامي",
        lastName: "عادل",
        email: "ramy@example.com",
        employeeNumber: "EMP-701",
      },
      rewardType: null,
    });
    expect(meta.rewardTypeName).toBe("مكافأة استثنائية");
    expect(meta.rewardTypeCalculationMethod).toBe("مخصص");
  });
});

describe("RewardDetails Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: "rew-77",
          rewardName: "مكافأة الالتزام الشهري",
          rewardCategory: "PUNCTUALITY",
          calculatedValue: 1800,
          status: "PENDING",
          appliedMonth: 10,
          appliedYear: 2026,
          periodStart: "2026-10-01",
          periodEnd: "2026-10-31",
          reason: "عدم وجود أي تأخيرات",
          isIncludedInPayroll: true,
          isLocked: false,
          createdAt: "2026-10-15T10:00:00Z",
          updatedAt: "2026-10-15T10:00:00Z",
          user: {
            id: "emp-77",
            firstName: "دينا",
            lastName: "فوزي",
            email: "dina@example.com",
            employeeNumber: "EMP-770",
            departmentRelation: { name: "العمليات" },
          },
          rewardType: {
            id: "rt-7",
            name: "Punctuality Bonus",
            nameAr: "مكافأة الالتزام",
            category: "PUNCTUALITY",
            calculationMethod: "FIXED_AMOUNT",
            value: 1800,
            frequency: "MONTHLY",
            triggerType: "AUTOMATIC",
          },
        },
      },
    });
  });

  it("renders reward details, employee info, calculated value, and action buttons", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/rewards/rew-77"]}>
        <Routes>
          <Route path="/hr/rewards/:id" element={<RewardDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/دينا فوزي/)).toBeTruthy();
    });

    expect(screen.getByText("EMP-770")).toBeTruthy();
    expect(screen.getByText("1,800")).toBeTruthy();
    expect(screen.getByText("مدرجة في كشف الرواتب")).toBeTruthy();
    expect(screen.getByText("اعتماد")).toBeTruthy();
    expect(screen.getByText("تعديل")).toBeTruthy();
  });
});
