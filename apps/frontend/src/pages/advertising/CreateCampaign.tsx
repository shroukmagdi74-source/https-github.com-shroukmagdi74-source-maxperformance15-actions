/**
 * Create Campaign Page
 *
 * صفحة إنشاء حملة إعلانية جديدة (Wizard محسّن)
 */

import React from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateCampaignController,
  WizardStepper,
  Step1BasicInfo,
  Step2BudgetSchedule,
  Step3Targeting,
  Step4Placements,
  Step5AdvancedSettings,
  Step6ReviewConfirm,
} from "./create-campaign/index";

const CreateCampaign: React.FC = () => {
  const {
    navigate,
    currentStep,
    totalSteps,
    loading,
    adAccounts,
    pixels,
    loadingAccounts,
    loadingPixels,
    formData,
    handleInputChange,
    handleSpecialAdCategoryToggle,
    handleLocationToggle,
    handleInterestToggle,
    handlePlacementToggle,
    handleGenderToggle,
    handleNext,
    handlePrevious,
    handleSubmit,
    getObjectiveDescription,
  } = useCreateCampaignController();

  return (
    <div className="w-full space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          إنشاء حملة إعلانية جديدة
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          اتبع الخطوات لإنشاء حملة إعلانية على Facebook
        </p>
      </div>

      {/* Progress Steps */}
      <WizardStepper currentStep={currentStep} />

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow dark:shadow-gray-900/20 border-0 dark:border dark:border-gray-700">
        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
            getObjectiveDescription={getObjectiveDescription}
            adAccounts={adAccounts}
            loadingAccounts={loadingAccounts}
          />
        )}

        {currentStep === 2 && (
          <Step2BudgetSchedule
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        {currentStep === 3 && (
          <Step3Targeting
            formData={formData}
            handleInputChange={handleInputChange}
            handleGenderToggle={handleGenderToggle}
            handleLocationToggle={handleLocationToggle}
            handleInterestToggle={handleInterestToggle}
          />
        )}

        {currentStep === 4 && (
          <Step4Placements
            formData={formData}
            handleInputChange={handleInputChange}
            handlePlacementToggle={handlePlacementToggle}
          />
        )}

        {currentStep === 5 && (
          <Step5AdvancedSettings
            formData={formData}
            handleInputChange={handleInputChange}
            handleSpecialAdCategoryToggle={handleSpecialAdCategoryToggle}
            pixels={pixels}
            loadingPixels={loadingPixels}
          />
        )}

        {currentStep === 6 && (
          <Step6ReviewConfirm
            formData={formData}
            pixels={pixels}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => navigate("/advertising/facebook-ads")}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            إلغاء
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                السابق
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                التالي
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    إنشاء الحملة
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
