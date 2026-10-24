import React from "react";
import { Button } from "../../../components/ui/button";
import type { useTasksPageController } from "./useTasksPageController";

interface TasksMobileCommandBarProps {
  controller: ReturnType<typeof useTasksPageController>;
}

export const TasksMobileCommandBar: React.FC<TasksMobileCommandBarProps> = ({
  controller,
}) => {
  const {
    activeTab,
    workspaceSettings,
    selectedTasksCount,
    handleBulkStatusChange,
    isApprover,
    hasCommandState,
    setShowFilterSidebar,
    setShowCreateTaskModal,
  } = controller;

  if (activeTab !== "tasks" || !workspaceSettings.showMobileCommandBar) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="business-page-panel rounded-[24px] border border-border/70 bg-card/95 px-3 py-3 shadow-[0_18px_42px_-28px_rgba(15,27,45,0.45)] backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {selectedTasksCount > 0 ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedTasksCount} مهمة محددة
              </p>
              <p className="text-xs text-muted-foreground">
                نفّذ الإجراء السريع من أسفل الشاشة ثم راجع القائمة.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => handleBulkStatusChange("in_progress")}
            >
              بدء
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => handleBulkStatusChange("completed")}
            >
              إكمال
            </Button>
            {isApprover && (
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleBulkStatusChange("completed")}
                title="اعتماد المهام المحددة"
              >
                اعتماد
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {hasCommandState ? "عرضك المخصص جاهز" : "وصول سريع للمهام"}
              </p>
              <p className="text-xs text-muted-foreground">
                افتح الفلاتر أو أضف مهمة جديدة دون الرجوع إلى أعلى الصفحة.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowFilterSidebar(true)}
            >
              الفلاتر
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={() => setShowCreateTaskModal(true)}
            >
              جديدة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
