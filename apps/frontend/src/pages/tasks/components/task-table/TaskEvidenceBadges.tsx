import React from "react";
import type { Task } from "../../types";

interface TaskEvidenceBadgesProps {
  task: Task;
}

export const TaskEvidenceBadges: React.FC<TaskEvidenceBadgesProps> = ({ task }) => {
  const normStatus = String(task.status || "").toLowerCase();
  const isReview = normStatus === "in_review";
  const isMissingEvidence = task.missingEvidence || (isReview && !task.hasEvidence);

  let isBlocked48h = false;
  if (isReview && task.submittedForReviewAt) {
    const diffHours =
      (Date.now() - new Date(task.submittedForReviewAt).getTime()) / (1000 * 60 * 60);
    isBlocked48h = diffHours > 48;
  }

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {isMissingEvidence && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20"
          title="المهمة في المراجعة بدون مرفقات أو دليل عمل كافٍ"
        >
          ⚠️ بدون دليل
        </span>
      )}
      {isBlocked48h && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20"
          title="معلقة في المراجعة لأكثر من 48 ساعة"
        >
          ⏳ مسدودة &gt; 48h
        </span>
      )}
      {task.returnCount && task.returnCount > 0 ? (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400 border border-orange-500/20"
          title={`أعيدت للتعديل ${task.returnCount} مرات`}
        >
          ↩️ إرجاع ({task.returnCount})
        </span>
      ) : null}
      {task.convertedFromBacklog && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          title="محوّلة من الباك لوج"
        >
          تحسين
        </span>
      )}
    </div>
  );
};
