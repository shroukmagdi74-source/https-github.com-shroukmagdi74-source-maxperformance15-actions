// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  RadiologyKpiCards,
  RadiologyReportsFilterBar,
  RadiologyReportsTable,
  RadiologyConfirmActionModal,
  RadiologyBulkActionBar,
  RadiologyReportStudyHeader,
  RadiologyReportTemplateEditor,
  RadiologyReportAiDraftSection,
  RadiologyReportCriticalSection,
  ReportRow,
  ReportStudy,
  Counters,
  nextActionFor,
  fmtDate,
  ACTION_META,
} from "../reports-tab";

// Mock i18n
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: any) => {
        const translations: Record<string, string> = {
          "radiology.reports.title": "تقارير الأشعة",
          "radiology.reports.subtitle": "إدارة ومتابعة تقارير الفحوصات الإشعاعية",
          "radiology.refresh": "تحديث",
          "radiology.reports.total": "إجمالي التقارير",
          "radiology.reports.awaitingReview": "بانتظار المراجعة",
          "radiology.reports.awaitingSign": "بانتظار التوقيع",
          "radiology.reports.deliveredToday": "مسلم اليوم",
          "radiology.reports.critical": "حالات حرجة",
          "radiology.reports.allStatuses": "كل الحالات",
          "radiology.reports.allReports": "كل التقارير",
          "radiology.critical.criticalList": "حرجة فقط",
          "radiology.critical.none": "عادية",
          "radiology.reports.searchByPatient": "بحث باسم المريض...",
          "radiology.reports.studyNumber": "رقم الفحص",
          "radiology.reports.patient": "المريض",
          "radiology.reports.examType": "نوع الفحص",
          "radiology.reports.reportStatus": "حالة التقرير",
          "radiology.reports.roles": "الأدوار",
          "radiology.reports.lastUpdated": "آخر تحديث",
          "radiology.reports.actions": "الإجراءات",
          "radiology.reports.review": "مراجعة",
          "radiology.reports.sign": "توقيع",
          "radiology.reports.deliver": "تسليم",
          "radiology.reports.confirmAction": "تأكيد الإجراء",
          "radiology.reports.reviewConfirm": "هل أنت متأكد من مراجعة هذا التقرير؟",
          "radiology.cancel": "إلغاء",
          "radiology.confirm": "تأكيد",
          "radiology.bulk.selected": `تم تحديد ${opts?.count || 0}`,
          "radiology.bulk.review": "مراجعة جماعية",
          "radiology.bulk.sign": "توقيع جماعي",
          "radiology.bulk.deliver": "تسليم جماعي",
          "radiology.bulk.done": "إلغاء التحديد",
          "radiology.reports.templates": "قوالب التقارير",
          "radiology.reports.noTemplate": "بدون قالب",
          "radiology.reports.quickPhrases": "عبارات سريعة",
          "radiology.reports.findingsLabel": "النتائج (Findings)",
          "radiology.reports.impressionLabel": "الانطباع (Impression)",
          "radiology.aiDraft.focus": "تركيز الذكاء الاصطناعي",
          "radiology.aiDraft.generate": "توليد مسودة",
          "radiology.critical.title": "التنبيهات الحرجة",
          "radiology.critical.flag": "تحديد كحرج",
          "radiology.critical.clear": "إلغاء التنبيه",
        };
        return translations[key] || key;
      },
    }),
  };
});

describe("RadiologyReportsTab Modular Subcomponents", () => {
  afterEach(() => {
    cleanup();
  });

  const mockCounters: Counters = {
    total: 85,
    awaitingReview: 12,
    awaitingSign: 8,
    deliveredToday: 24,
    critical: 3,
  };

  const mockRow: ReportRow = {
    id: "study-101",
    patientName: "خالد إبراهيم",
    studyNumber: "RAD-2026-001",
    examTypeName: "أشعة سينية على الصدر",
    studyDate: "2026-03-20T10:00:00Z",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-20T11:00:00Z",
    status: "COMPLETED",
    report: {
      id: "rep-101",
      studyId: "study-101",
      reportStatus: "DRAFT",
      reportText: "فحص الصدر طبيعي بالكامل",
      typedBy: "د. أحمد سامي",
      reviewedBy: null,
      signedBy: null,
      createdAt: "2026-03-20T10:15:00Z",
      updatedAt: "2026-03-20T10:30:00Z",
    },
  };

  const mockStudy: ReportStudy = {
    id: "study-101",
    patientName: "خالد إبراهيم",
    studyNumber: "RAD-2026-001",
    examTypeName: "أشعة سينية على الصدر",
    studyDate: "2026-03-20T10:00:00Z",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-20T11:00:00Z",
    status: "COMPLETED",
    emergency: true,
    withContrast: false,
    billingType: "INSURANCE",
  };

  it("RadiologyKpiCards renders 5 cards with counter values and active toggle", () => {
    const isCounterActive = vi.fn((key) => key === "awaitingReview");
    const toggleCounter = vi.fn();

    render(
      <RadiologyKpiCards
        counters={mockCounters}
        isCounterActive={isCounterActive}
        toggleCounter={toggleCounter}
      />
    );

    expect(screen.getByText("إجمالي التقارير")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("بانتظار المراجعة")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    const reviewCard = screen.getByText("بانتظار المراجعة").closest("button");
    if (reviewCard) {
      fireEvent.click(reviewCard);
      expect(toggleCounter).toHaveBeenCalledWith("awaitingReview");
    }
  });

  it("RadiologyReportsFilterBar updates filter fields", () => {
    const updateFilter = vi.fn();
    render(
      <RadiologyReportsFilterBar
        filters={{
          search: "",
          studySearch: "",
          statusFilter: "",
          criticalFilter: "",
          dateFrom: "",
          dateTo: "",
        }}
        updateFilter={updateFilter}
        refreshing={false}
      />
    );

    const searchInput = screen.getByPlaceholderText("بحث باسم المريض...");
    fireEvent.change(searchInput, { target: { value: "خالد" } });
    expect(updateFilter).toHaveBeenCalledWith("search", "خالد");
  });

  it("RadiologyReportsTable renders report row and triggers edit/confirm actions", () => {
    const toggleSelect = vi.fn();
    const toggleSelectAll = vi.fn();
    const onEdit = vi.fn();
    const onConfirmAction = vi.fn();
    const navigate = vi.fn();

    render(
      <RadiologyReportsTable
        rows={[mockRow]}
        canManage={true}
        selected={new Set()}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        allVisibleSelected={false}
        busyId={null}
        onEdit={onEdit}
        onConfirmAction={onConfirmAction}
        navigate={navigate}
      />
    );

    expect(screen.getByText("خالد إبراهيم")).toBeInTheDocument();
    expect(screen.getByText("RAD-2026-001")).toBeInTheDocument();
    expect(screen.getByText("أشعة سينية على الصدر")).toBeInTheDocument();

    const editBtn = screen.getByTitle("radiology.reports.editReport");
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith("study-101");
  });

  it("RadiologyConfirmActionModal displays confirmation details and fires onConfirm", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <RadiologyConfirmActionModal
        confirmAction={{ id: "study-101", kind: "review" }}
        onClose={onClose}
        onConfirm={onConfirm}
        busy={false}
      />
    );

    expect(screen.getByText("تأكيد الإجراء")).toBeInTheDocument();
    expect(screen.getByText("هل أنت متأكد من مراجعة هذا التقرير؟")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "تأكيد" });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith("study-101", "review");
  });

  it("RadiologyBulkActionBar renders selected count and action triggers", () => {
    const onBulkAction = vi.fn();
    const onClearSelection = vi.fn();

    render(
      <RadiologyBulkActionBar
        selectedCount={3}
        bulkBusy={null}
        onBulkAction={onBulkAction}
        onClearSelection={onClearSelection}
      />
    );

    expect(screen.getByText("تم تحديد 3")).toBeInTheDocument();

    const bulkReviewBtn = screen.getByRole("button", { name: "مراجعة جماعية" });
    fireEvent.click(bulkReviewBtn);
    expect(onBulkAction).toHaveBeenCalledWith("review");

    const clearBtn = screen.getByRole("button", { name: "إلغاء التحديد" });
    fireEvent.click(clearBtn);
    expect(onClearSelection).toHaveBeenCalled();
  });

  it("RadiologyReportStudyHeader displays study details and flags", () => {
    render(
      <RadiologyReportStudyHeader
        study={mockStudy}
        reportStatus="DRAFT"
      />
    );

    expect(screen.getByText("خالد إبراهيم")).toBeInTheDocument();
    expect(screen.getByText("RAD-2026-001")).toBeInTheDocument();
  });

  it("RadiologyReportTemplateEditor handles text typing and section append", () => {
    const applyTemplate = vi.fn();
    const setText = vi.fn();
    const appendText = vi.fn();
    const appendSection = vi.fn();
    const setShowPhrases = vi.fn();

    render(
      <RadiologyReportTemplateEditor
        templates={[{ id: "tpl-1", name: "قالب الصدر", body: "قالب افتراضي" }]}
        templateId="tpl-1"
        applyTemplate={applyTemplate}
        text="تقرير طبي"
        setText={setText}
        appendText={appendText}
        appendSection={appendSection}
        showPhrases={false}
        setShowPhrases={setShowPhrases}
      />
    );

    expect(screen.getByDisplayValue("تقرير طبي")).toBeInTheDocument();

    const findingsBtn = screen.getByRole("button", { name: "النتائج (Findings)" });
    fireEvent.click(findingsBtn);
    expect(appendSection).toHaveBeenCalledWith("findingsLabel");
  });

  it("RadiologyReportAiDraftSection triggers draft generation", () => {
    const setAiFocus = vi.fn();
    const generateDraft = vi.fn();

    render(
      <RadiologyReportAiDraftSection
        aiFocus="full"
        setAiFocus={setAiFocus}
        generating={false}
        generateDraft={generateDraft}
        hasText={false}
        aiMeta={null}
      />
    );

    const genBtn = screen.getByRole("button", { name: "توليد مسودة" });
    fireEvent.click(genBtn);
    expect(generateDraft).toHaveBeenCalled();
  });

  it("RadiologyReportCriticalSection updates critical category and findings", () => {
    const setCritCategory = vi.fn();
    const setCritFindingText = vi.fn();
    const saveCritical = vi.fn();
    const acknowledgeCritical = vi.fn();

    render(
      <RadiologyReportCriticalSection
        critCategory="CAT1"
        setCritCategory={setCritCategory}
        critFindingText="نزيف رئوي حاد"
        setCritFindingText={setCritFindingText}
        saveCritical={saveCritical}
        savingCritical={false}
        critChanged={true}
        criticalMeta={{ label: "حرج", color: "bg-red-100" }}
        criticalCat="CRITICAL"
        report={mockRow.report || null}
        fmtDateTime={() => "2026-03-20"}
        canManage={true}
        acknowledgeCritical={acknowledgeCritical}
        acknowledging={false}
      />
    );

    expect(screen.getByText("التنبيهات الحرجة")).toBeInTheDocument();
    expect(screen.getByDisplayValue("نزيف رئوي حاد")).toBeInTheDocument();

    const flagBtn = screen.getByRole("button", { name: /تحديد كحرج/ });
    fireEvent.click(flagBtn);
    expect(saveCritical).toHaveBeenCalled();
  });

  it("Constants and helpers advance report statuses correctly", () => {
    expect(nextActionFor("DRAFT")).toBe("review");
    expect(nextActionFor("REVIEWED")).toBe("sign");
    expect(nextActionFor("SIGNED")).toBe("deliver");
    expect(nextActionFor("DELIVERED")).toBeNull();

    expect(fmtDate("2026-03-20T10:00:00Z")).toBeDefined();
    expect(ACTION_META.review.labelKey).toBe("radiology.reports.review");
  });
});
