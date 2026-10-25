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
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ShiftDetails from "../hr/ShiftDetails";

const mockGet = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

vi.mock("../../components/hr/AssignShiftDialog", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="assign-shift-dialog">Assign Dialog</div> : null,
}));

const sampleShift = {
  id: "shift-1",
  name: "الوردية الصباحية أ",
  startTime: "08:30",
  endTime: "16:30",
  breakDuration: 45,
  color: "#10B981",
  isActive: true,
  assignments: [
    {
      id: "assign-1",
      date: "2026-10-25T00:00:00.000Z",
      user: {
        id: "u1",
        firstName: "مازن",
        lastName: "نبيل",
        employeeNumber: "EMP-501",
        email: "mazen@example.com",
      },
    },
  ],
  _count: {
    assignments: 1,
  },
};

describe("ShiftDetails (Batch 512)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        shift: sampleShift,
      },
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/hr/shifts/shift-1"]}>
        <Routes>
          <Route path="/hr/shifts/:id" element={<ShiftDetails />} />
        </Routes>
      </MemoryRouter>,
    );

  it("renders shift header, time stats, and active status badge", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("الوردية الصباحية أ")).toBeDefined();
    });

    expect(screen.getByText("08:30")).toBeDefined();
    expect(screen.getByText("16:30")).toBeDefined();
    expect(screen.getByText("نشط")).toBeDefined();
    expect(screen.getByText("#10B981")).toBeDefined();
  });

  it("renders assigned employee card with employee details", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("مازن نبيل")).toBeDefined();
    });

    expect(screen.getByText("#EMP-501")).toBeDefined();
    expect(screen.getByText("• mazen@example.com")).toBeDefined();
  });

  it("opens edit shift dialog when edit button is clicked", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("الوردية الصباحية أ")).toBeDefined();
    });

    fireEvent.click(screen.getByText("تعديل"));

    expect(screen.getByText("تعديل المناوبة")).toBeDefined();
    expect(screen.getByDisplayValue("الوردية الصباحية أ")).toBeDefined();
  });

  it("opens assign employee dialog when assign button is clicked", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("الوردية الصباحية أ")).toBeDefined();
    });

    fireEvent.click(screen.getAllByText("تعيين موظف")[0]);

    expect(screen.getByTestId("assign-shift-dialog")).toBeDefined();
  });
});
