import { HRApiScopeOption } from "./types";

export const HR_API_SCOPES: HRApiScopeOption[] = [
  { value: "*", label: "* — كافة الصلاحيات (Full HR Access)" },
  { value: "hr:read", label: "hr:read — قراءة شاملة (All HR Read Endpoints)" },
  { value: "hr:write", label: "hr:write — كتابة شاملة (All HR Write Endpoints)" },
  { value: "hr:departments:read", label: "hr:departments:read — استعلام الأقسام فقط" },
  { value: "hr:positions:read", label: "hr:positions:read — استعلام المسميات الوظيفية فقط" },
  { value: "hr:employees:read", label: "hr:employees:read — استعلام الموظفين والإحصائيات والهيكل" },
  { value: "hr:employees:write", label: "hr:employees:write — إضافة وتحديث الموظفين" },
  { value: "hr:attendance:ingest", label: "hr:attendance:ingest — تسجيل وبث حركات البصمة" },
  { value: "hr:attendance:read", label: "hr:attendance:read — استعلام الحضور والملخص اليومي" },
  { value: "hr:leaves:read", label: "hr:leaves:read — استعلام طلبات وأرصدة الإجازات" },
  { value: "hr:leaves:write", label: "hr:leaves:write — تقديم طلبات إجازة جديدة" },
  { value: "hr:leaves:approve", label: "hr:leaves:approve — اتخاذ قرار قبول/رفض الإجازات" },
  { value: "hr:payroll:read", label: "hr:payroll:read — استعلام مسيرات ورواتب الموظفين" },
  { value: "hr:advances:read", label: "hr:advances:read — استعلام طلبات السلف المالية" },
  { value: "hr:deductions:read", label: "hr:deductions:read — استعلام سجلات الخصومات والجزاءات" },
  { value: "hr:deductions:write", label: "hr:deductions:write — إنشاء وتعديل الخصومات والجزاءات" },
  {
    value: "hr:rewards:read",
    label: "hr:rewards:read — استعلام سجلات المكافآت والحوافز وقواعد الالتزام بالدوام",
  },
  {
    value: "hr:rewards:write",
    label: "hr:rewards:write — إنشاء ومنح المكافآت وتقييم قواعد الالتزام بالدوام",
  },
  { value: "hr:shifts:read", label: "hr:shifts:read — استعلام الورديات والمناوبات" },
  {
    value: "hr:shifts:write",
    label: "hr:shifts:write — إنشاء وتعديل وتعيين الورديات للموظفين",
  },
  { value: "hr:settings:read", label: "hr:settings:read — استعلام إعدادات الموارد البشرية المقسمة" },
  {
    value: "hr:settings:write",
    label: "hr:settings:write — تعديل إعدادات الموارد البشرية مع دمج الأقسام",
  },
  {
    value: "hr:attendance:write",
    label: "hr:attendance:write — تصحيح وإعادة حساب سجلات الحضور والانصراف",
  },
  { value: "hr:warnings:read", label: "hr:warnings:read — استعلام الإنذارات واللفتات الإدارية" },
  { value: "hr:resignations:read", label: "hr:resignations:read — استعلام طلبات وإنهاء الاستقالات" },
];
