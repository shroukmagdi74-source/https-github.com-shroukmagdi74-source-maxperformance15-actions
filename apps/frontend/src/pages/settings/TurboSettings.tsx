import React from "react";
import {
  TurboApiKeyCard,
  TurboAutoCreateCard,
  TurboClientCodeCard,
  TurboInfoSection,
  TurboSaveBar,
  TurboSenderNumberCard,
  TurboSettingsHeader,
  TurboStatusCard,
  TurboWebhookCard,
  useTurboSettingsController,
} from "./turbo-settings";

const TurboSettings: React.FC = () => {
  const {
    t,
    navigate,
    loading,
    saving,
    showApiKey,
    setShowApiKey,
    settings,
    setSettings,
    handleSave,
    handleTestConnection,
  } = useTurboSettingsController();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("turbo.k_23")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 dark:bg-gray-900 min-h-screen">
      <TurboSettingsHeader
        t={t}
        onNavigateShippingCompanies={() => navigate("/shipping-companies")}
        onNavigateStoreSettings={() => navigate("/store-settings")}
        onNavigateStatusMapping={() => navigate("/settings/turbo/status-mapping")}
      />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
        <TurboStatusCard
          t={t}
          enabled={settings.turboEnabled}
          onToggle={(checked) => setSettings((prev) => ({ ...prev, turboEnabled: checked }))}
        />

        <TurboApiKeyCard
          t={t}
          hasApiKey={settings.hasApiKey}
          maskedApiKey={settings.maskedApiKey}
          showApiKey={showApiKey}
          apiKey={settings.turboApiKey}
          saving={saving}
          onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
          onChangeApiKey={(key) => setSettings((prev) => ({ ...prev, turboApiKey: key }))}
          onTestConnection={handleTestConnection}
        />

        <TurboClientCodeCard
          t={t}
          clientCode={settings.turboMainClientCode}
          onChangeClientCode={(code) => setSettings((prev) => ({ ...prev, turboMainClientCode: code }))}
        />

        <TurboSenderNumberCard
          t={t}
          senderNumber={settings.turboSenderNumber}
          onChangeSenderNumber={(number) => setSettings((prev) => ({ ...prev, turboSenderNumber: number }))}
        />

        <TurboAutoCreateCard
          t={t}
          enabled={settings.turboEnabled}
          autoCreate={settings.turboAutoCreate}
          onToggleAutoCreate={(checked) => setSettings((prev) => ({ ...prev, turboAutoCreate: checked }))}
        />

        <TurboWebhookCard
          t={t}
          webhookUrl={settings.turboWebhookUrl}
          webhookToken={settings.turboWebhookToken}
          onChangeWebhookUrl={(url) => setSettings((prev) => ({ ...prev, turboWebhookUrl: url }))}
          onChangeWebhookToken={(token) => setSettings((prev) => ({ ...prev, turboWebhookToken: token }))}
        />

        <TurboInfoSection t={t} />

        <TurboSaveBar
          t={t}
          saving={saving}
          disabled={settings.turboEnabled && !settings.turboApiKey && !settings.hasApiKey}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default TurboSettings;
