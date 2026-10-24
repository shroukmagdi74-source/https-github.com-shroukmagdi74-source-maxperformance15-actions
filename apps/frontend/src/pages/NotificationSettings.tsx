import React from "react";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  useNotificationSettingsController,
  NotificationSettingsHeader,
  NotificationGeneralTab,
  NotificationTypesTab,
  NotificationStatsTab,
} from "./notification-settings";

const NotificationSettings: React.FC = () => {
  const {
    settings,
    notificationTypes,
    stats,
    loading,
    saving,
    loadError,
    feedback,
    browserPermission,
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    browserPermissionLabel,
    browserNotificationStatusLabel,
    browserPermissionAction,
    updateSettings,
    getTypePreference,
    handleToggleTypeEnabled,
    handleToggleTypeChannel,
    handleBrowserChannelToggle,
    handleRequestBrowserPermission,
    handleSaveSettings,
    handleTestNotification,
  } = useNotificationSettingsController();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-300">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          جاري تحميل إعدادات الإشعارات...
        </div>
      </div>
    );
  }

  if (loadError || !settings) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 text-red-500" />
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                تعذر تحميل الصفحة
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {loadError || "لا يمكن عرض إعدادات الإشعارات الآن."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 w-full" dir="rtl">
      {/* Top Header & Tab Switcher */}
      <NotificationSettingsHeader
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onSave={() => void handleSaveSettings()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        feedback={feedback}
      />

      {/* Tab Contents */}
      {activeTab === "general" ? (
        <NotificationGeneralTab
          settings={settings}
          updateSettings={updateSettings}
          browserPermission={browserPermission}
          browserPermissionLabel={browserPermissionLabel}
          browserNotificationStatusLabel={browserNotificationStatusLabel}
          browserPermissionAction={browserPermissionAction}
          onBrowserChannelToggle={(enabled) => void handleBrowserChannelToggle(enabled)}
          onRequestBrowserPermission={() => void handleRequestBrowserPermission()}
          onShowFeedback={(fb) => updateSettings("__feedback", fb)}
        />
      ) : null}

      {activeTab === "types" ? (
        <NotificationTypesTab
          notificationTypes={notificationTypes}
          settings={settings}
          browserPermission={browserPermission}
          getTypePreference={getTypePreference}
          onToggleTypeEnabled={handleToggleTypeEnabled}
          onToggleTypeChannel={handleToggleTypeChannel}
          onTestNotification={(type) => void handleTestNotification(type)}
        />
      ) : null}

      {activeTab === "stats" ? (
        <NotificationStatsTab stats={stats} />
      ) : null}
    </div>
  );
};

export default NotificationSettings;
