import React from "react";
import { ArrowLongDownIcon, ArrowLongUpIcon } from "@heroicons/react/24/outline";
import type { TaskSortBy } from "../../types";

export interface TaskSortIndicatorProps {
  column: TaskSortBy;
  currentSort: TaskSortBy;
  order: "asc" | "desc";
}

export const TaskSortIndicator: React.FC<TaskSortIndicatorProps> = ({
  column,
  currentSort,
  order,
}) => {
  if (currentSort !== column) return null;
  return order === "asc" ? (
    <ArrowLongUpIcon className="inline-block size-3.5 text-primary" />
  ) : (
    <ArrowLongDownIcon className="inline-block size-3.5 text-primary" />
  );
};
