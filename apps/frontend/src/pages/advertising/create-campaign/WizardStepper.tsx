import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { STEP_TITLES } from "./constants";

interface WizardStepperProps {
  currentStep: number;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 overflow-hidden border-0 dark:border dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-center gap-x-2 gap-y-4 lg:flex-nowrap lg:items-center lg:justify-between">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <React.Fragment key={step}>
            <div className="flex min-w-[92px] flex-col items-center gap-2 lg:flex-1 lg:min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step < currentStep
                    ? "bg-green-500 dark:bg-green-600 text-white"
                    : step === currentStep
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <span className="font-mono tabular-nums">{step}</span>
                )}
              </div>
              <p
                className={`text-center text-xs font-medium ${
                  step <= currentStep
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {STEP_TITLES[step - 1]}
              </p>
            </div>
            {step < 6 && (
              <div
                className={`hidden h-1 flex-1 mx-2 min-w-[20px] lg:block ${
                  step < currentStep
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-gray-200 dark:bg-gray-600"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
