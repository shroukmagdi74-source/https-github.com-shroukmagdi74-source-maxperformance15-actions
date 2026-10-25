import { EmployeeReportData } from "./types";

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PRESENT:
      "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    ABSENT: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    LATE: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    ON_LEAVE:
      "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    APPROVED:
      "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    PENDING:
      "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    REJECTED: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PRESENT: "حاضر",
    ABSENT: "غائب",
    LATE: "متأخر",
    ON_LEAVE: "إجازة",
    APPROVED: "موافق عليه",
    PENDING: "معلق",
    REJECTED: "مرفوض",
  };
  return labels[status] || status;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getAttendanceRate = (report: EmployeeReportData | null): string => {
  if (!report?.attendance?.totalDays || report.attendance.totalDays === 0) {
    return "0";
  }
  return (
    (report.attendance.presentDays / report.attendance.totalDays) *
    100
  ).toFixed(1);
};

export const getPerformanceColor = (score: number): string => {
  if (score >= 4.5) return "text-green-600 dark:text-green-400";
  if (score >= 3.5) return "text-blue-600 dark:text-blue-400";
  if (score >= 2.5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const buildEmployeeReportCsv = (report: EmployeeReportData): string => {
  const headers = [
    "التاريخ",
    "الحالة",
    "وقت الدخول",
    "وقت الخروج",
    "ساعات العمل",
    "التأخير (دقيقة)",
  ];
  const rows = (report.attendance?.records || []).map((record) => [
    new Date(record.date).toLocaleDateString("ar-EG"),
    getStatusLabel(record.status),
    record.checkIn ? new Date(record.checkIn).toLocaleTimeString("ar-EG") : "-",
    record.checkOut
      ? new Date(record.checkOut).toLocaleTimeString("ar-EG")
      : "-",
    record.workHours?.toFixed(2) || "0",
    String(record.lateMinutes || "0"),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
};
