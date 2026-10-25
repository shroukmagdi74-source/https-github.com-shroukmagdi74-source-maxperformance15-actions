// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import AttendanceSheetReport from "../hr/reports/AttendanceSheetReport";
import {
  calculateAttendanceRate,
  buildAttendanceSheetCsv,
} from "../hr/reports/attendance-sheet/helpers";

const mockGet = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

describe("AttendanceSheetReport Helpers", () => {
  it("calculates attendance rate and formats CSV export", () => {
    expect(
      calculateAttendanceRate({ present: 18, late: 2, absent: 5, leave: 2 }),
    ).toBe("80.0");

    const csv = buildAttendanceSheetCsv({
      month: 10,
      year: 2026,
      days: [
        {
          day: 1,
          date: "2026-10-01",
          weekday: "الخميس",
          isWorkingDay: true,
          isHoliday: false,
        },
      ],
      totalEmployees: 1,
      totals: { present: 1, late: 0, absent: 0, leave: 0 },
      employees: [
        {
          id: "emp-1",
          name: "ياسر فؤاد",
          employeeNumber: "EMP-501",
          department: "الهندسة",
          position: "مهندس",
          totals: { present: 1, late: 0, absent: 0, leave: 0 },
          cells: [
            {
              status: "PRESENT",
              checkIn: "09:00",
              checkOut: "17:00",
              lateMinutes: 0,
            },
          ],
        },
      ],
    });

    expect(csv).toContain("ياسر فؤاد");
    expect(csv).toContain("حاضر 09:00-17:00");
  });
});

describe("AttendanceSheetReport Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        report: {
          month: 10,
          year: 2026,
          days: [
            {
              day: 1,
              date: "2026-10-01",
              weekday: "الخميس",
              isWorkingDay: true,
              isHoliday: false,
            },
          ],
          totalEmployees: 1,
          totals: { present: 20, late: 2, absent: 1, leave: 1 },
          employees: [
            {
              id: "emp-1",
              name: "ياسر فؤاد",
              employeeNumber: "EMP-501",
              department: "الهندسة",
              position: "مهندس",
              totals: { present: 20, late: 2, absent: 1, leave: 1 },
              cells: [
                {
                  status: "PRESENT",
                  checkIn: "08:55",
                  checkOut: "17:10",
                  lateMinutes: 0,
                },
              ],
            },
          ],
        },
      },
    });
  });

  it("renders attendance sheet KPIs and employee matrix rows", async () => {
    render(<AttendanceSheetReport />);

    await waitFor(() => {
      expect(screen.getByText("ياسر فؤاد")).toBeTruthy();
    });

    expect(screen.getByText("#EMP-501")).toBeTruthy();
    expect(screen.getByText("08:55")).toBeTruthy();
    expect(screen.getByText("95.7%")).toBeTruthy();
  });
});
