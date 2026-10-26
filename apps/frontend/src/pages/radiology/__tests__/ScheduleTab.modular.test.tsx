// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

afterEach(() => {
  cleanup();
});

const mockT = (key: string, opts?: any) => {
  if (opts?.count !== undefined) return `${key} (${opts.count})`;
  if (opts?.name) return `${key}: ${opts.name}`;
  return key;
};

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock shared utilities in radiology
vi.mock("../shared", () => ({
  api: (endpoint: string) => `http://api.local/radiology/${endpoint}`,
  bookingApi: (endpoint: string) => `http://api.local/booking/${endpoint}`,
  fetchJson: vi.fn(() => Promise.resolve([])),
  tryParseJSON: (val: any) => {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  },
  useRadiologyRiskFlags: () => [
    { value: "diabetic", label: "سكر" },
    { value: "hypertensive", label: "ضغط" },
  ],
  parsePatientFlags: (flags: any) => (Array.isArray(flags) ? flags : []),
  flagMeta: (flag: string) => ({ label: flag, color: "bg-red-100 text-red-700" }),
  MODAL_CONTENT_CLS: "bg-white p-6 rounded-lg",
  MODAL_INPUT_CLS: "border px-3 py-2 rounded",
  DEFAULT_ID_SETTINGS: {
    bookingPrefix: "RAD-",
    digits: 4,
    enabled: true,
  },
  formatSequentialId: (prefix: string, no: number) =>
    no ? `${prefix}${no}` : "",
  fetchIdSettings: () =>
    Promise.resolve({
      bookingPrefix: "RAD-",
      digits: 4,
      enabled: true,
    }),
}));

// Mock ScheduleCalendar
vi.mock("../ScheduleCalendar", () => ({
  default: () => <div data-testid="schedule-calendar">Mock Calendar</div>,
  dayKey: (d: Date) => d.toISOString().slice(0, 10),
  addDays: (d: Date, n: number) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  },
  egyptWeekStart: (d: Date) => d,
}));

import {
  parseEgyptianNationalId,
  birthFromNationalId,
  fmtDate,
  ScheduleHeader,
  ScheduleDateFilters,
  ScheduleTable,
  ScheduleCardScanModal,
  ScheduleBookingModal,
  ScheduleTab,
  Appointment,
  ScheduleForm,
  emptyForm,
} from "../ScheduleTab";

const mockAppointments: Appointment[] = [
  {
    id: "apt-101",
    bookingNo: 101,
    patientName: "كريم سامي",
    patientPhone: "01001122334",
    examTypeName: "رنين مغناطيسي على المخ",
    examTypeIds: ["exam-1"],
    appointmentDate: "2026-11-01",
    appointmentTime: "09:30",
    status: "SCHEDULED",
    createdAt: "2026-10-27T00:00:00Z",
  },
  {
    id: "apt-102",
    bookingNo: 102,
    patientName: "منى عادل",
    patientPhone: "01122334455",
    examTypeName: "أشعة مقطعية على الصدر",
    examTypeIds: ["exam-2"],
    appointmentDate: "2026-11-01",
    appointmentTime: "11:00",
    status: "CHECKED_IN",
    createdAt: "2026-10-27T00:00:00Z",
  },
];

describe("ScheduleTab Modular Subcomponents", () => {
  describe("Egyptian National ID Helpers", () => {
    it("correctly parses 14-digit Egyptian National ID", () => {
      // Century 2 = 1900s, 95 = 1995, 08 = August, 25 = 25th, odd digit 1 = male
      const maleId = "29508251234515";
      const parsedMale = parseEgyptianNationalId(maleId);
      expect(parsedMale).not.toBeNull();
      expect(parsedMale?.gender).toBe("male");
      expect(parsedMale?.year).toBe(1995);
      expect(parsedMale?.month).toBe(8);
      expect(parsedMale?.day).toBe(25);

      // Century 3 = 2000s, 02 = 2002, 03 = March, 14 = 14th, even digit 2 = female
      const femaleId = "30203141234525";
      const parsedFemale = parseEgyptianNationalId(femaleId);
      expect(parsedFemale).not.toBeNull();
      expect(parsedFemale?.gender).toBe("female");
      expect(parsedFemale?.year).toBe(2002);
      expect(parsedFemale?.month).toBe(3);
      expect(parsedFemale?.day).toBe(14);
    });

    it("extracts birth date string in YYYY-MM-DD", () => {
      expect(birthFromNationalId("29508251234515")).toBe("1995-08-25");
      expect(birthFromNationalId("30203141234525")).toBe("2002-03-14");
    });

    it("returns null or empty for invalid IDs", () => {
      expect(parseEgyptianNationalId("12345")).toBeNull();
      expect(parseEgyptianNationalId("19508251234515")).toBeNull(); // century 1 invalid
      expect(birthFromNationalId("invalid")).toBe("");
    });

    it("formats dates gracefully", () => {
      expect(fmtDate(undefined)).toBe("—");
      expect(fmtDate("2026-11-01")).toBeDefined();
    });
  });

  describe("ScheduleHeader", () => {
    it("renders title and view tabs and handles view change", () => {
      const handleViewChange = vi.fn();
      const handleOpenNew = vi.fn();

      render(
        <ScheduleHeader
          view="list"
          onViewChange={handleViewChange}
          search=""
          onSearchChange={vi.fn()}
          status=""
          onStatusChange={vi.fn()}
          onToday={vi.fn()}
          onRefresh={vi.fn()}
          onOpenNew={handleOpenNew}
        />,
      );

      expect(screen.getByText("radiology.schedule.title")).toBeDefined();
      expect(screen.getByText("radiology.scheduleCalendar.viewList")).toBeDefined();
      expect(screen.getByText("radiology.scheduleCalendar.viewDay")).toBeDefined();

      const newBookingBtn = screen.getByRole("button", {
        name: /radiology.schedule.newBooking/i,
      });
      fireEvent.click(newBookingBtn);
      expect(handleOpenNew).toHaveBeenCalledWith(false);

      const walkInBtn = screen.getByRole("button", {
        name: /radiology.schedule.walkIn/i,
      });
      fireEvent.click(walkInBtn);
      expect(handleOpenNew).toHaveBeenCalledWith(true);
    });
  });

  describe("ScheduleDateFilters", () => {
    it("renders date inputs and quick filters", () => {
      const handleDateFromChange = vi.fn();
      const handleDateToChange = vi.fn();
      const handleRetry = vi.fn();

      render(
        <ScheduleDateFilters
          dateFrom="2026-10-27"
          dateTo="2026-10-27"
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          loadError="فشل تحميل المواعيد"
          onRetry={handleRetry}
        />,
      );

      expect(screen.getByText("radiology.schedule.from")).toBeDefined();
      expect(screen.getByText("radiology.schedule.to")).toBeDefined();
      expect(screen.getByText("radiology.schedule.quickYesterday")).toBeDefined();
      expect(screen.getByText("فشل تحميل المواعيد")).toBeDefined();

      const retryBtn = screen.getByRole("button", {
        name: /radiology.schedule.retry/i,
      });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("ScheduleTable", () => {
    it("renders appointments rows and triggers actions", () => {
      const handleToggleSort = vi.fn();
      const handleToggleSelected = vi.fn();
      const handleAdvance = vi.fn();
      const handleConvert = vi.fn();

      render(
        <BrowserRouter>
          <ScheduleTable
            items={mockAppointments}
            sortedItems={mockAppointments}
            total={2}
            loading={false}
            sort={null}
            onToggleSort={handleToggleSort}
            selected={new Set()}
            onToggleSelected={handleToggleSelected}
            onToggleSelectAll={vi.fn()}
            isManagerUser={true}
            insuranceCompanies={[]}
            idSettings={{ bookingPrefix: "RAD-", digits: 4, enabled: true }}
            bulkBusy={null}
            onRunBulk={vi.fn()}
            onClearSelected={vi.fn()}
            onEdit={vi.fn()}
            onAdvance={handleAdvance}
            onConvert={handleConvert}
            onRemove={vi.fn()}
            onLoadMore={vi.fn()}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("كريم سامي")).toBeDefined();
      expect(screen.getByText("منى عادل")).toBeDefined();
      expect(screen.getByText("رنين مغناطيسي على المخ")).toBeDefined();

      const convertButtons = screen.getAllByTitle(
        "radiology.schedule.convertToStudy",
      );
      fireEvent.click(convertButtons[0]);
      expect(handleConvert).toHaveBeenCalledWith(mockAppointments[0]);
    });

    it("renders empty message when no bookings", () => {
      render(
        <BrowserRouter>
          <ScheduleTable
            items={[]}
            sortedItems={[]}
            total={0}
            loading={false}
            sort={null}
            onToggleSort={vi.fn()}
            selected={new Set()}
            onToggleSelected={vi.fn()}
            onToggleSelectAll={vi.fn()}
            isManagerUser={false}
            insuranceCompanies={[]}
            idSettings={{ bookingPrefix: "RAD-", digits: 4, enabled: true }}
            bulkBusy={null}
            onRunBulk={vi.fn()}
            onClearSelected={vi.fn()}
            onEdit={vi.fn()}
            onAdvance={vi.fn()}
            onConvert={vi.fn()}
            onRemove={vi.fn()}
            onLoadMore={vi.fn()}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText("radiology.schedule.noBookings")).toBeDefined();
    });
  });

  describe("ScheduleCardScanModal", () => {
    it("renders nothing when cardScan is null", () => {
      const { container } = render(
        <ScheduleCardScanModal
          cardScan={null}
          cardOcrBusy={false}
          cardScanTarget={null}
          nationalIdValue=""
          onNationalIdChange={vi.fn()}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal preview and triggers confirm", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <ScheduleCardScanModal
          cardScan="data:image/png;base64,mock"
          cardOcrBusy={false}
          cardScanTarget="newPatient"
          nationalIdValue="29508251234515"
          onNationalIdChange={vi.fn()}
          onConfirm={handleConfirm}
          onClose={handleClose}
        />,
      );

      expect(screen.getByText("radiology.schedule.cardScanTitle")).toBeDefined();
      const confirmBtn = screen.getByRole("button", {
        name: /radiology.schedule.cardScanConfirm/i,
      });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe("ScheduleBookingModal", () => {
    it("renders nothing when modal is null", () => {
      const { container } = render(
        <ScheduleBookingModal
          modal={null}
          saving={false}
          onClose={vi.fn()}
          onModalChange={vi.fn()}
          patientSearch=""
          onPatientSearchChange={vi.fn()}
          patientResults={[]}
          onPickPatient={vi.fn()}
          newPatientOpen={false}
          onOpenNewPatient={vi.fn()}
          onCloseNewPatient={vi.fn()}
          newPatient={{
            firstName: "",
            phone: "",
            gender: "",
            nationalId: "",
            birthDate: "",
          }}
          onNewPatientChange={vi.fn()}
          savingNewPatient={false}
          onSaveNewPatient={vi.fn()}
          onOpenCardScanner={vi.fn()}
          examSearch=""
          onExamSearchChange={vi.fn()}
          examOpen={false}
          setExamOpen={vi.fn()}
          examFiltered={[]}
          examTypes={[]}
          onToggleExam={vi.fn()}
          coverage={{}}
          entityPrice={null}
          additions={[]}
          insuranceCompanies={[]}
          referralSources={[]}
          externalPartners={[]}
          marketingReps={[]}
          devices={[]}
          items={[]}
          initialPayment={{ amount: "", method: "CASH" }}
          onInitialPaymentChange={vi.fn()}
          physicianSearch=""
          onPhysicianSearchChange={vi.fn()}
          physicianResults={[]}
          onPickPhysician={vi.fn()}
          patientFlags={[]}
          onSave={vi.fn()}
          onReceiveAndCreate={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders booking modal fields when modal is set", () => {
      const form = emptyForm();
      const handleSave = vi.fn();

      render(
        <ScheduleBookingModal
          modal={form}
          saving={false}
          onClose={vi.fn()}
          onModalChange={vi.fn()}
          patientSearch=""
          onPatientSearchChange={vi.fn()}
          patientResults={[]}
          onPickPatient={vi.fn()}
          newPatientOpen={false}
          onOpenNewPatient={vi.fn()}
          onCloseNewPatient={vi.fn()}
          newPatient={{
            firstName: "",
            phone: "",
            gender: "",
            nationalId: "",
            birthDate: "",
          }}
          onNewPatientChange={vi.fn()}
          savingNewPatient={false}
          onSaveNewPatient={vi.fn()}
          onOpenCardScanner={vi.fn()}
          examSearch=""
          onExamSearchChange={vi.fn()}
          examOpen={false}
          setExamOpen={vi.fn()}
          examFiltered={[]}
          examTypes={[]}
          onToggleExam={vi.fn()}
          coverage={{}}
          entityPrice={null}
          additions={[]}
          insuranceCompanies={[]}
          referralSources={[]}
          externalPartners={[]}
          marketingReps={[]}
          devices={[]}
          items={[]}
          initialPayment={{ amount: "", method: "CASH" }}
          onInitialPaymentChange={vi.fn()}
          physicianSearch=""
          onPhysicianSearchChange={vi.fn()}
          physicianResults={[]}
          onPickPhysician={vi.fn()}
          patientFlags={[]}
          onSave={handleSave}
          onReceiveAndCreate={vi.fn()}
        />,
      );

      expect(screen.getByText("radiology.schedule.newBookingModal")).toBeDefined();
      expect(screen.getByText("radiology.schedule.patientRequired")).toBeDefined();

      const saveBtn = screen.getByRole("button", {
        name: /radiology.save/i,
      });
      fireEvent.click(saveBtn);
      expect(handleSave).toHaveBeenCalledWith(false);
    });
  });

  describe("ScheduleTab (Coordinator Shell)", () => {
    it("renders coordinator shell without crashing", async () => {
      render(
        <BrowserRouter>
          <ScheduleTab />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("radiology.schedule.title")).toBeDefined();
      });
      expect(screen.getByText("radiology.schedule.subtitle")).toBeDefined();
    });
  });
});
