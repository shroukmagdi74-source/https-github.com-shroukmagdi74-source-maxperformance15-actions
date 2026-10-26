import React from "react";
import {
  ClockIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      );
    case "confirmed":
      return (
        <CheckIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      );
    case "completed":
      return (
        <CheckIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
      );
    case "cancelled":
      return <XMarkIcon className="h-5 w-5 text-red-500 dark:text-red-400" />;
    case "no_show":
      return (
        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      );
    default:
      return (
        <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      );
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
    case "confirmed":
      return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300";
    case "completed":
      return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
    case "no_show":
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "في الانتظار";
    case "confirmed":
      return "مؤكد";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    case "no_show":
      return "لم يحضر";
    default:
      return status;
  }
};

export const getTypeText = (type: string) => {
  switch (type) {
    case "consultation":
      return "استشارة";
    case "training":
      return "تدريب";
    case "meeting":
      return "اجتماع";
    case "demo":
      return "عرض توضيحي";
    default:
      return type;
  }
};
