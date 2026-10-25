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
import CreateWarning from "../hr/CreateWarning";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("../../services/api", () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

const sampleEmployees = [
  {
    id: "emp-1",
    firstName: "حسام",
    lastName: "شوقي",
    employeeNumber: "EMP-701",
    position: { title: "مندوب مبيعات" },
    department: { name: "المبيعات" },
  },
];

describe("CreateWarning (Batch 513)", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      data: {
        employees: sampleEmployees,
      },
    });
  });

  it("renders create warning header, form fields, and disciplinary policy card", async () => {
    render(
      <MemoryRouter>
        <CreateWarning />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إصدار مخالفة إدارية")).toBeDefined();
    });

    expect(screen.getByText("تفاصيل المخالفة")).toBeDefined();
    expect(screen.getByText("سياسة التدرج في العقوبات")).toBeDefined();
    expect(
      screen.getByText("اختر موظفاً لعرض ملفه المختصر هنا"),
    ).toBeDefined();
  });

  it("updates title and description inputs and opens preview modal", async () => {
    render(
      <MemoryRouter>
        <CreateWarning />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إصدار مخالفة إدارية")).toBeDefined();
    });

    const titleInput = screen.getByPlaceholderText(
      "مثال: الغياب المتكرر بدون عذر...",
    );
    fireEvent.change(titleInput, {
      target: { value: "تأخير متكرر عن موعد العمل" },
    });

    const descInput = screen.getByPlaceholderText(
      "اشرح بوضوح ما حدث، متى، وأين...",
    );
    fireEvent.change(descInput, {
      target: { value: "تأخر الموظف لمدة ساعتين دون إبلاغ مسبق" },
    });

    fireEvent.click(screen.getByText("معاينة قبل الحفظ"));

    expect(screen.getByText("مسودة معاينة")).toBeDefined();
    expect(screen.getByText("تأخير متكرر عن موعد العمل")).toBeDefined();
    expect(
      screen.getByText("تأخر الموظف لمدة ساعتين دون إبلاغ مسبق"),
    ).toBeDefined();
  });

  it("shows validation error messages when submitting empty required fields", async () => {
    render(
      <MemoryRouter>
        <CreateWarning />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("اعتماد المخالفة")).toBeDefined();
    });

    fireEvent.click(screen.getByText("اعتماد المخالفة"));

    await waitFor(() => {
      expect(screen.getByText("العنوان مطلوب")).toBeDefined();
      expect(screen.getByText("التفاصيل مطلوبة")).toBeDefined();
    });
  });

  it("renders cancel and submit action buttons", async () => {
    render(
      <MemoryRouter>
        <CreateWarning />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إلغاء")).toBeDefined();
    });

    expect(screen.getByText("معاينة قبل الحفظ")).toBeDefined();
    expect(screen.getByText("اعتماد المخالفة")).toBeDefined();
  });
});
