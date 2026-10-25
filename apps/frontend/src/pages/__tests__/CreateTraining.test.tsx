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
import CreateTraining from "../hr/CreateTraining";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

const sampleEmployees = [
  {
    id: "emp-1",
    firstName: "سلمى",
    lastName: "عادل",
    employeeNumber: "EMP-801",
    position: { title: "أخصائي موارد بشرية" },
  },
];

describe("CreateTraining (Batch 515)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/employees") {
        return Promise.resolve({ data: { employees: sampleEmployees } });
      }
      if (url === "/hr/trainings/train-1") {
        return Promise.resolve({
          data: {
            training: {
              id: "train-1",
              userId: "emp-1",
              trainingName: "إدارة الأداء الحديث",
              provider: "أكاديمية القيادة",
              type: "management",
              startDate: "2026-10-15T00:00:00.000Z",
              endDate: "2026-10-20T00:00:00.000Z",
              status: "COMPLETED",
              cost: 3500,
              duration: 24,
              score: 95,
              description: "دورة مكثفة في إدارة الأداء",
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders create training header, sidebar, schedule card, and investment card", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/training/new"]}>
        <Routes>
          <Route path="/hr/training/new" element={<CreateTraining />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة سجل تدريبي")).toBeDefined();
    });

    expect(screen.getByText("الموظف والبرنامج")).toBeDefined();
    expect(screen.getByText("التوقيت والحالة")).toBeDefined();
    expect(screen.getByText("الاستثمار والنتائج")).toBeDefined();
    expect(screen.getByText("نصيحة التدريب")).toBeDefined();
  });

  it("switches training status buttons interactively", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/training/new"]}>
        <Routes>
          <Route path="/hr/training/new" element={<CreateTraining />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("مخطط")).toBeDefined();
    });

    fireEvent.click(screen.getByText("قيد التنفيذ"));
    expect(screen.getByText("قيد التنفيذ")).toBeDefined();
  });

  it("populates fields and shows delete button in edit mode", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/training/train-1/edit"]}>
        <Routes>
          <Route path="/hr/training/:id/edit" element={<CreateTraining />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("إدارة الأداء الحديث")).toBeDefined();
    });

    expect(screen.getByDisplayValue("أكاديمية القيادة")).toBeDefined();
    expect(screen.getByText("حذف السجل نهائياً")).toBeDefined();
  });

  it("validates required fields on submit", async () => {
    render(
      <MemoryRouter initialEntries={["/hr/training/new"]}>
        <Routes>
          <Route path="/hr/training/new" element={<CreateTraining />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("حفظ السجل التدريبي")).toBeDefined();
    });

    fireEvent.click(screen.getByText("حفظ السجل التدريبي"));

    await waitFor(() => {
      expect(screen.getByText("اسم البرنامج مطلوب")).toBeDefined();
      expect(screen.getByText("تاريخ البدء مطلوب")).toBeDefined();
    });
  });
});
