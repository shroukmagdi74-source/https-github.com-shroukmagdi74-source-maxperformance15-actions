import { Payroll, months, statusConfig, formatCurrency } from './types';
import { tToast } from '../../../utils/i18n-toast';

export const escapeHTML = (str: string): string => {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m] || m));
};

export const printPayslip = (
  payroll: Payroll,
  company: { name?: string } | null | undefined,
  selectedMonth: number,
  selectedYear: number
): void => {
  const detailedAllowances = payroll.allowances
    ? (typeof payroll.allowances === 'string' ? JSON.parse(payroll.allowances) : payroll.allowances)
    : {};
  const detailedDeductions = payroll.deductions
    ? (typeof payroll.deductions === 'string' ? JSON.parse(payroll.deductions) : payroll.deductions)
    : {};

  const escapedFirstName = escapeHTML(payroll.employee?.firstName || '');
  const escapedLastName = escapeHTML(payroll.employee?.lastName || '');
  const escapedCompanyName = escapeHTML(company?.name || 'اسم الشركة');
  const escapedEmployeeNumber = escapeHTML(payroll.employee?.employeeNumber || '000');
  const escapedDepartmentName = escapeHTML(payroll.employee?.department?.name || 'غير محدد');
  const escapedPositionTitle = escapeHTML(payroll.employee?.position?.title || 'موظف');

  const qrData = `Company: ${escapedCompanyName} | Payroll ID: ${payroll.id} | Employee: ${escapedFirstName} ${escapedLastName} | Month: ${payroll.month}/${payroll.year} | Net: ${payroll.netSalary} EGP`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`;

  const printContent = `
    <html dir="rtl">
      <head>
        <title>كشف راتب - ${escapedFirstName} ${escapedLastName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', sans-serif; 
            color: #0f172a; 
            line-height: 1.5;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .container { 
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto; 
            background: #fff;
            padding: 40px;
            position: relative;
          }
          .top-bar {
            position: absolute;
            top: 0; left: 0; right: 0; height: 12px;
            background: linear-gradient(90deg, #1e1b4b 0%, #4338ca 100%);
          }
          .header { 
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 40px; margin-top: 10px;
          }
          .company-info .name { 
            font-size: 32px; font-weight: 800; color: #1e1b4b; line-height: 1.2; letter-spacing: -0.5px;
          }
          .company-info .sub { font-size: 14px; color: #64748b; font-weight: 500; margin-top: 4px; }
          .slip-badge {
            background: #f1f5f9; padding: 12px 24px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;
          }
          .slip-badge .title { font-size: 18px; font-weight: 800; color: #1e1b4b; display: block; }
          .slip-badge .period { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }
          .info-grid { 
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e2e8f0;
            border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 40px; 
          }
          .info-item { background: #fff; padding: 14px 18px; }
          .info-item .label { font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; display: block; }
          .info-item .value { font-size: 14px; font-weight: 700; color: #1e1b4b; }
          .payroll-body { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .section-title { font-size: 16px; font-weight: 800; padding-bottom: 10px; margin-bottom: 15px; border-bottom: 2px solid; }
          .section-title.earnings { color: #059669; border-color: #ecfdf5; }
          .section-title.deductions { color: #dc2626; border-color: #fef2f2; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px 0; font-size: 13px; font-weight: 600; color: #334155; border-bottom: 1px solid #f1f5f9; }
          td.amount { text-align: left; font-weight: 700; font-family: monospace; font-size: 14px; }
          .badge-mini { display: inline-block; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-right: 4px; }
          .badge-manual { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          .badge-auto { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
          .totals { 
            display: flex; justify-content: space-between; align-items: center; background: #1e1b4b;
            color: #fff; padding: 25px 35px; border-radius: 20px; margin-bottom: 50px;
          }
          .totals .qr-wrapper { display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .totals .qr-wrapper img { width: 70px; height: 70px; border-radius: 8px; background: #fff; padding: 4px; }
          .totals .qr-wrapper span { font-size: 10px; color: #94a3b8; }
          .net-card { text-align: left; }
          .net-card .l { font-size: 13px; font-weight: 600; color: #94a3b8; display: block; }
          .net-card .v { font-size: 32px; font-weight: 800; color: #38bdf8; font-family: monospace; }
          .details-summary { font-size: 11px; color: #cbd5e1; margin-top: 6px; display: flex; gap: 15px; }
          .signature-zone { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; text-align: center; }
          .sig-box { border-top: 1px solid #cbd5e1; padding-top: 15px; }
          .sig-box .name { font-weight: 700; font-size: 13px; color: #1e1b4b; }
          .sig-box .role { font-size: 11px; color: #64748b; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="top-bar"></div>
          <header class="header">
            <div class="company-info">
              <h1 class="name">${escapedCompanyName}</h1>
              <p class="sub">إشعار مفردات مرتب معتمد رسمياً</p>
            </div>
            <div class="slip-badge">
              <span class="title">كشف الراتب الشهري</span>
              <span class="period">${months[(payroll.month || selectedMonth) - 1]} ${payroll.year || selectedYear}</span>
            </div>
          </header>
          
          <section class="info-grid">
            <div class="info-item"><span class="label">الموظف</span><span class="value">${escapedFirstName} ${escapedLastName}</span></div>
            <div class="info-item"><span class="label">الرقم الوظيفي</span><span class="value">#${escapedEmployeeNumber}</span></div>
            <div class="info-item"><span class="label">القسم</span><span class="value">${escapedDepartmentName}</span></div>
            <div class="info-item"><span class="label">المسمى الوظيفي</span><span class="value">${escapedPositionTitle}</span></div>
            <div class="info-item"><span class="label">تاريخ الإصدار</span><span class="value">${new Date().toLocaleDateString('ar-EG')}</span></div>
            <div class="info-item" style="background: #f8fafc;"><span class="label">الحالة</span><span class="value" style="color: #4338ca;">${statusConfig[payroll.status]?.label || 'مسودة'}</span></div>
          </section>

          <main class="payroll-body">
            <div class="section">
              <h2 class="section-title earnings">الاستحقاقات</h2>
              <table>
                <tr><td>الراتب الأساسي</td><td class="amount">${formatCurrency(payroll.baseSalary)}</td></tr>
                ${Object.entries(detailedAllowances).map(([k, v]) => `<tr><td>${escapeHTML(k)}</td><td class="amount">${formatCurrency(Number(v))}</td></tr>`).join('')}
                ${payroll.overtimeAmount > 0 ? `<tr><td>العمل الإضافي</td><td class="amount">${formatCurrency(payroll.overtimeAmount)}</td></tr>` : ''}
                ${payroll.bonuses > 0 ? `<tr><td>المكافآت</td><td class="amount">${formatCurrency(payroll.bonuses)}</td></tr>` : ''}
                <tr style="border-top: 2px solid #ecfdf5;"><td style="font-weight: 800; color: #059669;">إجمالي الدخل</td><td class="amount" style="color: #059669;">${formatCurrency(payroll.grossSalary)}</td></tr>
              </table>
            </div>

            <div class="section">
              <h2 class="section-title deductions">الاستقطاعات</h2>
              <table>
                ${payroll.attendanceDeduction > 0 ? `<tr><td>خصم الغياب (${payroll.absentDays} يوم)</td><td class="amount">${formatCurrency(payroll.attendanceDeduction)}</td></tr>` : ''}
                ${payroll.socialInsurance > 0 ? `<tr><td>التأمينات الاجتماعية</td><td class="amount">${formatCurrency(payroll.socialInsurance)}</td></tr>` : ''}
                ${payroll.taxAmount > 0 ? `<tr><td>ضريبة الدخل</td><td class="amount">${formatCurrency(payroll.taxAmount)}</td></tr>` : ''}
                ${Object.entries(detailedDeductions).map(([key, value]) => {
                  if (['details', 'manualDetails', 'capNotes', 'advanceDetails'].includes(key)) return '';
                  return `<tr><td>${escapeHTML(key)}</td><td class="amount">${formatCurrency(Number(value))}</td></tr>`;
                }).join('')}
                <tr style="border-top: 2px solid #fef2f2;"><td style="font-weight: 800; color: #dc2626;">إجمالي الخصم</td><td class="amount" style="color: #dc2626;">${formatCurrency(payroll.totalDeductions)}</td></tr>
              </table>
            </div>
          </main>

          <footer class="totals">
            <div class="qr-wrapper"><img src="${qrCodeUrl}" alt="QR" /><span>تحقق من الصحة</span></div>
            <div class="net-card">
              <div class="label-group"><span class="l">صافي المبلغ المستحق للدفع</span><div class="v">${formatCurrency(payroll.netSalary)}</div></div>
              <div class="details-summary">
                <div>(+) إجمالي الدخل: ${formatCurrency(payroll.grossSalary)}</div>
                <div>(-) إجمالي الخصم: ${formatCurrency(payroll.totalDeductions)}</div>
              </div>
            </div>
          </footer>

          <div class="signature-zone">
            <div class="sig-box"><div class="name">${escapedFirstName} ${escapedLastName}</div><div class="role">توقيع المستلم</div></div>
            <div class="sig-box"><div class="name">قسم الحسابات</div><div class="role">المراجعة والاعتماد</div></div>
            <div class="sig-box"><div class="name">${escapedCompanyName}</div><div class="role">ختم الشركة والمدير</div></div>
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } else {
    tToast.error("payroll.msg_87c4");
  }
};

export const exportBankCsv = (
  payrolls: Payroll[],
  selectedMonth: number,
  selectedYear: number
): void => {
  if (payrolls.length === 0) {
    tToast.error("payroll.msg_06d8");
    return;
  }

  const headers = [
    'Employee Number',
    'Employee Name',
    'Bank Name',
    'IBAN / Account Number',
    'Amount',
    'Currency',
    'Payment Reference'
  ];

  const sanitizeCSV = (val: string | number) => {
    const str = String(val);
    if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
      return `'${str}`;
    }
    return str;
  };

  const rows = payrolls.map(p => {
    const name = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`;
    const bank = p.employee?.bankName || '';
    const account = p.employee?.bankIban || p.employee?.bankAccountNumber || '';
    const cleanAccount = account.replace(/\s/g, '');

    return [
      sanitizeCSV(p.employee?.employeeNumber || ''),
      `"${sanitizeCSV(name)}"`,
      `"${sanitizeCSV(bank)}"`,
      `"${sanitizeCSV(cleanAccount)}"`,
      sanitizeCSV(p.netSalary.toFixed(2)),
      'EGP',
      `"${sanitizeCSV(`SALARY ${selectedMonth}/${selectedYear}`)}"`
    ];
  });

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bank_transfer_payroll_${selectedMonth}_${selectedYear}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
