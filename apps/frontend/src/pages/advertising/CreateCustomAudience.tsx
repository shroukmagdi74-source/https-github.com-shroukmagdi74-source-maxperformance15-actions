/**
 * Create Custom Audience Page (Modular Coordinator)
 *
 * صفحة إنشاء جمهور مخصص جديد
 */

import React from "react";
import {
  AudienceHeaderAndProgress,
  AudienceWizardNavigation,
  MetaTosWarningBanner,
  Step1AudienceInfo,
  Step2SettingsHost,
  Step3Review,
  useCreateCustomAudienceState,
} from "./create-custom-audience";

const CreateCustomAudience: React.FC = () => {
  const {
    navigate,
    currentStep,
    totalSteps,
    loading,
    adAccounts,
    pixels,
    pages,
    formData,
    tosErrorUrl,
    setTosErrorUrl,
    handleInputChange,
    parseManualCustomers,
    handleCsvUpload,
    handleNext,
    handlePrevious,
    handleSubmit,
  } = useCreateCustomAudienceState();

  return (
    <div className="w-full space-y-6">
      <AudienceHeaderAndProgress
        currentStep={currentStep}
        onBack={() => navigate("/advertising/facebook-ads/audiences")}
      />

      <MetaTosWarningBanner
        tosErrorUrl={tosErrorUrl}
        onDismiss={() => setTosErrorUrl(null)}
      />

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <Step1AudienceInfo
            formData={formData}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 2 && (
          <Step2SettingsHost
            formData={formData}
            adAccounts={adAccounts}
            pixels={pixels}
            pages={pages}
            onInputChange={handleInputChange}
            onParseManualCustomers={parseManualCustomers}
            onCsvUpload={handleCsvUpload}
          />
        )}

        {currentStep === 3 && <Step3Review formData={formData} />}

        <AudienceWizardNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          loading={loading}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default CreateCustomAudience;
export * from "./create-custom-audience/types";
