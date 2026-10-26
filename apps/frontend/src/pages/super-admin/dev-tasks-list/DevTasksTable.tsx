import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Task } from "./types";
import { DevTaskRow } from "./DevTaskRow";

interface DevTasksTableProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTasks: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  settings: any;
  userPermissions: any;
  onSort: (field: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onRetry: () => void;
}

export const DevTasksTable: React.FC<DevTasksTableProps> = ({
  tasks,
  loading,
  error,
  selectedTasks,
  sortBy,
  sortOrder,
  settings,
  userPermissions,
  onSort,
  onToggleSelectAll,
  onToggleSelectTask,
  onDeleteTask,
  onRetry,
}) => {
  const navigate = useNavigate();

  const renderSortChevron = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUpIcon className="size-3" />
    ) : (
      <ChevronDownIcon className="size-3" />
    );
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card ring-1 ring-foreground/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="تحديد جميع المهام"
                checked={selectedTasks.length === tasks.length && tasks.length > 0}
                onChange={onToggleSelectAll}
                className="rounded border-border"
              />
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort("title")}
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                المهمة
                {renderSortChevron("title")}
              </button>
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              النوع
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort("status")}
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                الحالة
                {renderSortChevron("status")}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort("priority")}
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                الأولوية
                {renderSortChevron("priority")}
              </button>
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              التقدم
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              المسؤول
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              المشروع
            </TableHead>
            <TableHead>
              <button
                onClick={() => onSort("dueDate")}
                className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                الاستحقاق
                {renderSortChevron("dueDate")}
              </button>
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              إجراءات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="h-48 text-center">
                <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto" />
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={10} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center">
                  <ExclamationTriangleIcon className="size-12 text-destructive/60 mb-3" />
                  <p className="text-destructive font-medium mb-2 text-sm">{error}</p>
                  <Button size="sm" onClick={onRetry}>
                    إعادة المحاولة
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/30">
                    <ClipboardDocumentListIcon className="size-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mt-4 mb-1">
                    لا توجد مهام
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
                    ابدأ بإنشاء مهمة جديدة لتتبع عمل فريقك
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate("/super-admin/dev-tasks/new")}
                  >
                    <PlusIcon className="size-4" />
                    إنشاء مهمة جديدة
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <DevTaskRow
                key={task.id}
                task={task}
                isSelected={selectedTasks.includes(task.id)}
                settings={settings}
                userPermissions={userPermissions}
                onToggleSelect={onToggleSelectTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
