// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import RewardTypes from "../hr/rewards/RewardTypes";
import api from "../../services/api";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "COMPANY_ADMIN" },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRewardTypes = [
  {
    id: "rt-1",
    name: "مكافأة تحقيق التارجت",
    category: "TARGET_ACHIEVEMENT",
    calculationMethod: "FIXED_AMOUNT",
    value: 2000,
    isActive: true,
    triggerType: "SEMI_AUTOMATIC",
    eligibilityConditions: { minTargetProgress: 100 },
  },
  {
    id: "rt-2",
    name: "عمولة مبيعات شهرية",
    category: "SALES",
    calculationMethod: "PERCENTAGE_SALES",
    value: 5,
    isActive: false,
    triggerType: "AUTOMATIC",
    eligibilityConditions: { minSalesAmount: 50000 },
  },
];

describe("RewardTypes Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockRewardTypes,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders reward types table with fixed and percentage values", async () => {
    render(<RewardTypes />);

    await waitFor(() => {
      expect(screen.getByText("مكافأة تحقيق التارجت")).toBeTruthy();
    });

    expect(screen.getByText("عمولة مبيعات شهرية")).toBeTruthy();
    expect(screen.getByText("5%")).toBeTruthy();
    expect(screen.getByText(/2000/)).toBeTruthy();
  });

  it("opens add reward type dialog when clicking add button", async () => {
    render(<RewardTypes />);

    await waitFor(() => {
      expect(screen.getByText("مكافأة تحقيق التارجت")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("rewards.form.addNew"));

    await waitFor(() => {
      expect(screen.getByText("rewards.form.addReward")).toBeTruthy();
    });
  });
});
