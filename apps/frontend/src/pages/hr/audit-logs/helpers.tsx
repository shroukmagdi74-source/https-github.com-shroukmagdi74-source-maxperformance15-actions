import React from "react";
import { Badge } from "../../../components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Edit,
  Shield,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { AuditLog } from "./types";

export const formatFieldName = (field: string): string => {
  const translations: Record<string, string> = {
    amount: "المبلغ",
    totalSalary: "إجمالي الراتب",
    monthlyAmount: "القسط الشهري",
    reason: "السبب",
    status: "الحالة",
    note: "ملاحظات",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    type: "النوع",
    name: "الاسم",
    description: "الوصف",
    hours: "عدد الساعات",
    day: "اليوم",
    isPaid: "مدفوع",
  };
  return translations[field] || field;
};

export const getEntityName = (type: string): string => {
  const names: Record<string, string> = {
    EMPLOYEE: "موظف",
    DEPARTMENT: "قسم",
    POSITION: "مسمى وظيفي",
    LEAVE: "إجازة",
    ADVANCE: "سلفة",
    ADVANCE_REQUEST: "طلب سلفة",
    RESIGNATION: "استقالة",
    ATTENDANCE: "حضور وانصراف",
    SHIFT: "مناوبة",
    PERMISSION_REQUEST: "إذن خروج",
    DEDUCTION: "خصم",
    PAYROLL: "مسير رواتب",
    POLICY: "سياسة",
    GOAL: "هدف",
    FEEDBACK: "تقييم",
    SETTINGS: "إعدادات",
    USER: "مستخدم",
  };
  return names[type] || type;
};

export const getActionIcon = (action: string): React.ReactNode => {
  switch (action) {
    case "APPROVE":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "REJECT":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "UPDATE":
      return <Edit className="h-4 w-4 text-blue-500" />;
    case "CREATE":
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    case "DELETE":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "SETTLEMENT":
      return <Shield className="h-4 w-4 text-emerald-500" />;
    case "LOGIN":
      return <User className="h-4 w-4 text-indigo-500" />;
    case "LOGOUT":
      return <User className="h-4 w-4 text-gray-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

export const getActionBadge = (action: string): React.ReactNode => {
  const styles: Record<string, string> = {
    APPROVE:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    REJECT:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    UPDATE:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    CREATE:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
    DELETE:
      "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-300",
    SETTLEMENT:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    LOGIN:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
    LOGOUT:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const labels: Record<string, string> = {
    APPROVE: "موافقة",
    REJECT: "رفض",
    UPDATE: "تحديث",
    CREATE: "إنشاء",
    DELETE: "حذف",
    SETTLEMENT: "تصفية",
    LOGIN: "تسجيل دخول",
    LOGOUT: "تسجيل خروج",
    EXPORT: "تصدير",
    IMPORT: "استيراد",
    ASSIGN: "تعيين",
    ACTIVATE: "تفعيل",
    DEACTIVATE: "تعطيل",
  };

  return (
    <Badge
      variant="outline"
      className={styles[action] || "bg-muted text-muted-foreground"}
    >
      {labels[action] || action}
    </Badge>
  );
};

export const parseDetails = (details: any): Record<string, any> => {
  try {
    return typeof details === "string" ? JSON.parse(details) : details || {};
  } catch {
    return {};
  }
};

export const exportAuditLogsToCsv = (logs: AuditLog[]): void => {
  if (!logs.length) return;

  const headers = [
    "Date",
    "Time",
    "Actor Name",
    "Actor Email",
    "Action",
    "Entity Type",
    "Entity ID",
    "IP Address",
  ];
  const csvContent = [
    headers.join(","),
    ...logs.map((log) =>
      [
        format(new Date(log.createdAt), "yyyy-MM-dd"),
        format(new Date(log.createdAt), "HH:mm:ss"),
        `"${log.actorName}"`,
        `"${log.actor?.email || ""}"`,
        log.action,
        log.entityType,
        log.entityId,
        log.ipAddress || "",
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `audit_logs_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
