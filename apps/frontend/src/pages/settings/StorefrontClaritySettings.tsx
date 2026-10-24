import React from 'react';
import ClarityAnalyticsPanel from './ClarityAnalyticsPanel';
import {
  ClarityCredentialsCard,
  ClarityFeaturesDetails,
  ClarityHeader,
  ClaritySetupStepsDetails,
  ClarityTipsSection,
  useStorefrontClarityController,
} from './storefront-clarity';

const StorefrontClaritySettings: React.FC = () => {
  const {
    t,
    settings,
    setSettings,
    loading,
    saving,
    copied,
    hasSaved,
    validationErrors,
    setValidationErrors,
    clarityProjectId,
    isConnected,
    clarityDashboardUrl,
    handleSave,
    handleDisconnect,
    handleCopyId,
  } = useStorefrontClarityController();

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        role="status"
        aria-label={t('clarity.loading', 'جاري التحميل')}
      >
        <div
          className="h-8 w-8 motion-safe:animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
      <ClarityHeader isConnected={isConnected} />

      <ClarityCredentialsCard
        settings={settings}
        clarityProjectId={clarityProjectId}
        isConnected={isConnected}
        hasSaved={hasSaved}
        copied={copied}
        saving={saving}
        validationErrors={validationErrors}
        clarityDashboardUrl={clarityDashboardUrl}
        onProjectIdChange={(val) => {
          setSettings((current) => (current ? { ...current, clarityProjectId: val } : null));
          setValidationErrors((prev) => (prev.projectId ? { ...prev, projectId: undefined } : prev));
        }}
        onApiTokenChange={(val) => {
          setSettings((current) => (current ? { ...current, clarityApiToken: val } : null));
          setValidationErrors((prev) => (prev.apiToken ? { ...prev, apiToken: undefined } : prev));
        }}
        onCopyId={handleCopyId}
        onSave={handleSave}
        onDisconnect={handleDisconnect}
      />

      {!isConnected ? <ClaritySetupStepsDetails hasSaved={hasSaved} /> : null}

      {isConnected && hasSaved && settings?.clarityApiToken ? (
        <section aria-label={t('clarity.analyticsSection', 'تحليلات Clarity')}>
          <ClarityAnalyticsPanel
            projectId={clarityProjectId}
            apiToken={settings.clarityApiToken}
          />
        </section>
      ) : null}

      <ClarityFeaturesDetails />

      <ClarityTipsSection />
    </main>
  );
};

export default StorefrontClaritySettings;
