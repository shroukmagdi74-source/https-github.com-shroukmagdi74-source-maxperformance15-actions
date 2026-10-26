// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock hooks and utils
vi.mock("../../../hooks/useDateFormat", () => ({
  useDateFormat: () => ({
    formatDate: (date: string) => date,
  }),
}));

vi.mock("../../../utils/tokenManager", () => ({
  default: {
    getAccessToken: vi.fn(() => "mock-token-xyz"),
    createAuthHeaders: vi.fn(() => ({ Authorization: "Bearer mock-token-xyz" })),
  },
}));

vi.mock("../../../utils/urlHelper", () => ({
  buildApiUrl: vi.fn((endpoint: string) => `http://api.local/${endpoint}`),
}));

import {
  getStatusText,
  getStatusColor,
  getTypeText,
  AppointmentsHeader,
  AppointmentsFilters,
  AppointmentsTable,
  AppointmentDetailsModal,
  CreateAppointmentModal,
  Appointments,
  Appointment,
  AppointmentFilters,
  NewAppointmentPayload,
} from "../Appointments";

const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    customerId: "cust-1",
    customerName: "محمد علي",
    customerEmail: "mohamed@example.com",
    customerPhone: "01012345678",
    staffId: "1",
    staffName: "أحمد المدير",
    title: "استشارة تسويق رقمي",
    description: "مناقشة خطة الحملات الإعلانية للربع القادم",
    appointmentDate: "2026-11-01",
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    status: "pending",
    type: "consultation",
    location: "المكتب الرئيسي",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "يرجى تجهيز تقارير الشهر الماضي",
    createdAt: "2026-10-27T00:00:00Z",
  },
  {
    id: "apt-2",
    customerId: "cust-2",
    customerName: "سارة إبراهيم",
    customerEmail: "sara@example.com",
    customerPhone: "01123456789",
    staffId: "2",
    staffName: "سارة المستشارة",
    title: "تدريب على المنصة",
    description: "شرح استخدام لوحة التحكم والمحادثات",
    appointmentDate: "2026-11-02",
    startTime: "14:00",
    endTime: "15:00",
    duration: 60,
    status: "confirmed",
    type: "training",
    location: "أونلاين",
    meetingLink: "https://zoom.us/j/123456789",
    notes: "",
    createdAt: "2026-10-27T00:00:00Z",
  },
];

const mockNewAppointment: NewAppointmentPayload = {
  customerId: "cust-1",
  customerName: "محمد علي",
  customerEmail: "mohamed@example.com",
  customerPhone: "01012345678",
  staffId: "1",
  staffName: "أحمد المدير",
  title: "استشارة تسويق رقمي",
  description: "مناقشة خطة الحملات",
  appointmentDate: "2026-11-01",
  startTime: "10:00",
  type: "consultation",
  location: "المكتب الرئيسي",
  meetingLink: "",
  notes: "",
};

const mockFilters: AppointmentFilters = {
  status: "",
  staffId: "",
  type: "",
  dateFrom: "",
  dateTo: "",
};

describe("Appointments Modular Subcomponents", () => {
  describe("helpers", () => {
    it("returns correct status text and color", () => {
      expect(getStatusText("pending")).toBe("في الانتظار");
      expect(getStatusText("confirmed")).toBe("مؤكد");
      expect(getStatusText("completed")).toBe("مكتمل");
      expect(getStatusText("cancelled")).toBe("ملغي");
      expect(getStatusText("no_show")).toBe("لم يحضر");

      expect(getStatusColor("pending")).toContain("yellow");
      expect(getStatusColor("confirmed")).toContain("blue");
      expect(getStatusColor("completed")).toContain("green");
      expect(getStatusColor("cancelled")).toContain("red");
      expect(getStatusColor("no_show")).toContain("gray");
    });

    it("returns correct type text", () => {
      expect(getTypeText("consultation")).toBe("استشارة");
      expect(getTypeText("training")).toBe("تدريب");
      expect(getTypeText("meeting")).toBe("اجتماع");
      expect(getTypeText("demo")).toBe("عرض توضيحي");
      expect(getTypeText("custom_type")).toBe("custom_type");
    });
  });

  describe("AppointmentsHeader", () => {
    it("renders title and triggers modal on button click", () => {
      const handleOpen = vi.fn();
      render(<AppointmentsHeader onOpenCreateModal={handleOpen} />);

      expect(screen.getByText("إدارة المواعيد والتقويم")).toBeDefined();
      expect(screen.getByText("جدولة ومتابعة المواعيد مع العملاء")).toBeDefined();

      const btn = screen.getByRole("button", { name: /موعد جديد/i });
      fireEvent.click(btn);
      expect(handleOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe("AppointmentsFilters", () => {
    it("renders filter controls and handles filter change and reset", () => {
      const handleChange = vi.fn();
      const handleReset = vi.fn();

      render(
        <AppointmentsFilters
          filters={mockFilters}
          onFilterChange={handleChange}
          onResetFilters={handleReset}
        />,
      );

      expect(screen.getByText("الحالة")).toBeDefined();
      expect(screen.getByText("الموظف")).toBeDefined();
      expect(screen.getByText("النوع")).toBeDefined();

      const resetBtn = screen.getByRole("button", { name: /إعادة تعيين/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("AppointmentsTable", () => {
    it("renders appointment rows and triggers actions", () => {
      const handleView = vi.fn();
      const handleUpdateStatus = vi.fn();

      render(
        <AppointmentsTable
          appointments={mockAppointments}
          formatDate={(d) => d}
          onViewAppointment={handleView}
          onUpdateStatus={handleUpdateStatus}
        />,
      );

      expect(screen.getByText("استشارة تسويق رقمي")).toBeDefined();
      expect(screen.getByText("تدريب على المنصة")).toBeDefined();
      expect(screen.getByText("محمد علي")).toBeDefined();
      expect(screen.getByText("سارة إبراهيم")).toBeDefined();

      // Click view details
      const viewButtons = screen.getAllByTitle("عرض التفاصيل");
      fireEvent.click(viewButtons[0]);
      expect(handleView).toHaveBeenCalledWith(mockAppointments[0]);

      // Click confirm on pending appointment
      const confirmBtn = screen.getByRole("button", { name: "تأكيد" });
      fireEvent.click(confirmBtn);
      expect(handleUpdateStatus).toHaveBeenCalledWith("apt-1", "confirmed");

      // Click complete on confirmed appointment
      const completeBtn = screen.getByRole("button", { name: "إكمال" });
      fireEvent.click(completeBtn);
      expect(handleUpdateStatus).toHaveBeenCalledWith("apt-2", "completed");
    });

    it("renders empty state when appointments list is empty", () => {
      render(
        <AppointmentsTable
          appointments={[]}
          formatDate={(d) => d}
          onViewAppointment={vi.fn()}
          onUpdateStatus={vi.fn()}
        />,
      );

      expect(screen.getByText("لا توجد مواعيد")).toBeDefined();
    });
  });

  describe("AppointmentDetailsModal", () => {
    it("renders nothing when closed", () => {
      const { container } = render(
        <AppointmentDetailsModal
          isOpen={false}
          appointment={mockAppointments[0]}
          formatDate={(d) => d}
          onClose={vi.fn()}
          onUpdateStatus={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal details when open and handles actions", () => {
      const handleClose = vi.fn();
      const handleUpdateStatus = vi.fn();

      render(
        <AppointmentDetailsModal
          isOpen={true}
          appointment={mockAppointments[0]}
          formatDate={(d) => d}
          onClose={handleClose}
          onUpdateStatus={handleUpdateStatus}
        />,
      );

      expect(screen.getByText("تفاصيل الموعد")).toBeDefined();
      expect(screen.getByText("استشارة تسويق رقمي")).toBeDefined();
      expect(screen.getByText("محمد علي")).toBeDefined();
      expect(screen.getByText("mohamed@example.com")).toBeDefined();
      expect(screen.getByText("https://meet.google.com/abc-defg-hij")).toBeDefined();

      const confirmBtn = screen.getByRole("button", { name: "تأكيد الموعد" });
      fireEvent.click(confirmBtn);
      expect(handleUpdateStatus).toHaveBeenCalledWith("apt-1", "confirmed");
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("CreateAppointmentModal", () => {
    it("renders nothing when closed", () => {
      const { container } = render(
        <CreateAppointmentModal
          isOpen={false}
          newAppointment={mockNewAppointment}
          availableSlots={[]}
          onAppointmentChange={vi.fn()}
          onSubmit={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders creation fields and handles submit", () => {
      const handleSubmit = vi.fn();
      const handleChange = vi.fn();
      const handleClose = vi.fn();

      render(
        <CreateAppointmentModal
          isOpen={true}
          newAppointment={mockNewAppointment}
          availableSlots={[]}
          onAppointmentChange={handleChange}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />,
      );

      expect(screen.getByText("موعد جديد")).toBeDefined();
      expect(screen.getByPlaceholderText("اسم العميل")).toBeDefined();
      expect(screen.getByPlaceholderText("عنوان الموعد")).toBeDefined();

      const submitBtn = screen.getByRole("button", { name: "حجز الموعد" });
      fireEvent.click(submitBtn);
      expect(handleSubmit).toHaveBeenCalledTimes(1);

      const cancelBtn = screen.getByRole("button", { name: "إلغاء" });
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Appointments (Coordinator Shell)", () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockAppointments,
            }),
        }),
      );
    });

    it("renders loading spinner and then appointments dashboard", async () => {
      render(<Appointments />);

      await waitFor(() => {
        expect(screen.getByText("إدارة المواعيد والتقويم")).toBeDefined();
      });

      expect(screen.getByText("استشارة تسويق رقمي")).toBeDefined();
      expect(screen.getByText("تدريب على المنصة")).toBeDefined();
    });
  });
});
