import { TFunction } from "i18next";
import {
  MonthOption,
  PayrollData,
  PayrollStatusConfig,
  SalaryComponent,
} from "./types";

export const formatCurrency = (amount: any): string => {
  if (amount === undefined || amount === null) return "0.00";
  return Number(amount).toLocaleString("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseComponents = (jsonStr: string | null): SalaryComponent[] => {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed;
    return Object.entries(parsed).map(([name, amount]) => ({
      name,
      amount:
        typeof amount === "number" ? amount : parseFloat(amount as string) || 0,
    }));
  } catch {
    return [];
  }
};

export const escapeHTML = (str: string): string => {
  if (!str) return "";
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m] || m,
  );
};

export const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const buildPrintablePayrollHtml = ({
  payrollData,
  companyName,
  months,
  month,
  year,
  statusConfig,
  t,
}: {
  payrollData: PayrollData;
  companyName?: string;
  months: MonthOption[];
  month: string;
  year: string;
  statusConfig: PayrollStatusConfig;
  t: TFunction;
}): string => {
  const detailedAllowances = payrollData.allowances
    ? typeof payrollData.allowances === "string"
      ? JSON.parse(payrollData.allowances)
      : payrollData.allowances
    : {};
  const detailedDeductions = payrollData.deductions
    ? typeof payrollData.deductions === "string"
      ? JSON.parse(payrollData.deductions)
      : payrollData.deductions
    : {};

  const escapedFirstName = escapeHTML(payrollData.employee?.firstName || "");
  const escapedLastName = escapeHTML(payrollData.employee?.lastName || "");
  const escapedCompanyName = escapeHTML(
    companyName || t("employee.payroll.companyName"),
  );
  const escapedEmployeeNumber = escapeHTML(
    payrollData.employee?.employeeNumber || "000",
  );
  const escapedPositionTitle = escapeHTML(
    payrollData.employee?.position?.title || t("employee.payroll.distinguished"),
  );

  const qrData = `Company: ${escapedCompanyName} | Payroll ID: ${payrollData.id} | Employee: ${escapedFirstName} ${escapedLastName} | Month: ${payrollData.month}/${payrollData.year} | Net: ${payrollData.netSalary} EGP`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`;

  return `
      <html dir="rtl">
        <head>
          <title>${t("employee.payroll.salaryStatement", { name: `${escapedFirstName} ${escapedLastName}` })}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Cairo', sans-serif; color: #0f172a; line-height: 1.5; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .container { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 40px; position: relative; }
            .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 12px; background: linear-gradient(90deg, #1e1b4b 0%, #4338ca 100%); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; margin-top: 10px; }
            .company-info .name { font-size: 32px; font-weight: 800; color: #1e1b4b; line-height: 1.2; }
            .slip-badge { background: #f1f5f9; padding: 12px 24px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
            .slip-badge .title { font-size: 18px; font-weight: 800; color: #1e1b4b; display: block; }
            .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e2e8f0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 40px; }
            .info-item { background: #fff; padding: 16px 20px; display: flex; flex-direction: column; }
            .info-item .label { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
            .info-item .value { color: #1e293b; font-weight: 700; font-size: 15px; }
            .payroll-body { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 16px; font-weight: 800; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f1f5f9; }
            .earnings { color: #059669; border-color: #ecfdf5; }
            .deductions { color: #dc2626; border-color: #fef2f2; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 14px 0; border-bottom: 1px solid #f8fafc; font-size: 14px; }
            .amount { text-align: left; font-weight: 700; color: #0f172a; font-family: monospace; }
            .totals { margin-top: 40px; display: flex; align-items: flex-end; gap: 30px; }
            .qr-wrapper { flex-shrink: 0; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
            .qr-wrapper img { width: 80px; height: 80px; }
            .net-card { flex-grow: 1; background: #1e1b4b; color: #fff; border-radius: 20px; padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; }
            .net-card .v { font-size: 34px; font-weight: 900; }
            .signature-zone { margin-top: 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; text-align: center; }
            .sig-box { border-top: 1px solid #e2e8f0; padding-top: 16px; }
            .sig-box .name { font-size: 13px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="top-bar"></div>
            <header class="header">
              <div class="company-info"><div class="name">${escapedCompanyName}</div></div>
              <div class="slip-badge"><span class="title">${t("employee.payroll.monthlySalaryStatement")}</span><span class="period">${months.find((m) => m.value === month)?.label} ${year}</span></div>
            </header>
            <section class="info-grid">
              <div class="info-item"><span class="label">${t("employee.payroll.employeeLabel")}</span><span class="value">${escapedFirstName} ${escapedLastName}</span></div>
              <div class="info-item"><span class="label">${t("employee.payroll.employeeId")}</span><span class="value">#${escapedEmployeeNumber}</span></div>
              <div class="info-item"><span class="label">${t("employee.payroll.jobTitle")}</span><span class="value">${escapedPositionTitle}</span></div>
              <div class="info-item"><span class="label">${t("employee.payroll.issueDate")}</span><span class="value">${new Date().toLocaleDateString("ar-EG")}</span></div>
              <div class="info-item"><span class="label">${t("employee.payroll.status")}</span><span class="value">${statusConfig[payrollData.status]?.label || t("employee.payroll.statusApproved")}</span></div>
            </section>
            <main class="payroll-body">
              <div class="section">
                <h2 class="section-title earnings">${t("employee.payroll.statementEarnings")}</h2>
                <table>
                  <tr><td>${t("employee.payroll.baseSalary")}</td><td class="amount">${formatCurrency(payrollData.baseSalary)}</td></tr>
                  ${Object.entries(detailedAllowances)
                    .map(
                      ([k, v]) =>
                        `<tr><td>${escapeHTML(k)}</td><td class="amount">${formatCurrency(v)}</td></tr>`,
                    )
                    .join("")}
                  ${payrollData.overtimeAmount > 0 ? `<tr><td>${t("employee.payroll.statementOvertime")}</td><td class="amount">${formatCurrency(payrollData.overtimeAmount)}</td></tr>` : ""}
                  ${payrollData.bonuses > 0 ? `<tr><td>${t("employee.payroll.statementBonuses")}</td><td class="amount">${formatCurrency(payrollData.bonuses)}</td></tr>` : ""}
                  <tr style="border-top: 2px solid #ecfdf5;"><td style="font-weight: 800; color: #059669;">${t("employee.payroll.statementSubtotal")}</td><td class="amount" style="color: #059669;">${formatCurrency(payrollData.grossSalary)}</td></tr>
                </table>
              </div>
              <div class="section">
                <h2 class="section-title deductions">${t("employee.payroll.statementDeductions")}</h2>
                <table>
                  ${payrollData.attendanceDeduction > 0 ? `<tr><td>${t("employee.payroll.absenceDeduction")}</td><td class="amount">${formatCurrency(payrollData.attendanceDeduction)}</td></tr>` : ""}
                  ${payrollData.socialInsurance > 0 ? `<tr><td>${t("employee.payroll.insurance")}</td><td class="amount">${formatCurrency(payrollData.socialInsurance)}</td></tr>` : ""}
                  ${payrollData.taxAmount > 0 ? `<tr><td>${t("employee.payroll.tax")}</td><td class="amount">${formatCurrency(payrollData.taxAmount)}</td></tr>` : ""}
                  ${Object.entries(detailedDeductions)
                    .map(([k, v]) => {
                      if (
                        [
                          "details",
                          "manualDetails",
                          "capNotes",
                          "advanceDetails",
                        ].includes(k)
                      )
                        return "";
                      return `<tr><td>${escapeHTML(k)}</td><td class="amount">${formatCurrency(v)}</td></tr>`;
                    })
                    .join("")}
                  <tr style="border-top: 2px solid #fef2f2;"><td style="font-weight: 800; color: #dc2626;">${t("employee.payroll.statementTotal")}</td><td class="amount" style="color: #dc2626;">${formatCurrency(payrollData.totalDeductions)}</td></tr>
                </table>
              </div>
            </main>
            <footer class="totals">
              <div class="qr-wrapper"><img src="${qrCodeUrl}" alt="QR" /></div>
              <div class="net-card"><div class="label-group"><span>${t("employee.payroll.netAmount")}</span><div class="v">${formatCurrency(payrollData.netSalary)}</div></div></div>
            </footer>
          </div>
        </body>
      </html>
    `;
};
