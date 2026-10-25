import React from "react";
import { Filter } from "lucide-react";
import { BusinessSectionPanel } from "../../../components/business/BusinessSurface";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { GoalType, ProjectOption } from "./types";

interface GoalsFilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  goalType: "ALL" | GoalType;
  onGoalTypeChange: (value: "ALL" | GoalType) => void;
  status: string;
  onStatusChange: (value: string) => void;
  projectId: string;
  onProjectIdChange: (value: string) => void;
  projects: ProjectOption[];
  includeDaily: boolean;
  onIncludeDailyChange: (checked: boolean) => void;
}

export const GoalsFilterPanel: React.FC<GoalsFilterPanelProps> = ({
  search,
  onSearchChange,
  goalType,
  onGoalTypeChange,
  status,
  onStatusChange,
  projectId,
  onProjectIdChange,
  projects,
  includeDaily,
  onIncludeDailyChange,
}) => {
  return (
    <BusinessSectionPanel
      title="التصفية والعرض"
      description="فلتر حسب نوع الهدف أو المشروع أو الحالة، وقرر هل تريد رؤية الأهداف اليومية مع باقي السلسلة."
      contentClassName="space-y-4"
    >
      <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-testid="goals-search-input"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ابحث بعنوان الهدف أو المسؤول"
            className="rounded-2xl pr-10"
          />
        </div>

        <select
          data-testid="goals-type-filter"
          value={goalType}
          onChange={(event) =>
            onGoalTypeChange(event.target.value as "ALL" | GoalType)
          }
          className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">كل الأنواع</option>
          <option value="PROJECT">أهداف المشاريع</option>
          <option value="EMPLOYEE">أهداف الموظفين</option>
          <option value="DEPARTMENT">أهداف الأقسام</option>
          <option value="COMPANY">الأهداف العامة</option>
          <option value="DAILY">الأهداف اليومية</option>
        </select>

        <select
          data-testid="goals-status-filter"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">كل الحالات</option>
          <option value="PENDING">معلق</option>
          <option value="IN_PROGRESS">قيد التنفيذ</option>
          <option value="COMPLETED">مكتمل</option>
          <option value="CANCELLED">ملغي</option>
        </select>

        <select
          data-testid="goals-project-filter"
          value={projectId}
          onChange={(event) => onProjectIdChange(event.target.value)}
          className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
        >
          <option value="">كل المشاريع</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">إظهار الأهداف اليومية</div>
          <div className="text-xs text-muted-foreground">
            مفيد عند مراجعة التوزيع اليومي وتحديثات قبل الانصراف.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {includeDaily ? "مفعّل" : "مخفي"}
          </span>
          <Switch
            data-testid="goals-include-daily-switch"
            checked={includeDaily}
            onCheckedChange={(checked) => onIncludeDailyChange(Boolean(checked))}
          />
        </div>
      </div>
    </BusinessSectionPanel>
  );
};
