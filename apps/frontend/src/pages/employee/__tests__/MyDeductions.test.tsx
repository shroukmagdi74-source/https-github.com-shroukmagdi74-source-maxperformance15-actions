// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MyDeductions from "../MyDeductions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          data: {
            success: true,
            stats: {
              total: 1,
              totalAmount: "250",
              byStatus: [{ status: "APPLIED", _count: 1 }],
            },
          },
        });
      }
      return Promise.resolve({
        data: {
          success: true,
          deductions: [
            {
              id: "ded-1",
              type: "LATE",
              amount: 250,
              reason: "تأخير صباحي متكرر",
              date: "2026-10-15T00:00:00Z",
              effectiveMonth: 10,
              effectiveYear: 2026,
              status: "APPLIED",
              appliedToPayroll: true,
              createdAt: "2026-10-15T00:00:00Z",
            },
          ],
        },
      });
    }),
  },
}));

describe("MyDeductions", () => {
  it("renders deductions header and list item", async () => {
    render(<MyDeductions />);
    await waitFor(() => {
      expect(screen.getByText("employee.deductions.title")).toBeTruthy();
      expect(screen.getByText("تأخير صباحي متكرر")).toBeTruthy();
    });
  });
});
