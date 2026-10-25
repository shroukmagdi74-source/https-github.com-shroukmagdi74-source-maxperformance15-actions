import React from "react";
import { Plus } from "lucide-react";
import {
  BusinessPageHero,
  BusinessPageShell,
} from "../../components/business/BusinessSurface";
import { Button } from "../../components/ui/button";
import {
  useGoalsController,
  GoalsStatsGrid,
  GoalsFilterPanel,
  GoalsGridPanel,
} from "./goals/index";

const Goals: React.FC = () => {
  const {
    loading,
    stats,
    projects,
    goalType,
    setGoalType,
    status,
    setStatus,
    projectId,
    setProjectId,
    includeDaily,
    setIncludeDaily,
    search,
    setSearch,
    filteredGoals,
    dailyGoalsCount,
    goToNewGoal,
    goToGoalDetails,
  } = useGoalsController();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <BusinessPageShell className="space-y-6 p-4 md:p-6" dir="rtl">
      <BusinessPageHero
        eyebrow="الأعمال"
        title="إدارة الأهداف"
        description="من هنا نربط هدف المشروع بالموظفين والأيام والمهام، ونراقب التقدم الفعلي بدل الأرقام المعزولة."
        actions={
          <Button className="rounded-xl" onClick={goToNewGoal}>
            <Plus className="ml-2 h-4 w-4" />
            هدف جديد
          </Button>
        }
      />

      <GoalsStatsGrid stats={stats} dailyGoalsCount={dailyGoalsCount} />

      <GoalsFilterPanel
        search={search}
        onSearchChange={setSearch}
        goalType={goalType}
        onGoalTypeChange={setGoalType}
        status={status}
        onStatusChange={setStatus}
        projectId={projectId}
        onProjectIdChange={setProjectId}
        projects={projects}
        includeDaily={includeDaily}
        onIncludeDailyChange={setIncludeDaily}
      />

      <GoalsGridPanel
        filteredGoals={filteredGoals}
        onOpenGoal={goToGoalDetails}
      />
    </BusinessPageShell>
  );
};

export default Goals;
