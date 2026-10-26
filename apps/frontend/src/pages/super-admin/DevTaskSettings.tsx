import React from "react";
import i18n from "../../i18n";
import {
  Settings as Cog6ToothIcon,
  Palette as SwatchIcon,
  ShieldCheck as ShieldCheckIcon,
  Zap as BoltIcon,
  CheckCircle2 as CheckCircleIcon,
  Trophy as TrophyIcon,
  Clock as ClockIcon,
} from "lucide-react";
import {
  useDevTaskSettingsController,
  DevTaskGeneralTab,
  DevTaskPermissionsTab,
  DevTaskAutomationTab,
  DevTaskLeaderboardTab,
  DevTaskVisibilityTab,
} from "./dev-task-settings";

const DevTaskSettings: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    loading,
    saving,
    teamMembers,
    handleSave,
    updateStatus,
    addStatus,
    removeStatus,
  } = useDevTaskSettingsController();

  if (loading) {
    return <div className="p-10 text-center text-sm text-muted-foreground">جاري التحميل...</div>;
  }

  if (!settings) {
    return (
      <div className="p-10 text-center text-sm text-destructive font-medium">
        فشل تحميل الإعدادات
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      {/* Linear Single-Surface Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Cog6ToothIcon className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              إعدادات نظام المهام
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة دورة حياة المهام، الصلاحيات الدقيقة، سياسات الأتمتة وقواعد لوحة الأبطال
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/40">
            <ClockIcon className="h-3.5 w-3.5 text-primary" />
            <span>المنطقة: <strong className="text-foreground font-mono">{settings.timezone || "UTC"}</strong></span>
            <span className="text-border">|</span>
            <span>الحالات: <strong className="text-foreground font-mono tabular-nums">{settings.taskStatuses.length}</strong></span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {saving ? (
              "جاري الحفظ..."
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modern Segmented Tab Bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg border border-border/60 max-w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === "general" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          <SwatchIcon className="h-3.5 w-3.5" />
          الحالات والأولويات
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === "permissions" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ShieldCheckIcon className="h-3.5 w-3.5" />
          الصلاحيات والأدوار
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === "automation" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BoltIcon className="h-3.5 w-3.5" />
          الأقسام والتعيين التلقائي
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === "leaderboard" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          <TrophyIcon className="h-3.5 w-3.5" />
          لوحة الأبطال
        </button>
        <button
          onClick={() => setActiveTab("visibility")}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === "visibility" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Cog6ToothIcon className="h-3.5 w-3.5" />
          عرض تفاصيل المهمة
        </button>
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs">
        {activeTab === "general" && (
          <DevTaskGeneralTab
            settings={settings}
            setSettings={setSettings}
            updateStatus={updateStatus}
            addStatus={addStatus}
            removeStatus={removeStatus}
          />
        )}

        {activeTab === "permissions" && (
          <DevTaskPermissionsTab
            settings={settings}
            setSettings={setSettings}
            teamMembers={teamMembers}
          />
        )}

        {activeTab === "automation" && (
          <DevTaskAutomationTab
            settings={settings}
            setSettings={setSettings}
            teamMembers={teamMembers}
          />
        )}

        {activeTab === "leaderboard" && (
          <DevTaskLeaderboardTab
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {activeTab === "visibility" && (
          <DevTaskVisibilityTab
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </div>
    </div>
  );
};

export default DevTaskSettings;
