import React from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { PublishConfirmationModal } from "./PublishConfirmationModal";
import type { useCreateAdWizardController } from "./useCreateAdWizardController";

interface AiDraftReviewViewProps {
  controller: ReturnType<typeof useCreateAdWizardController>;
}

export const AiDraftReviewView: React.FC<AiDraftReviewViewProps> = ({
  controller,
}) => {
  const {
    isEn,
    navigate,
    setShowFullWizard,
    setCurrentStep,
    selectedAdAccountName,
    selectedAdAccountId,
    requestedAdAccountId,
    selectedFacebookPage,
    formData,
    selectedFacebookPixel,
    selectedObjectiveLabel,
    formatSelectedAdAccountCurrency,
    selectedGeoSummary,
    selectedCreativeSummary,
    prefillProductTitle,
    errors,
    handleChange,
    handleRequestPublishConfirmation,
    loading,
  } = controller;

  const compactRows = [
    [
      isEn ? "Account" : "الحساب",
      `${selectedAdAccountName} / act_${selectedAdAccountId || requestedAdAccountId}`,
    ],
    [
      isEn ? "Page" : "الصفحة",
      selectedFacebookPage?.name ||
        formData.pageId ||
        (isEn ? "Unspecified" : "غير محددة"),
    ],
    [
      "Pixel",
      selectedFacebookPixel
        ? `${selectedFacebookPixel.name} / ${selectedFacebookPixel.id}`
        : formData.pixelId || (isEn ? "Unspecified" : "غير محدد"),
    ],
    [isEn ? "Objective" : "الهدف", selectedObjectiveLabel],
    [
      isEn ? "Budget" : "الميزانية",
      `${formatSelectedAdAccountCurrency(formData.budgetAmount)} / ${
        formData.budgetType === "DAILY"
          ? isEn
            ? "Daily"
            : "يوميا"
          : isEn
            ? "Lifetime"
            : "إجمالي"
      }`,
    ],
    [
      isEn ? "Audience" : "الجمهور",
      selectedGeoSummary || (isEn ? "Unspecified" : "غير محدد"),
    ],
    [isEn ? "Age" : "السن", `${formData.ageMin} - ${formData.ageMax}`],
    [isEn ? "Creative" : "الكرياتيف", selectedCreativeSummary],
  ];

  const returnParams = new URLSearchParams();
  const returnAccountId = selectedAdAccountId || requestedAdAccountId;
  if (returnAccountId) {
    returnParams.set("adAccountId", returnAccountId);
  }

  return (
    <div
      className="min-h-screen bg-slate-50 px-3 py-3 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-4 lg:px-5"
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-bold text-blue-600">
              {isEn ? "Draft Review" : "مراجعة المسودة"}
            </div>
            <h1 className="mt-1 truncate text-lg font-black text-slate-950 dark:text-white">
              {formData.campaignName || prefillProductTitle}
            </h1>
            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{prefillProductTitle}</span>
              <span>{selectedCreativeSummary}</span>
              <span>{formData.status}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowFullWizard(true);
                setCurrentStep(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {isEn ? "Full Edit" : "تعديل كامل"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/advertising/facebook-ads${
                    returnParams.toString() ? `?${returnParams.toString()}` : ""
                  }`
                )
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {isEn ? "Back to Ads Center" : "رجوع لمركز الإعلانات"}
            </button>
          </div>
        </div>

        {Object.values(errors).some(Boolean) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
            {Object.values(errors).filter(Boolean).join(" - ")}
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {compactRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="text-[11px] font-bold uppercase text-slate-500">
                    {label}
                  </div>
                  <div className="mt-1 break-words text-sm font-bold text-slate-950 dark:text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500">
                  {isEn ? "Primary Text" : "النص الأساسي"}
                </div>
                <p className="mt-2 max-h-28 overflow-y-auto text-sm leading-6 text-slate-800 dark:text-slate-200">
                  {formData.primaryText || (isEn ? "Unspecified" : "غير محدد")}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500">
                  {isEn ? "Headline & Link" : "العنوان والرابط"}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-950 dark:text-white">
                  {formData.headline || (isEn ? "No headline" : "بدون عنوان")}
                </div>
                <div className="mt-1 truncate text-xs font-semibold text-blue-600">
                  {formData.linkUrl || (isEn ? "No link" : "بدون رابط")}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm font-black text-slate-950 dark:text-white">
              {isEn ? "Publish Status" : "حالة النشر"}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange("status", "PAUSED")}
                className={`rounded-md border px-3 py-2 text-sm font-bold ${
                  formData.status === "PAUSED"
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
                }`}
              >
                PAUSED
              </button>
              <button
                type="button"
                onClick={() => handleChange("status", "ACTIVE")}
                className={`rounded-md border px-3 py-2 text-sm font-bold ${
                  formData.status === "ACTIVE"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200"
                }`}
              >
                ACTIVE
              </button>
            </div>
            <button
              type="button"
              onClick={handleRequestPublishConfirmation}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-black text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEn ? "Creating..." : "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isEn ? "Review & Publish" : "مراجعة الإرسال"}
                </>
              )}
            </button>
            <div className="mt-3 rounded-md bg-slate-50 p-2 text-xs font-semibold leading-5 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              {isEn
                ? "The same draft lock and an idempotent publish request will be used."
                : "سيتم استخدام نفس قفل الدرفت وطلب نشر جديد آمن من التكرار."}
            </div>
          </aside>
        </div>
      </div>
      <PublishConfirmationModal controller={controller} />
    </div>
  );
};
