import React from "react";
import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  PauseCircleIcon,
} from "@heroicons/react/24/outline";
import { normalizeTaskStatus } from "./types";

export const getStatusIcon = (status: string) => {
  switch (normalizeTaskStatus(status)) {
    case "pending":
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case "in_progress":
      return <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />;
    case "in_review":
      return <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-500" />;
    case "on_hold":
      return <PauseCircleIcon className="h-5 w-5 text-amber-500" />;
    case "completed":
      return <CheckIcon className="h-5 w-5 text-green-500" />;
    case "cancelled":
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-500" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (normalizeTaskStatus(status)) {
    case "pending":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    case "in_progress":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    case "in_review":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
    case "on_hold":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
    case "completed":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
};

export const getStatusText = (status: string) => {
  switch (normalizeTaskStatus(status)) {
    case "pending":
      return "في الانتظار";
    case "in_progress":
      return "قيد التنفيذ";
    case "in_review":
      return "بانتظار الاعتماد";
    case "on_hold":
      return "معلّقة";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    default:
      return status;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    case "high":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    case "low":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "عاجل";
    case "high":
      return "عالي";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return priority;
  }
};

export const isOverdue = (dueDate: string | null, status: string) => {
  if (!dueDate) {
    return false;
  }

  return (
    new Date(dueDate) < new Date() &&
    !["completed", "cancelled"].includes(normalizeTaskStatus(status))
  );
};
