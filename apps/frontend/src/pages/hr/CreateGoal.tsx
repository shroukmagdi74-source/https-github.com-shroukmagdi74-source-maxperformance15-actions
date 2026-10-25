import React from "react";
import { ArrowRight, Save, Target, Trash2 } from "lucide-react";
import {
  BusinessPageHero,
  BusinessPageShell,
  BusinessSectionPanel,
} from "../../components/business/BusinessSurface";
import { Button } from "../../components/ui/button";
import {
  useCreateGoalController,
  GoalDefinitionSection,
  GoalAssignmentsSection,
  GoalLinkedTasksSection,
  GoalSummarySidebar,
} from "./create-goal/index";

const CreateGoal: React.FC = () => {
  const {
    id,
    isEdit,
    loading,
    fetching,
    loadError,
    form,
    goalDetails,
    employees,
    departments,
    projects,
    taskSearch,
    setTaskSearch,
    filteredTaskOptions,
    availableParentGoals,
    assignmentTargetTotal,
    targetValueNumber,
    assignmentCoverage,
    linkedTasks,
    setField,
    updateAssignment,
    addAssignment,
    removeAssignment,
    toggleTaskLink,
    handleSubmit,
    handleDelete,
    navigate,
  } = useCreateGoalController();

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <BusinessPageShell className="space-y-6 p-4 md:p-6" dir="rtl">
        <BusinessPageHero
          eyebrow="الأعمال"
          title={isEdit ? "تعذر فتح الهدف" : "تعذر تحميل الصفحة"}
          description="بدل عرض نموذج ناقص، نوضح السبب ونبقي الرجوع سريعًا."
          actions={
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate("/goals")}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              رجوع إلى الأهداف
            </Button>
          }
        />

        <BusinessSectionPanel contentClassName="pt-6">
          <div
            data-testid="goal-load-error-state"
            className="rounded-3xl border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center"
          >
            <Target className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">{loadError}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ارجع إلى قائمة الأهداف لاختيار هدف آخر أو التحقق من الصلاحيات.
            </p>
          </div>
        </BusinessSectionPanel>
      </BusinessPageShell>
    );
  }

  return (
    <BusinessPageShell className="space-y-6 p-4 md:p-6" dir="rtl">
      <BusinessPageHero
        eyebrow="الأعمال"
        title={isEdit ? "تحديث هيكل الهدف" : "بناء هدف جديد"}
        description="من هنا نربط هدف المشروع بالموظفين والمهام والفترة الزمنية، ونحدد هل يتولد منه توزيع يومي تلقائي أم لا."
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit ? (
              <Button
                variant="outline"
                className="rounded-xl text-destructive"
                data-testid="goal-delete-button"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate("/goals")}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              رجوع
            </Button>
            <Button
              className="rounded-xl"
              data-testid="goal-save-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Save className="ml-2 h-4 w-4" />
              {loading ? "جارٍ الحفظ..." : isEdit ? "حفظ التحديثات" : "إنشاء الهدف"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <GoalDefinitionSection
            form={form}
            setField={setField}
            projects={projects}
            departments={departments}
            employees={employees}
            availableParentGoals={availableParentGoals}
          />

          {form.goalType === "PROJECT" ? (
            <GoalAssignmentsSection
              assignments={form.assignments}
              employees={employees}
              assignmentTargetTotal={assignmentTargetTotal}
              targetValueNumber={targetValueNumber}
              assignmentCoverage={assignmentCoverage}
              onUpdateAssignment={updateAssignment}
              onAddAssignment={addAssignment}
              onRemoveAssignment={removeAssignment}
            />
          ) : null}

          <GoalLinkedTasksSection
            taskSearch={taskSearch}
            setTaskSearch={setTaskSearch}
            filteredTaskOptions={filteredTaskOptions}
            linkedTaskIds={form.linkedTaskIds}
            onToggleTaskLink={toggleTaskLink}
          />
        </div>

        <GoalSummarySidebar
          form={form}
          targetValueNumber={targetValueNumber}
          linkedTasks={linkedTasks}
          goalDetails={goalDetails}
          projects={projects}
          employees={employees}
          departments={departments}
          availableParentGoals={availableParentGoals}
          isEdit={isEdit}
        />
      </section>
    </BusinessPageShell>
  );
};

export default CreateGoal;
