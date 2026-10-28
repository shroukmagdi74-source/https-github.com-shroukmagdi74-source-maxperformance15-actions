// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Card, Row } from "../study-details/CardRow";
import {
  fmtDate,
  fmtDateTime,
  fmtMoney,
  signed,
  genderText,
  methodText,
  billingTypeText,
  turnaroundText,
} from "../study-details/helpers";
import { StudyDetailsHeader } from "../study-details/StudyDetailsHeader";
import { StudyPatientExamCard } from "../study-details/StudyPatientExamCard";
import { StudyImagesInsuranceCard } from "../study-details/StudyImagesInsuranceCard";
import { StudyPaymentCard } from "../study-details/StudyPaymentCard";
import { StudyPaymentModal } from "../study-details/StudyPaymentModal";
import type {
  StudyDetailsPayment,
  StudyDetailsShiftPayment,
  StudyDetailsInsuranceInvoice,
  StudyDetailsTotals,
} from "../study-details/types";
import type { RadiologyReport, RadiologyStudy, RadiologyStudyImage } from "../shared";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "radiology.details.title": "تفاصيل الفحص",
        "radiology.details.back": "العودة",
        "radiology.paymentMethod.CASH": "نقدي",
        "radiology.gender.male": "ذكر",
        "radiology.gender.female": "أنثى",
        "radiology.gender.unspecified": "غير محدد",
        "radiology.details.billingType.INSURANCE": "تأمين",
        "radiology.details.billingType.PATIENT": "مريض",
        "radiology.currency": "ج.م",
        "radiology.details.patient": "المريض",
        "radiology.patients.name": "الاسم",
        "radiology.schedule.phone": "الهاتف",
        "radiology.schedule.gender": "النوع",
        "radiology.schedule.age": "العمر",
        "radiology.studies.emergency": "طوارئ",
        "radiology.reception.withContrast": "مع صبغة",
        "radiology.details.exam": "الفحص",
        "radiology.studies.examType": "نوع الفحص",
        "radiology.details.images": "الصور",
        "radiology.reports.viewImages": "عرض الصور",
        "radiology.details.insurance": "التأمين",
        "radiology.details.payment": "المدفوعات",
        "radiology.details.recordPayment": "تسجيل دفعة",
        "radiology.details.refund": "استرداد",
        "radiology.details.notes": "الملاحظات",
        "radiology.cancel": "إلغاء",
      };
      return translations[key] || key;
    },
    i18n: { language: "ar" },
  }),
}));

describe("StudyDetails Modular Subcomponents", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockStudy: RadiologyStudy = {
    id: "std-12345678",
    studyNumber: "RAD-2026-001",
    patientName: "أحمد محمد علي",
    patientPhone: "01001234567",
    patientGender: "male",
    patientAge: 35,
    nationalId: "29001011234567",
    insuranceNumber: "INS-9988",
    emergency: true,
    withContrast: true,
    patientFlags: "ALLERGIC,DIABETIC",
    examTypeName: "أشعة مقطعية على المخ",
    orderStatus: "COMPLETED",
    status: "READY",
    paymentStatus: "PAID",
    referralDoctor: "د. هاني شاكر",
    referralSourceName: "عيادة المخ والأعصاب",
    marketingRepName: "كريم أحمد",
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-15T12:00:00Z",
  };

  const mockTotals: StudyDetailsTotals = {
    total: 1200,
    paidAmount: 1200,
    remaining: 0,
    paymentStatus: "PAID",
    billingType: "PATIENT",
  };

  const mockImages: RadiologyStudyImage[] = [
    {
      id: "img-1",
      fileName: "brain_axial_001.dcm",
      seriesDescription: "Axial T1",
      fileSize: 204800,
      createdAt: "2026-10-15T10:30:00Z",
    },
  ];

  const mockInsuranceInvoice: StudyDetailsInsuranceInvoice = {
    id: "inv-1",
    invoiceNumber: "INV-2026-90",
    insuranceCompanyName: "شركة مصر للتأمين",
    total: 2500,
    paidAmount: 2000,
    remaining: 500,
    paymentStatus: "PARTIAL",
  };

  const mockPayments: StudyDetailsPayment[] = [
    {
      id: "pay-1",
      amount: 1200,
      method: "CASH",
      note: "دفع نقدي بالكامل",
      paidBy: "المريض",
      createdAt: "2026-10-15T10:15:00Z",
    },
  ];

  const mockShiftPayments: StudyDetailsShiftPayment[] = [
    {
      id: "shift-1",
      shiftId: "sh-99",
      amount: 1200,
      method: "CASH",
      note: "وردية الصباح",
      createdAt: "2026-10-15T10:15:00Z",
    },
  ];

  describe("helpers", () => {
    it("formats dates and money correctly", () => {
      expect(fmtDate(undefined)).toBe("—");
      expect(fmtDate("2026-10-15T10:00:00Z")).toContain("أكتوبر");

      expect(fmtDateTime(undefined)).toBe("—");
      expect(fmtDateTime("2026-10-15T10:30:00Z")).toContain("أكتوبر");

      expect(fmtMoney(1500, "ج.م")).toBe("1500 ج.م");
      expect(signed(500)).toBe("+500");
      expect(signed(-300)).toBe("-300");
    });

    it("returns correct gender, method, and billing labels", () => {
      const tMock = (k: string) => {
        const dict: Record<string, string> = {
          "radiology.gender.male": "ذكر",
          "radiology.gender.female": "أنثى",
          "radiology.gender.unspecified": "غير محدد",
          "radiology.paymentMethod.CASH": "نقدي",
          "radiology.details.billingType.INSURANCE": "تأمين",
          "radiology.details.billingType.PATIENT": "مريض",
        };
        return dict[k] || k;
      };

      expect(genderText("male", tMock)).toBe("ذكر");
      expect(genderText("female", tMock)).toBe("أنثى");
      expect(genderText(undefined, tMock)).toBe("غير محدد");
      expect(genderText("male")).toBe("radiology.gender.male");

      expect(methodText("CASH", tMock)).toBe("نقدي");
      expect(methodText(undefined)).toBe("—");

      expect(billingTypeText("INSURANCE", tMock)).toBe("تأمين");
      expect(billingTypeText("PATIENT", tMock)).toBe("مريض");
      expect(billingTypeText("INSURANCE")).toBe("radiology.details.billingType.INSURANCE");
    });

    it("computes turnaround time correctly", () => {
      expect(turnaroundText(null)).toBe("—");
      const report: RadiologyReport = {
        id: "rep-1",
        createdAt: "2026-10-15T10:00:00Z",
        signedAt: "2026-10-15T12:30:00Z",
        updatedAt: "2026-10-15T12:30:00Z",
      };
      expect(turnaroundText(report)).toBe("2س 30د");
    });
  });

  describe("Card and Row", () => {
    it("renders Card with title, icon, action, and children", () => {
      render(
        <Card
          title="بيانات الفحص"
          icon={<span data-testid="icon">ICON</span>}
          action={<button>إجراء</button>}
        >
          <Row label="نوع الجهاز">رنين مغناطيسي</Row>
        </Card>,
      );

      expect(screen.getByText("بيانات الفحص")).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "إجراء" })).toBeInTheDocument();
      expect(screen.getByText("نوع الجهاز")).toBeInTheDocument();
      expect(screen.getByText("رنين مغناطيسي")).toBeInTheDocument();
    });
  });

  describe("StudyDetailsHeader", () => {
    it("renders study title, number, statuses, and handles back button", () => {
      render(<StudyDetailsHeader study={mockStudy} totals={mockTotals} />);

      expect(screen.getByText("تفاصيل الفحص")).toBeInTheDocument();
      expect(screen.getByText("RAD-2026-001")).toBeInTheDocument();

      const backBtn = screen.getByRole("button", { name: /العودة/i });
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith("/radiology/studies");
    });
  });

  describe("StudyPatientExamCard", () => {
    it("renders patient information, flags, and exam details", () => {
      render(
        <StudyPatientExamCard
          study={mockStudy}
          flags={["ALLERGIC"]}
          billingType="PATIENT"
        />,
      );

      expect(screen.getByText("أحمد محمد علي")).toBeInTheDocument();
      expect(screen.getByText("01001234567")).toBeInTheDocument();
      expect(screen.getByText("طوارئ")).toBeInTheDocument();
      expect(screen.getByText("مع صبغة")).toBeInTheDocument();
      expect(screen.getByText("أشعة مقطعية على المخ")).toBeInTheDocument();
      expect(screen.getByText("د. هاني شاكر")).toBeInTheDocument();
    });
  });

  describe("StudyImagesInsuranceCard", () => {
    it("renders image items, triggers viewer, and displays insurance invoice", () => {
      const onOpenViewer = vi.fn();
      render(
        <StudyImagesInsuranceCard
          images={mockImages}
          onOpenViewer={onOpenViewer}
          insuranceInvoice={mockInsuranceInvoice}
        />,
      );

      expect(screen.getByText(/brain_axial_001\.dcm/)).toBeInTheDocument();
      const viewBtn = screen.getByRole("button", { name: /عرض الصور/i });
      fireEvent.click(viewBtn);
      expect(onOpenViewer).toHaveBeenCalledTimes(1);

      expect(screen.getByText("شركة مصر للتأمين")).toBeInTheDocument();
      expect(screen.getByText("INV-2026-90")).toBeInTheDocument();
    });
  });

  describe("StudyPaymentCard", () => {
    it("renders totals, payment records, and triggers pay modal", () => {
      const onOpenPayModal = vi.fn();
      render(
        <StudyPaymentCard
          study={mockStudy}
          totals={mockTotals}
          payments={mockPayments}
          shiftPayments={mockShiftPayments}
          onOpenPayModal={onOpenPayModal}
        />,
      );

      expect(screen.getAllByText("1200 ج.م").length).toBeGreaterThan(0);
      expect(screen.getByText(/دفع نقدي بالكامل/)).toBeInTheDocument();

      const payBtn = screen.getByRole("button", { name: /تسجيل دفعة/i });
      fireEvent.click(payBtn);
      expect(onOpenPayModal).toHaveBeenCalledWith("PAY");

      const refundBtn = screen.getByRole("button", { name: /استرداد/i });
      fireEvent.click(refundBtn);
      expect(onOpenPayModal).toHaveBeenCalledWith("REFUND");
    });
  });

  describe("StudyPaymentModal", () => {
    it("returns null when closed", () => {
      const { container } = render(
        <StudyPaymentModal
          isOpen={false}
          type={null}
          onClose={vi.fn()}
          savingPay={false}
          payAmount=""
          setPayAmount={vi.fn()}
          payMethod="CASH"
          setPayMethod={vi.fn()}
          payNote=""
          setPayNote={vi.fn()}
          onRecordPayment={vi.fn()}
          onRecordRefund={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders form for payment and triggers actions", () => {
      const onClose = vi.fn();
      const onRecordPayment = vi.fn();

      render(
        <StudyPaymentModal
          isOpen={true}
          type="PAY"
          onClose={onClose}
          savingPay={false}
          payAmount="500"
          setPayAmount={vi.fn()}
          payMethod="CASH"
          setPayMethod={vi.fn()}
          payNote="ملاحظة دفع"
          setPayNote={vi.fn()}
          onRecordPayment={onRecordPayment}
          onRecordRefund={vi.fn()}
        />,
      );

      expect(screen.getByDisplayValue("500")).toBeInTheDocument();
      expect(screen.getByDisplayValue("ملاحظة دفع")).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: "إلغاء" });
      fireEvent.click(cancelBtn);
      expect(onClose).toHaveBeenCalled();

      const submitBtn = screen.getByRole("button", { name: "تسجيل دفعة" });
      fireEvent.click(submitBtn);
      expect(onRecordPayment).toHaveBeenCalled();
    });
  });
});
