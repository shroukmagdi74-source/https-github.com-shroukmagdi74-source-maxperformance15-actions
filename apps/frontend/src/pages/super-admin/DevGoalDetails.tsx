import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import i18n from "../../i18n";
import { RefreshCw, Target } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  useDevGoalDetails,
  DevGoalHeader,
  DevGoalProgressRibbon,
  DevGoalOverviewTab,
  DevGoalKeyResultsTab,
  DevGoalTasksTab,
  DevGoalCheckInsTab,
  DevGoalKRModal,
  DevGoalCheckInModal,
} from "./dev-goals";

const DevGoalDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    goal,
    checkIns,
    loading,
    activeTab,
    setActiveTab,
    showKRModal,
    setShowKRModal,
    editingKR,
    krForm,
    setKrForm,
    showCheckInModal,
    setShowCheckInModal,
    checkInForm,
    setCheckInForm,
    handleAddKR,
    handleDeleteKR,
    handleAddCheckIn,
    openNewKRModal,
    openEditKRModal,
  } = useDevGoalDetails(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <RefreshCw className="size-4 animate-spin text-primary" />
          <span>جاري تحميل تفاصيل الهدف ومؤشرات الإنجاز...</span>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-8 max-w-md mx-auto rounded-xl border border-border/80 bg-card text-center my-12 shadow-2xs">
        <Target className="size-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground mb-1">
          الهدف غير موجود
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          قد يكون تم حذفه أو ليس لديك صلاحية للوصول إليه.
        </p>
        <Button
          onClick={() => navigate("/super-admin/dev-goals")}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          العودة لقائمة الأهداف
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto" dir={i18n.dir()}>
      <DevGoalHeader goal={goal} />

      <DevGoalProgressRibbon goal={goal} />

      <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
        {/* Tab Headers */}
        <div className="p-1 sm:p-1.5 border-b border-border/60 bg-muted/20 flex gap-1 overflow-x-auto">
          {[
            { key: "overview", label: "نظرة عامة" },
            {
              key: "key-results",
              label: `النتائج الرئيسية (${goal.keyResults?.length ?? 0})`,
            },
            {
              key: "tasks",
              label: `المهام المرتبطة (${goal.linkedTasks?.length ?? 0})`,
            },
            {
              key: "check-ins",
              label: `المراجعات (${checkIns?.length ?? 0})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-2xs font-semibold border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5">
          {activeTab === "overview" && (
            <DevGoalOverviewTab
              goal={goal}
              onOpenCheckInModal={() => setShowCheckInModal(true)}
            />
          )}

          {activeTab === "key-results" && (
            <DevGoalKeyResultsTab
              keyResults={goal.keyResults}
              onOpenNewKRModal={openNewKRModal}
              onOpenEditKRModal={openEditKRModal}
              onDeleteKR={handleDeleteKR}
            />
          )}

          {activeTab === "tasks" && (
            <DevGoalTasksTab linkedTasks={goal.linkedTasks} />
          )}

          {activeTab === "check-ins" && (
            <DevGoalCheckInsTab
              checkIns={checkIns}
              onOpenCheckInModal={() => setShowCheckInModal(true)}
            />
          )}
        </div>
      </div>

      <DevGoalKRModal
        show={showKRModal}
        editingKR={editingKR}
        krForm={krForm}
        setKrForm={setKrForm}
        onClose={() => {
          setShowKRModal(false);
        }}
        onSave={handleAddKR}
      />

      <DevGoalCheckInModal
        show={showCheckInModal}
        checkInForm={checkInForm}
        setCheckInForm={setCheckInForm}
        onClose={() => setShowCheckInModal(false)}
        onSave={handleAddCheckIn}
      />
    </div>
  );
};

export default DevGoalDetails;
