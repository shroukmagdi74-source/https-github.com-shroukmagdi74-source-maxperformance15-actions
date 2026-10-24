import React from "react";
import { AlertCircle } from "lucide-react";
import ErrorBoundary from "../../../components/ErrorBoundary";
import {
  Step1Campaign,
  Step2BudgetSchedule,
  Step3Targeting,
  Step4Placements,
  Step5Creative,
  Step6Review,
} from "../wizard/components";
import type { useCreateAdWizardController } from "./useCreateAdWizardController";

interface WizardStepContentProps {
  controller: ReturnType<typeof useCreateAdWizardController>;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  controller,
}) => {
  const {
    currentStep,
    isEn,
    formData,
    setFormData,
    handleChange,
    toggleArrayValue,
    getError,
    selectedAdAccountIsActive,
    loadingAdAccounts,
    adAccounts,
    selectedAdAccountId,
    setSelectedAdAccountId,
    setPublishAccountConfirmed,
    setFacebookPixels,
    loadPagesAndPixels,
    selectedAdAccount,
    savedAdAccounts,
    syncingAdAccount,
    handleActivateSelectedAdAccount,
    loadingPixels,
    facebookPixels,
    selectedAdAccountCurrency,
    compatibleAttributionWindows,
    showAdvancedTargeting,
    setShowAdvancedTargeting,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    handleSearchInterests,
    selectedInterests,
    addInterest,
    removeInterest,
    relationshipStatuses,
    toggleRelationshipStatus,
    selectedLanguages,
    toggleLanguage,
    selectedDevices,
    toggleDevice,
    loadingAudiences,
    customAudiences,
    selectedCustomAudiences,
    toggleCustomAudience,
    lookalikeAudiences,
    selectedLookalikeAudiences,
    toggleLookalikeAudience,
    excludedAudiences,
    setExcludedAudiences,
    facebookPages,
    facebookPagesMeta,
    loadingPages,
    selectedFacebookPage,
    isStorefrontProductLaunch,
    isAiDraftPrefill,
    launchPrefillProductTitle,
    createdFullAd,
    selectedBusinessName,
    selectedAdAccountName,
    selectedFacebookPixel,
    errors,
  } = controller;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 mb-8">
      {currentStep === 1 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to load campaign details"
                  : "تعذر عرض بيانات الحملة"}
              </h3>
            </div>
          }
        >
          <Step1Campaign
            formData={formData}
            handleChange={handleChange}
            toggleArrayValue={toggleArrayValue}
            getError={getError}
          />
        </ErrorBoundary>
      )}

      {currentStep === 2 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to load budget & schedule settings"
                  : "تعذر عرض إعدادات الميزانية والجدول الزمني"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEn
                  ? "Please verify your Facebook Ad account connection or return to previous steps."
                  : "يرجى التأكد من ربط حساب إعلانات فيسبوك أو الرجوع للخطوة السابقة."}
              </p>
            </div>
          }
        >
          <Step2BudgetSchedule
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            getError={getError}
            selectedAdAccountIsActive={selectedAdAccountIsActive}
            loadingAdAccounts={loadingAdAccounts}
            adAccounts={adAccounts}
            selectedAdAccountId={selectedAdAccountId}
            setSelectedAdAccountId={setSelectedAdAccountId}
            setPublishAccountConfirmed={setPublishAccountConfirmed}
            setFacebookPixels={setFacebookPixels}
            loadPagesAndPixels={loadPagesAndPixels}
            selectedAdAccount={selectedAdAccount}
            savedAdAccounts={savedAdAccounts}
            syncingAdAccount={syncingAdAccount}
            handleActivateSelectedAdAccount={handleActivateSelectedAdAccount}
            loadingPixels={loadingPixels}
            facebookPixels={facebookPixels}
            selectedAdAccountCurrency={selectedAdAccountCurrency}
            compatibleAttributionWindows={compatibleAttributionWindows}
          />
        </ErrorBoundary>
      )}

      {currentStep === 3 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to load targeting options"
                  : "تعذر عرض خيارات الاستهداف"}
              </h3>
            </div>
          }
        >
          <Step3Targeting
            formData={formData}
            handleChange={handleChange}
            toggleArrayValue={toggleArrayValue}
            getError={getError}
            showAdvancedTargeting={showAdvancedTargeting}
            setShowAdvancedTargeting={setShowAdvancedTargeting}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            searchLoading={searchLoading}
            handleSearchInterests={handleSearchInterests}
            selectedInterests={selectedInterests}
            addInterest={addInterest}
            removeInterest={removeInterest}
            relationshipStatuses={relationshipStatuses}
            toggleRelationshipStatus={toggleRelationshipStatus}
            selectedLanguages={selectedLanguages}
            toggleLanguage={toggleLanguage}
            selectedDevices={selectedDevices}
            toggleDevice={toggleDevice}
            loadingAudiences={loadingAudiences}
            customAudiences={customAudiences}
            selectedCustomAudiences={selectedCustomAudiences}
            toggleCustomAudience={toggleCustomAudience}
            lookalikeAudiences={lookalikeAudiences}
            selectedLookalikeAudiences={selectedLookalikeAudiences}
            toggleLookalikeAudience={toggleLookalikeAudience}
            excludedAudiences={excludedAudiences}
            setExcludedAudiences={setExcludedAudiences}
          />
        </ErrorBoundary>
      )}

      {currentStep === 4 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to load ad placements"
                  : "تعذر عرض مواضع الإعلان"}
              </h3>
            </div>
          }
        >
          <Step4Placements
            formData={formData}
            handleChange={handleChange}
            toggleArrayValue={toggleArrayValue}
            getError={getError}
          />
        </ErrorBoundary>
      )}

      {currentStep === 5 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to load creative options"
                  : "تعذر عرض خيارات وتصميم الكرياتيف"}
              </h3>
            </div>
          }
        >
          <Step5Creative
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            getError={getError}
            facebookPages={facebookPages}
            facebookPagesMeta={facebookPagesMeta}
            loadingPages={loadingPages}
            selectedFacebookPage={selectedFacebookPage}
            selectedAdAccount={selectedAdAccount}
            selectedAdAccountId={selectedAdAccountId}
            selectedAdAccountIsActive={selectedAdAccountIsActive}
            syncingAdAccount={syncingAdAccount}
            handleActivateSelectedAdAccount={handleActivateSelectedAdAccount}
            isStorefrontProductLaunch={isStorefrontProductLaunch}
            isAiDraftPrefill={isAiDraftPrefill}
            launchPrefillProductTitle={launchPrefillProductTitle}
          />
        </ErrorBoundary>
      )}

      {currentStep === 6 && (
        <ErrorBoundary
          fallback={
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {isEn
                  ? "Unable to render ad review details"
                  : "تعذر عرض بعض تفاصيل مراجعة الإعلان"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEn
                  ? "You can still publish the campaign directly or return to previous steps to edit."
                  : "يمكنك متابعة نشر الحملة مباشرة أو الرجوع للخطوات السابقة لتعديل البيانات."}
              </p>
            </div>
          }
        >
          <Step6Review
            createdFullAd={createdFullAd}
            formData={formData}
            handleChange={handleChange}
            selectedBusinessName={selectedBusinessName}
            selectedAdAccountName={selectedAdAccountName}
            selectedAdAccountId={selectedAdAccountId}
            selectedFacebookPage={selectedFacebookPage}
            selectedFacebookPixel={selectedFacebookPixel}
            selectedAdAccountCurrency={selectedAdAccountCurrency}
            selectedInterests={selectedInterests}
            selectedCustomAudiences={selectedCustomAudiences}
            customAudiences={customAudiences}
            selectedLookalikeAudiences={selectedLookalikeAudiences}
            lookalikeAudiences={lookalikeAudiences}
            errors={errors}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
