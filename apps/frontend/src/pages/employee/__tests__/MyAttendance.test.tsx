// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MyAttendance from "../MyAttendance";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      firstName: "أحمد",
      lastName: "حسن",
      email: "ahmed@example.com",
    },
  }),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes("/today")) {
        return Promise.resolve({ data: { record: null } });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          data: {
            stats: {
              presentDays: 18,
              lateDays: 2,
              absentDays: 0,
              totalWorkHours: 144,
              averageWorkHours: 8,
            },
          },
        });
      }
      if (url.includes("/settings")) {
        return Promise.resolve({
          data: {
            settings: {
              geofencingEnabled: false,
            },
          },
        });
      }
      return Promise.resolve({
        data: {
          records: [],
          pagination: { totalPages: 1 },
        },
      });
    }),
  },
}));

describe("MyAttendance", () => {
  it("renders employee attendance page and work mode controls", async () => {
    render(<MyAttendance />);
    await waitFor(() => {
      expect(screen.getByText("employee.attendance.myAttendance")).toBeTruthy();
      expect(screen.getByText("employee.attendance.fromOffice")).toBeTruthy();
    });
  });
});
