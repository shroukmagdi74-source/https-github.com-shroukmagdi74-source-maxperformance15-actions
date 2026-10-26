import { ViewMode } from "../ScheduleCalendar";

export interface Appointment {
  id: string;
  bookingNo?: number;
  patientName: string;
  patientPhone?: string;
  patientGender?: string;
  patientAge?: string;
  nationalId?: string;
  insuranceNumber?: string;
  patientFlags?: string[] | string;
  examTypeId?: string;
  examTypeName?: string;
  examTypeIds?: string[] | string;
  deviceId?: string;
  deviceName?: string;
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  payerType?: string;
  referralSourceId?: string;
  referralSourceName?: string;
  externalPartnerId?: string;
  externalPartnerName?: string;
  paymentDestination?: string;
  isExternalReferral?: boolean;
  additionIds?: string[] | string;
  additionAmount?: number;
  referralDoctor?: string;
  emergency?: boolean;
  appointmentDate?: string;
  appointmentTime?: string;
  branchId?: string;
  status: string;
  notes?: string;
  createdAt: string;
  studyId?: string;
}

export const STATUS_META: Record<string, { label: string; color: string }> = {
  SCHEDULED: {
    label: "radiology.appointmentStatus.SCHEDULED",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  CHECKED_IN: {
    label: "radiology.appointmentStatus.CHECKED_IN",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  DONE: {
    label: "radiology.appointmentStatus.DONE",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  CANCELLED: {
    label: "radiology.appointmentStatus.CANCELLED",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
};

export const STATUS_CHAIN: Record<string, string> = {
  SCHEDULED: "CHECKED_IN",
  CHECKED_IN: "DONE",
  DONE: "",
  CANCELLED: "",
};

export const PAY_METHODS = ["CASH", "CARD", "BANK", "VODAFONE_CASH"] as const;

export interface ScheduleForm {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientGender: string;
  patientAge: string;
  nationalId: string;
  nationalIdImage?: string;
  insuranceNumber: string;
  patientFlags: string[];
  examTypeIds: string[];
  insuranceCompanyId: string;
  additionIds: string[];
  deviceId: string;
  payerType: string;
  referralSourceId: string;
  externalPartnerId: string;
  paymentDestination: string;
  referringPhysicianId: string;
  referralDoctor: string;
  emergency: boolean;
  marketingRepId: string;
  marketingRepName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: string;
}

export const todayKey = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const emptyForm = (): ScheduleForm => ({
  patientId: "",
  patientName: "",
  patientPhone: "",
  patientGender: "",
  patientAge: "",
  nationalId: "",
  nationalIdImage: "",
  insuranceNumber: "",
  patientFlags: [],
  examTypeIds: [],
  insuranceCompanyId: "",
  additionIds: [],
  deviceId: "",
  payerType: "CUSTOMER",
  referralSourceId: "",
  externalPartnerId: "",
  paymentDestination: "ME",
  referringPhysicianId: "",
  referralDoctor: "",
  emergency: false,
  marketingRepId: "",
  marketingRepName: "",
  appointmentDate: todayKey(),
  appointmentTime: "",
  status: "SCHEDULED",
  notes: "",
});

export const MANAGER_ROLES: string[] = [
  "SUPER_ADMIN",
  "COMPANY_ADMIN",
  "OWNER",
  "MANAGER",
];

export interface SortConfig {
  key: string;
  dir: "asc" | "desc";
}
