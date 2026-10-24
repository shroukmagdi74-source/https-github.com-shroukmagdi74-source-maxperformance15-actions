import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { useCreateAdWizardController } from "./useCreateAdWizardController";

interface WizardNavButtonsProps {
  controller: ReturnType<typeof useCreateAdWizardController>;
}

export const WizardNavButtons: React.FC<WizardNavButtonsProps> = ({
  controller,
}) => {
  const {
    isEn,
    currentStep,
    handleBack,
    handleNext,
    handleRequestPublishConfirmation,
    loading,
  } = controller;

  return (
    <div
      className="flex justify-between items-center"
      dir={isEn ? "ltr" : "rtl"}
    >
      <button
        type="button"
        onClick={handleBack}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        {isEn ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        {isEn ? "Previous" : "السابق"}
      </button>

      {currentStep < 6 ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/25"
        >
          {isEn ? "Next" : "التالي"}
          {isEn ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRequestPublishConfirmation}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEn ? "Publishing..." : "جاري النشر..."}
            </>
          ) : (
            <>
              {isEn ? "Review & Publish" : "مراجعة وتأكيد النشر"}
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
