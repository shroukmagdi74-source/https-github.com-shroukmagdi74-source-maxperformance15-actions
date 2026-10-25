import { ReceiptData } from "./types";

export const createInitialReceipts = (): ReceiptData[] => [
  {
    id: "REC-001",
    referenceNumber: "AST-2024-001",
    date: new Date().toISOString(),
    employeeName: "أحمد محمد علي",
    employeeId: "EMP-1552",
    jobTitle: "مطور واجهات (Frontend Developer)",
    department: "تطوير البرمجيات",
    assetName: 'MacBook Pro M3 14"',
    assetCategory: "أجهزة حاسوب محمول",
    assetCode: "LP-8842",
    assetSerial: "SN-998822JH1",
    assetCondition: "جديد (Brand New)",
    managerName: "م. خالد ابراهيم",
    status: "pending",
  },
  {
    id: "REC-002",
    referenceNumber: "AST-2024-005",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    employeeName: "سارة محمود حسن",
    employeeId: "EMP-2210",
    jobTitle: "أخصائي موارد بشرية (HR Specialist)",
    department: "الموارد البشرية",
    assetName: "iPhone 15 Pro Max",
    assetCategory: "هواتف ذكية",
    assetCode: "MB-1022",
    assetSerial: "SN-IPH15-XXL",
    assetCondition: "ممتازة",
    managerName: "م. خالد ابراهيم",
    signatureUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png",
    status: "signed",
  },
];

export const buildReceiptFromSelection = (
  employee: any,
  asset: any,
): ReceiptData => ({
  id: `REC-${Math.floor(Math.random() * 1000)}`,
  referenceNumber: `AST-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
  date: new Date().toISOString(),
  employeeName:
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    employee.name ||
    "غير محدد",
  employeeId: employee.employeeId || employee.id || "غير محدد",
  jobTitle:
    typeof employee.position === "object"
      ? employee.position?.title || "غير محدد"
      : employee.position || employee.jobTitle || "غير محدد",
  department: employee.department?.name || employee.department || "غير محدد",
  assetName: asset.name || "غير محدد",
  assetCategory: asset.category?.name || asset.assetCategory || "غير محدد",
  assetCode: asset.code || "غير محدد",
  assetSerial:
    asset.serialNumber ||
    `SN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
  assetCondition:
    asset.condition === "NEW"
      ? "جديد (Brand New)"
      : asset.condition === "GOOD"
        ? "جيد"
        : asset.condition === "FAIR"
          ? "مقبول"
          : "جديد",
  managerName: "م. خالد ابراهيم",
  status: "pending",
});

export const RECEIPT_PRINT_STYLES = `
  @media print {
    body * { visibility: hidden; background: white !important; }
    #printable-receipt, #printable-receipt * { visibility: visible; }
    #printable-receipt { 
      position: absolute; 
      left: 0; 
      top: 0; 
      width: 100%; 
      padding: 0; 
      margin: 0;
      border: none !important;
      box-shadow: none !important;
    }
    @page {
      margin: 1cm;
      size: A4;
    }
  }
`;
