import { AttendanceReportData, EmployeeAttendanceData, OwnerReportOptions } from "./types";

export const getOwnerReportImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const backendUrl =
    import.meta.env["VITE_API_URL"]?.replace("/api/v1", "") ||
    "http://localhost:3007";
  return `${backendUrl}/${path.replace(/^\/+/, "")}`;
};

export const computePresetDateRange = (
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
    case "beforeYesterday":
      start.setDate(today.getDate() - 2);
      end.setDate(today.getDate() - 2);
      break;
    case "lastWeek":
      start.setDate(today.getDate() - 7);
      end = today;
      break;
    case "lastMonth":
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end.setMonth(today.getMonth());
      end.setDate(0);
      break;
    case "thisMonth":
      start.setDate(1);
      end = today;
      break;
    default:
      return null;
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const getAttendanceRate = (item: EmployeeAttendanceData): number =>
  item.stats.totalRecords > 0
    ? Math.round(
        ((item.stats.present + item.stats.late) / item.stats.totalRecords) * 100,
      )
    : 0;

export const getAttendanceEvaluationText = (attendanceRate: number): string => {
  if (attendanceRate >= 95) return "أداء ممتاز - موظف ملتزم جداً";
  if (attendanceRate >= 90) return "أداء جيد جداً - التزام عالي";
  if (attendanceRate >= 80) return "أداء جيد - التزام مقبول";
  if (attendanceRate >= 70) return "أداء متوسط - يحتاج متابعة";
  return "أداء ضعيف - يحتاج تحسين فوري";
};

export const downloadOwnerAttendanceHtmlReport = (
  reportData: AttendanceReportData,
  filteredEmployees: EmployeeAttendanceData[],
  reportOptions: OwnerReportOptions,
  startDate: string,
  endDate: string,
) => {
  const reportHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
        .header h1 { color: #4F46E5; margin: 0; }
        .header p { color: #6B7280; margin: 5px 0; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-card .label { font-size: 12px; color: #6B7280; }
        .stat-card .value { font-size: 24px; font-weight: bold; color: #1F2937; }
        .employee-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
        .employee-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .employee-name { font-size: 16px; font-weight: bold; color: #1F2937; }
        .attendance-rate { font-size: 20px; font-weight: bold; }
        .rate-excellent { color: #10B981; }
        .rate-good { color: #F59E0B; }
        .rate-poor { color: #EF4444; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
        .stat-box { text-align: center; padding: 8px; border-radius: 6px; }
        .stat-box.present { background: #D1FAE5; color: #065F46; }
        .stat-box.late { background: #FEF3C7; color: #92400E; }
        .stat-box.absent { background: #FEE2E2; color: #991B1B; }
        .stat-box.leave { background: #DBEAFE; color: #1E40AF; }
        .company-badge { background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>تقرير حضور الموظفين</h1>
        <p>الفترة: من ${startDate} إلى ${endDate}</p>
        <p>تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-EG")}</p>
      </div>
      ${
        reportOptions.includeCharts
          ? `
        <div class="stats">
          <div class="stat-card"><div class="label">إجمالي الموظفين</div><div class="value">${reportData.overview.totalEmployees}</div></div>
          <div class="stat-card"><div class="label">حاضر</div><div class="value" style="color: #10B981;">${reportData.overview.totalPresent}</div></div>
          <div class="stat-card"><div class="label">متأخر</div><div class="value" style="color: #F59E0B;">${reportData.overview.totalLate}</div></div>
          <div class="stat-card"><div class="label">غائب</div><div class="value" style="color: #EF4444;">${reportData.overview.totalAbsent}</div></div>
        </div>
      `
          : ""
      }
      <h2 style="color: #4F46E5; margin-top: 30px;">تفاصيل الموظفين</h2>
      ${filteredEmployees
        .filter((item) => {
          if (!reportOptions.showOnlyIssues) return true;
          const rate = getAttendanceRate(item);
          return rate < 80 || item.stats.absent > 2;
        })
        .map((item) => {
          const attendanceRate = getAttendanceRate(item);
          const rateClass =
            attendanceRate >= 90
              ? "rate-excellent"
              : attendanceRate >= 75
                ? "rate-good"
                : "rate-poor";
          return `
            <div class="employee-card">
              <div class="employee-header">
                <div>
                  <div class="employee-name">${item.user.firstName} ${item.user.lastName}</div>
                  <div style="font-size: 12px; color: #6B7280;">${item.user.email}</div>
                  <span class="company-badge">${item.company.name}</span>
                </div>
                <div class="attendance-rate ${rateClass}">${attendanceRate}%</div>
              </div>
              ${
                reportOptions.includeDetails
                  ? `
                <div class="stats-grid">
                  <div class="stat-box present"><div style="font-size: 18px; font-weight: bold;">${item.stats.present}</div><div style="font-size: 11px;">حاضر</div></div>
                  <div class="stat-box late"><div style="font-size: 18px; font-weight: bold;">${item.stats.late}</div><div style="font-size: 11px;">متأخر</div></div>
                  <div class="stat-box absent"><div style="font-size: 18px; font-weight: bold;">${item.stats.absent}</div><div style="font-size: 11px;">غائب</div></div>
                  <div class="stat-box leave"><div style="font-size: 18px; font-weight: bold;">${item.stats.onLeave}</div><div style="font-size: 11px;">إجازة</div></div>
                </div>
              `
                  : ""
              }
            </div>
          `;
        })
        .join("")}
    </body>
    </html>
  `;

  const blob = new Blob([reportHTML], { type: "text/html;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-report-${startDate}-to-${endDate}.html`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadOwnerAttendanceCsvReport = (
  filteredEmployees: EmployeeAttendanceData[],
  startDate: string,
  endDate: string,
  includeEvaluation: boolean,
  filePrefix: string,
) => {
  const headers = [
    "الموظف",
    "البريد الإلكتروني",
    "الشركة",
    "حاضر",
    "متأخر",
    "غائب",
    "في إجازة",
    "نسبة الحضور",
    ...(includeEvaluation ? ["التقييم"] : []),
  ];

  const rows = filteredEmployees.map((item) => {
    const attendanceRate = getAttendanceRate(item);
    const evaluation =
      attendanceRate >= 95
        ? "ممتاز"
        : attendanceRate >= 90
          ? "جيد جداً"
          : attendanceRate >= 80
            ? "جيد"
            : attendanceRate >= 70
              ? "متوسط"
              : "ضعيف";

    return [
      `${item.user.firstName} ${item.user.lastName}`,
      item.user.email,
      item.company.name,
      item.stats.present,
      item.stats.late,
      item.stats.absent,
      item.stats.onLeave,
      `${attendanceRate}%`,
      ...(includeEvaluation ? [evaluation] : []),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filePrefix}-${startDate}-to-${endDate}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
