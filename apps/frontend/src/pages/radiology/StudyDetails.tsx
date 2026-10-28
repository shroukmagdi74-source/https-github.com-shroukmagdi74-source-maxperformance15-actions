import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RadiologyViewerModal from "./RadiologyViewerModal";
import {
  useStudyDetails,
  StudyDetailsHeader,
  StudyPatientExamCard,
  StudyHistoryTimelineCard,
  StudyReportCard,
  StudyImagesInsuranceCard,
  StudyPaymentCard,
  StudyPaymentModal,
} from "./study-details";

export default function StudyDetails({ studyId }: { studyId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data,
    loading,
    error,
    load,
    canManage,
    siblings,
    viewerOpen,
    setViewerOpen,
    payModal,
    setPayModal,
    payAmount,
    setPayAmount,
    payMethod,
    setPayMethod,
    payNote,
    setPayNote,
    savingPay,
    recordPayment,
    recordRefund,
    printing,
    printPdf,
    editingReport,
    startEditReport,
    cancelEditReport,
    draftText,
    setDraftText,
    savingReport,
    saveReport,
    aiDrafting,
    aiDraftInfo,
    generateDraft,
    criticalOpen,
    setCriticalOpen,
    criticalCategory,
    setCriticalCategory,
    criticalFindingText,
    setCriticalFindingText,
    savingCritical,
    saveCriticalFlag,
    acknowledgeCritical,
    history,
    flags,
  } = useStudyDetails(studyId);

  if (loading) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto p-4 md:p-6 w-full min-h-screen">
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const study = data?.study;
  if (error || !study) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto p-4 md:p-6 w-full min-h-screen">
        <div className="text-center py-24 space-y-4">
          <p className="text-red-500">{error || t("radiology.operationFailed")}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => void load()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              {t("radiology.reports.retry")}
            </button>
            <button
              onClick={() => navigate("/radiology/studies")}
              className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              {t("radiology.details.back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const appointment = data?.appointment || null;
  const images = data?.images || [];
  const report = data?.report || null;
  const payments = data?.payments || [];
  const shiftPayments = data?.shiftPayments || [];
  const insuranceInvoice = data?.insuranceInvoice || null;
  const totals = data?.totals || { total: 0, paidAmount: 0, remaining: 0 };
  const billingType = totals.billingType;

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-4 md:p-6 w-full min-h-screen">
      {/* Header */}
      <StudyDetailsHeader study={study} totals={totals} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Main Details, Reports, Images) */}
        <div className="space-y-6 lg:col-span-2">
          <StudyPatientExamCard
            study={study}
            appointment={appointment}
            flags={flags}
            billingType={billingType}
          />

          <StudyHistoryTimelineCard
            study={study}
            appointment={appointment}
            siblings={siblings}
            history={history}
          />

          <StudyReportCard
            report={report}
            printing={printing}
            printPdf={printPdf}
            editingReport={editingReport}
            startEditReport={startEditReport}
            cancelEditReport={cancelEditReport}
            savingReport={savingReport}
            saveReport={saveReport}
            draftText={draftText}
            setDraftText={setDraftText}
            aiDrafting={aiDrafting}
            aiDraftInfo={aiDraftInfo}
            generateDraft={generateDraft}
            criticalOpen={criticalOpen}
            setCriticalOpen={setCriticalOpen}
            criticalCategory={criticalCategory}
            setCriticalCategory={setCriticalCategory}
            criticalFindingText={criticalFindingText}
            setCriticalFindingText={setCriticalFindingText}
            savingCritical={savingCritical}
            saveCriticalFlag={saveCriticalFlag}
            acknowledgeCritical={acknowledgeCritical}
            canManage={canManage}
          />

          <StudyImagesInsuranceCard
            images={images}
            onOpenViewer={() => setViewerOpen(true)}
            insuranceInvoice={insuranceInvoice}
          />
        </div>

        {/* Right Column (Payments & Notes) */}
        <StudyPaymentCard
          study={study}
          totals={totals}
          payments={payments}
          shiftPayments={shiftPayments}
          appointment={appointment}
          onOpenPayModal={setPayModal}
        />
      </div>

      {/* Payment / Refund Modal */}
      <StudyPaymentModal
        isOpen={payModal !== null}
        type={payModal}
        onClose={() => setPayModal(null)}
        savingPay={savingPay}
        payAmount={payAmount}
        setPayAmount={setPayAmount}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        payNote={payNote}
        setPayNote={setPayNote}
        onRecordPayment={recordPayment}
        onRecordRefund={recordRefund}
      />

      {/* DICOM / Image Viewer Modal */}
      {viewerOpen ? (
        <RadiologyViewerModal studyId={studyId} onClose={() => setViewerOpen(false)} />
      ) : null}
    </div>
  );
}

export * from "./study-details";
