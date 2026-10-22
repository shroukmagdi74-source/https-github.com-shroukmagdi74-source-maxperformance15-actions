// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { DentalCasesDropdowns } from "../DentalCasesDropdowns";

describe("DentalCasesDropdowns", () => {
  afterEach(() => {
    cleanup();
  });

  const baseProps = {
    viewMode: "ACTIVE" as const,
    status: "",
    doctorId: "",
    workTypeId: "",
    priority: "",
    paymentStatus: "",
    technicianId: "",
    dateRangePreset: "ALL",
    agendaDate: "",
    agendaField: "receivedDate" as const,
    activeFiltersCount: 0,
    doctors: [
      { id: "doc-1", name: "د. هاني عثمان", clinicName: "عيادة الشروق", isActive: true },
      { id: "doc-2", name: "د. أحمد خامل", isActive: false },
    ],
    workTypes: [
      { id: "wt-1", name: "Zirconia" },
      { id: "wt-2", name: "E-max" },
    ],
    technicians: [
      { id: "tech-1", name: "فني أحمد", role: "CERAMIST", isActive: true },
      { id: "tech-2", name: "فني خامل", role: "CAD_CAM", isActive: false },
    ],
    applyFilter: vi.fn(),
    clearAllFilters: vi.fn(),
    setAgendaDate: vi.fn(),
    setAgendaField: vi.fn(),
    setDateRangePreset: vi.fn(),
    setPage: vi.fn(),
  };

  it("renders all dropdowns with active doctors, work types, and active technicians", () => {
    render(<DentalCasesDropdowns {...baseProps} />);

    expect(screen.getByTitle("فلترة بالطبيب أو العيادة")).toBeInTheDocument();
    expect(screen.getByText("د. هاني عثمان (عيادة الشروق)")).toBeInTheDocument();
    expect(screen.queryByText("د. أحمد خامل")).not.toBeInTheDocument();

    expect(screen.getByTitle("فلترة بنوع الشغل")).toBeInTheDocument();
    expect(screen.getByText("Zirconia")).toBeInTheDocument();
    expect(screen.getByText("E-max")).toBeInTheDocument();

    expect(screen.getByTitle("فلترة بالفني المسند")).toBeInTheDocument();
    expect(screen.getByText("فني أحمد")).toBeInTheDocument();
    expect(screen.queryByText("فني خامل")).not.toBeInTheDocument();
  });

  it("survives and correctly extracts items when technicians is passed as an object { items: [...] }", () => {
    const propsWithObjectTechs = {
      ...baseProps,
      technicians: {
        items: [
          { id: "tech-1", name: "فني أحمد", role: "CERAMIST", isActive: true },
        ],
      } as any,
    };

    expect(() => render(<DentalCasesDropdowns {...propsWithObjectTechs} />)).not.toThrow();
    expect(screen.getByText("فني أحمد")).toBeInTheDocument();
  });

  it("survives gracefully without throwing when doctors or workTypes or technicians are undefined, null, or empty", () => {
    const brokenProps = {
      ...baseProps,
      doctors: undefined as any,
      workTypes: null as any,
      technicians: {} as any,
    };

    expect(() => render(<DentalCasesDropdowns {...brokenProps} />)).not.toThrow();
  });

  it("calls applyFilter when doctor, workType, or technician is selected", () => {
    const applyFilterMock = vi.fn();
    render(<DentalCasesDropdowns {...baseProps} applyFilter={applyFilterMock} />);

    fireEvent.change(screen.getByTitle("فلترة بالطبيب أو العيادة"), {
      target: { value: "doc-1" },
    });
    expect(applyFilterMock).toHaveBeenCalledWith("doctorId", "doc-1");

    fireEvent.change(screen.getByTitle("فلترة بالفني المسند"), {
      target: { value: "tech-1" },
    });
    expect(applyFilterMock).toHaveBeenCalledWith("technicianId", "tech-1");
  });
});
