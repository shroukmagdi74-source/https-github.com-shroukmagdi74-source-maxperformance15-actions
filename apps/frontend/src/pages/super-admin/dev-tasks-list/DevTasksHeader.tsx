import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  ViewColumnsIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface DevTasksHeaderProps {
  total: number;
  onExport: (format: "csv" | "json") => void;
}

export const DevTasksHeader: React.FC<DevTasksHeaderProps> = ({
  total,
  onExport,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardDocumentListIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            قائمة المهام
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="font-mono tabular-nums">{total}</span> مهمة
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
          <ArrowDownTrayIcon className="size-4" />
          تصدير CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/super-admin/dev-kanban")}
        >
          <ViewColumnsIcon className="size-4" />
          Kanban
        </Button>
        <Button size="sm" onClick={() => navigate("/super-admin/dev-tasks/new")}>
          <PlusIcon className="size-4" />
          مهمة جديدة
        </Button>
      </div>
    </div>
  );
};
