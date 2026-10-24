import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import {
  useCreateAdWizardController,
  PublishConfirmationModal,
  AiDraftReviewView,
  WizardStepper,
  WizardStepContent,
  WizardNavButtons,
} from "./create-ad-wizard/index";

const CreateAdWizard: React.FC = () => {
  const controller = useCreateAdWizardController();
  const {
    isEn,
    isAiDraftPrefill,
    showFullWizard,
    setShowFullWizard,
    isStorefrontProductLaunch,
    launchPrefillProductTitle,
    productLaunchUrl,
  } = controller;

  if (isAiDraftPrefill && !showFullWizard) {
    return <AiDraftReviewView controller={controller} />;
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="w-full px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEn ? "Create New Ad" : "إنشاء إعلان جديد"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEn
              ? "Follow the steps to create a professional advertising campaign"
              : "اتبع الخطوات لإنشاء حملة إعلانية احترافية"}
          </p>
        </div>

        {isStorefrontProductLaunch && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-900 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/80 dark:text-blue-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isEn ? "Storefront Product Scenario" : "سيناريو منتج المتجر"}
                </span>
                <p className="mt-1 font-medium">
                  {isEn
                    ? "Ad data was auto-filled for product: "
                    : "تم ملء بيانات الإعلان تلقائياً لمنتج: "}
                  <span className="font-bold">{launchPrefillProductTitle}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {productLaunchUrl && (
                  <a
                    href={productLaunchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    {isEn ? "Open Product URL" : "فتح رابط المنتج"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {isAiDraftPrefill && !showFullWizard && (
                  <button
                    type="button"
                    onClick={() => setShowFullWizard(true)}
                    className="font-semibold text-blue-700 underline hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                  >
                    {isEn
                      ? "Advanced Edit in Full Wizard"
                      : "تعديل متقدم في المعالج الكامل"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <WizardStepper controller={controller} />
        <WizardStepContent controller={controller} />
        <WizardNavButtons controller={controller} />
      </div>

      <PublishConfirmationModal controller={controller} />
    </div>
  );
};

export default CreateAdWizard;
