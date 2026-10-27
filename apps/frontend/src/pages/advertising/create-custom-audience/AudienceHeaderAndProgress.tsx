import React from "react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface AudienceHeaderAndProgressProps {
  currentStep: number;
  onBack: () => void;
}

export const AudienceHeaderAndProgress: React.FC<AudienceHeaderAndProgressProps> = ({
  currentStep,
  onBack,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            aria-label="الرجوع إلى إدارة الجماهير"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            رجوع
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            إنشاء جمهور مخصص جديد
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            اتبع الخطوات لإنشاء جمهور مخصص لحملاتك الإعلانية
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step < currentStep
                      ? "bg-green-500 text-white"
                      : step === currentStep
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="tabular-nums">{step}</span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    step <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step === 1 && "معلومات الجمهور"}
                  {step === 2 && "الإعدادات"}
                  {step === 3 && "المراجعة"}
                </p>
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
