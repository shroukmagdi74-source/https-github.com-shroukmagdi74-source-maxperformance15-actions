import React from "react";

interface AudienceWizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const AudienceWizardNavigation: React.FC<AudienceWizardNavigationProps> = ({
  currentStep,
  totalSteps,
  loading,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        السابق
      </button>

      {currentStep < totalSteps ? (
        <button
          onClick={onNext}
          className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          التالي
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "جاري الإنشاء..." : "إنشاء الجمهور"}
        </button>
      )}
    </div>
  );
};
