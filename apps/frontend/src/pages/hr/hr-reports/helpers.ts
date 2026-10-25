import { PayrollReport } from "./types";

export const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export const YEARS = [2023, 2024, 2025, 2026];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const exportReportToCsv = (
  activeTab: string,
  payrollReport: PayrollReport | null,
  selectedMonth: number,
  selectedYear: number,
  tToast: { error: (msg: string) => void; success: (msg: string) => void },
) => {
  if (!payrollReport && activeTab === "payroll") {
    tToast.error("HRReports.msg_80be");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM

  if (activeTab === "payroll" && payrollReport) {
    // 1. Summary Header
    csvContent += "Metric,Value\n";
    csvContent += `Total Payroll,${payrollReport.totalPayroll}\n`;
    csvContent += `Base Salary,${payrollReport.totalBaseSalary}\n`;
    csvContent += `Allowances,${payrollReport.totalAllowances}\n`;
    csvContent += `Deductions,${payrollReport.totalDeductions}\n`;
    csvContent += `Overtime,${payrollReport.totalOvertime}\n`;
    csvContent += `Average Salary,${payrollReport.averageSalary}\n\n`;

    // 2. Department Breakdown
    csvContent += "Department,Employees,Total Cost\n";
    payrollReport.byDepartment.forEach((dept) => {
      csvContent += `${dept.department},${dept.employees},${dept.total}\n`;
    });

    const fileName = `${activeTab}_report_${selectedMonth}_${selectedYear}.csv`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    tToast.success("HRReports.msg_ed25");
  } else {
    // Basic export for other tabs
    let basicContent = "data:text/csv;charset=utf-8,\uFEFF";
    basicContent += "تقرير الموارد البشرية\n";
    basicContent += `القسم: , ${activeTab}\n`;
    basicContent += `التاريخ: , ${selectedMonth}/${selectedYear}\n\n`;
    basicContent +=
      "Note: This is a placeholder export for the selected tab.\n";

    const fileName = `${activeTab}_report_${selectedMonth}_${selectedYear}.csv`;
    const encodedUri = encodeURI(basicContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    tToast.success("HRReports.msg_4045");
  }
};
