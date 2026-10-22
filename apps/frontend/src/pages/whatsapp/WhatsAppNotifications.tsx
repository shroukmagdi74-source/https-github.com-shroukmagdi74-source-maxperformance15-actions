import React from "react";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppScheduledReportsTab } from "./scheduled-reports/WhatsAppScheduledReportsTab";
import {
  useWhatsAppNotificationsController,
  WhatsAppNotificationsHeader,
  WhatsAppNotificationsKPIs,
  WhatsAppNotificationsTabsNav,
  GeneralTab,
  ProductsTab,
  MarketingTab,
  CompanyTab,
  HRTab,
  TasksTab,
  TestNotificationDialog,
  TemplateEditDialog,
  noticeStyles,
  type WhatsAppNotificationsProps,
} from "./notifications";

const WhatsAppNotifications: React.FC<WhatsAppNotificationsProps> = ({
  companyId,
  companyName,
  superAdminMode = false,
}) => {
  const {
    t,
    i18n,
    loading,
    refreshing,
    saving,
    settings,
    sessions,
    notice,
    testDialogOpen,
    setTestDialogOpen,
    testPhone,
    setTestPhone,
    testEventType,
    setTestEventType,
    sendingTest,
    templateDialogOpen,
    setTemplateDialogOpen,
    editingTemplate,
    templateForm,
    setTemplateForm,
    TABS,
    activeTab,
    handleTabChange,
    connectedSessions,
    enabledModules,
    currentSession,
    refreshPageData,
    saveSettings,
    saveTemplate,
    sendTestNotification,
    updateSetting,
  } = useWhatsAppNotificationsController({
    companyId,
    companyName,
    superAdminMode,
  });

  const pageTitle = companyName
    ? `${t("whatsappNotifications.title", "إشعارات واتساب")} · ${companyName}`
    : t("whatsappNotifications.title", "إشعارات واتساب");

  const settingsHref =
    superAdminMode && companyId
      ? `/super-admin/whatsapp/companies/${companyId}/settings`
      : "/whatsapp/settings";

  const automationsHref =
    superAdminMode
      ? companyId
        ? `/super-admin/whatsapp/automations?companyId=${companyId}`
        : "/super-admin/whatsapp/automations"
      : "/whatsapp/customer-journey";

  const eyebrow =
    superAdminMode && companyName
      ? i18n.language === "ar"
        ? `شركة: ${companyName}`
        : `Company: ${companyName}`
      : undefined;

  const pageDescription = superAdminMode
    ? i18n.language === "ar"
      ? "أدر رسائل تسجيل الشركات والاشتراك التي تخص السوبر أدمن من مساحة واحدة، بدون خلط مع إشعارات الطلبات أو العملاء."
      : "Manage platform-owned company signup and subscription WhatsApp messages."
    : i18n.language === "ar"
      ? "تحكم في الإشعارات الآلية، قوالب الرسائل، وسلوك الإرسال عبر واتساب من مساحة واحدة."
      : "Control automation, message templates, and operational WhatsApp notification behavior from one workspace.";

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6" dir={i18n.dir()}>
        <div className="flex justify-between items-center border-b border-border/50 pb-4">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6 text-center" dir={i18n.dir()}>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border/80 bg-card p-8">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">
            {t("whatsappNotifications.general.noSettingsFound", "تعذر تحميل إعدادات الإشعارات")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            {t("whatsappNotifications.general.noSettingsDesc", "تأكد من وجود صلاحية الربط أو أعد المحاولة مرة أخرى.")}
          </p>
          <Button
            size="sm"
            onClick={() => void refreshPageData()}
            className="mt-4 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("common.refresh", "إعادة المحاولة")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6"
      dir={i18n.dir()}
    >
      {/* 1. Cockpit Header */}
      <WhatsAppNotificationsHeader
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        eyebrow={eyebrow}
        loading={loading}
        refreshing={refreshing}
        saving={saving}
        settingsHref={settingsHref}
        automationsHref={automationsHref}
        onRefresh={() => void refreshPageData()}
        onOpenTest={() => setTestDialogOpen(true)}
        onSave={() => void saveSettings()}
      />

      {/* 2. Telemetry Strip KPIs */}
      <WhatsAppNotificationsKPIs
        isEnabled={settings.isEnabled}
        enabledModules={enabledModules}
        connectedSessions={connectedSessions}
        totalSessions={sessions.length}
        currentSession={currentSession}
      />

      {/* 3. Action Notification Banner */}
      {notice && (
        <div
          className={`flex items-center gap-2.5 rounded-lg border p-3 text-xs sm:text-sm font-medium ${noticeStyles[notice.tone]}`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {/* 4. Horizontal Navigation */}
      <WhatsAppNotificationsTabsNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 5. Active Tab Workspace */}
      <div className="pt-1">
        {activeTab === "general" && (
          <GeneralTab
            settings={settings}
            sessions={sessions}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "products" && (
          <ProductsTab
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "marketing" && (
          <MarketingTab
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "company" && (
          <CompanyTab
            settings={settings}
            superAdminMode={superAdminMode}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "hr" && (
          <HRTab
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab
            settings={settings}
            updateSetting={updateSetting}
          />
        )}

        {activeTab === "reports" && (
          <WhatsAppScheduledReportsTab
            companyId={companyId}
            isRtl={i18n.language === "ar"}
          />
        )}
      </div>

      {/* 6. Dialogs */}
      <TestNotificationDialog
        open={testDialogOpen}
        testPhone={testPhone}
        testEventType={testEventType}
        sendingTest={sendingTest}
        superAdminMode={superAdminMode}
        onOpenChange={setTestDialogOpen}
        onPhoneChange={setTestPhone}
        onEventTypeChange={setTestEventType}
        onSend={() => void sendTestNotification()}
      />

      <TemplateEditDialog
        open={templateDialogOpen}
        editingTemplate={editingTemplate}
        templateForm={templateForm}
        saving={saving}
        superAdminMode={superAdminMode}
        onOpenChange={setTemplateDialogOpen}
        onFormChange={setTemplateForm}
        onSave={() => void saveTemplate()}
      />
    </div>
  );
};

export default WhatsAppNotifications;
