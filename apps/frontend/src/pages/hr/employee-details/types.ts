export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationalId: string;
  address: string;
  city: string;
  country: string;
  hireDate: string;
  probationEndDate: string;
  contractType: string;
  contractEndDate: string;
  status: string;
  baseSalary: number;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  enableAutoDeduction: boolean;
  monthlyGraceMinutes: number;
  maxDailyLateMinutes: number;
  lateDeductionRate: number;
  department: { id: string; name: string; color: string } | null;
  position: { id: string; title: string; level: number } | null;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  } | null;
  subordinates: any[];
  employeeDocuments: any[];
  leaveRequests: any[];
  attendance: any[];
}

export const statusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "نشط", color: "bg-green-100 text-green-800" },
  ON_LEAVE: { label: "في إجازة", color: "bg-yellow-100 text-yellow-800" },
  SUSPENDED: { label: "موقوف", color: "bg-red-100 text-red-800" },
  TERMINATED: { label: "منتهي", color: "bg-gray-100 text-gray-800" },
  RESIGNED: { label: "مستقيل", color: "bg-orange-100 text-orange-800" },
};

export const contractLabels: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACT: "عقد",
  TEMPORARY: "مؤقت",
  INTERNSHIP: "تدريب",
  FREELANCE: "حر",
};

export const genderLabels: Record<string, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

export const maritalLabels: Record<string, string> = {
  SINGLE: "أعزب",
  MARRIED: "متزوج",
  DIVORCED: "مطلق",
  WIDOWED: "أرمل",
};
