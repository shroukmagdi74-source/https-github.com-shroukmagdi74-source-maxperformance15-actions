// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MyDashboard from "../MyDashboard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      firstName: "سارة",
      lastName: "محمود",
      email: "sara@example.com",
      company: {
        activeApps: ["hr-system", "hr-management"],
      },
    },
  }),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        employee: {
          id: "e1",
          firstName: "سارة",
          lastName: "محمود",
          email: "sara@example.com",
          employeeNumber: "EMP-101",
          annualLeaveBalance: 21,
          sickLeaveBalance: 7,
        },
        attendance: null,
        leaves: [],
        requests: [],
        warnings: [],
        data: [],
        payroll: null,
      },
    }),
  },
}));

describe("MyDashboard", () => {
  it("renders employee dashboard view cleanly", async () => {
    render(<MyDashboard />);
    await waitFor(() => {
      const quickActionsOrFallback =
        screen.queryByText("employee.dashboard.quickActions") ||
        screen.queryByText("employee.dashboard.hrNotActive");
      expect(quickActionsOrFallback).toBeTruthy();
    });
  });
});
