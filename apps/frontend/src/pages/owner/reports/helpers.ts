import { SalesReportData, TodayAttendanceData } from "./types";

export const computeSalesDateRange = (
  range: string,
): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case "today":
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "thisMonth":
      start.setDate(1);
      break;
    case "lastMonth":
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setDate(0);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const computeAttendancePresetRange = (
  preset: string,
): { startDate: string; endDate: string } | null => {
  const today = new Date();
  let start = new Date();
  let end = new Date();

  switch (preset) {
    case "today":
      start = today;
      end = today;
      break;
    case "yesterday":
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case "lastWeek":
      start.setDate(today.getDate() - 7);
      end = today;
      break;
    case "thisMonth":
      start.setDate(1);
      end = today;
      break;
    case "lastMonth":
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end.setMonth(today.getMonth());
      end.setDate(0);
      break;
    default:
      return null;
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const getOwnerReportsImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const backendUrl =
    import.meta.env["VITE_API_URL"]?.replace("/api/v1", "") ||
    "http://localhost:3007";
  return `${backendUrl}/${path.replace(/^\/+/, "")}`;
};

export const formatReportTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const downloadSalesReportCsv = (
  reportData: SalesReportData,
  startDate: string,
  endDate: string,
) => {
  const headers = [
    "الشركة",
    "الطلبات",
    "الإيرادات",
    "مكتمل",
    "ملغي",
    "نسبة الإكمال",
  ];
  const rows = reportData.byCompany.map((c) => [
    c.company.name,
    c.stats.totalOrders,
    c.stats.totalRevenue,
    c.stats.completedOrders,
    c.stats.cancelledOrders,
    `${c.stats.completionRate}%`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sales-report-${startDate}-to-${endDate}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadTodayAttendanceCsv = (
  todayAttendanceData: TodayAttendanceData,
) => {
  const headers = [
    "الموظف",
    "الشركة",
    "وقت الحضور",
    "وقت الانصراف",
    "ساعات العمل",
    "التأخير (دقيقة)",
    "الحالة",
  ];
  const rows = todayAttendanceData.records.map((r) => [
    `${r.employee.firstName} ${r.employee.lastName}`,
    r.company.name,
    new Date(r.checkIn).toLocaleTimeString("ar-EG"),
    r.checkOut
      ? new Date(r.checkOut).toLocaleTimeString("ar-EG")
      : "لم ينصرف بعد",
    r.workHours ? r.workHours.toFixed(2) : "-",
    r.lateMinutes,
    r.status === "LATE" ? "متأخر" : "في الوقت",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `today-attendance-${todayAttendanceData.date}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
