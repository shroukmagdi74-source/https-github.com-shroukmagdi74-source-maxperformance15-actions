import { RadiologyReport, RadiologyStudy, RadiologyStudyImage } from "../shared";

export interface StudyDetailsAppointment {
  id: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  notes?: string;
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  referringPhysicianId?: string;
}

export interface StudyDetailsPayment {
  id: string;
  amount: number;
  method?: string;
  note?: string;
  paidBy?: string;
  createdAt: string;
}

export interface StudyDetailsShiftPayment {
  id?: string;
  shiftId?: string;
  amount: number;
  method?: string;
  note?: string;
  createdAt: string;
}

export interface StudyDetailsHistoryEntry {
  id: string;
  dimension: string;
  status: string;
  oldStatus?: string;
  changedBy?: string;
  userName?: string;
  reason?: string;
  createdAt: string;
}

export interface StudyDetailsInsuranceInvoice {
  id: string;
  invoiceNumber?: string;
  insuranceCompanyName?: string;
  total: number;
  paidAmount: number;
  remaining: number;
  paymentStatus?: string;
}

export interface StudyDetailsTotals {
  total: number;
  paidAmount: number;
  remaining: number;
  paymentStatus?: string;
  billingType?: string;
}

export interface StudyDetailsData {
  study: RadiologyStudy;
  appointment?: StudyDetailsAppointment | null;
  images: RadiologyStudyImage[];
  report?: RadiologyReport | null;
  payments: StudyDetailsPayment[];
  shiftPayments: StudyDetailsShiftPayment[];
  statusHistory: StudyDetailsHistoryEntry[];
  insuranceInvoice?: StudyDetailsInsuranceInvoice | null;
  totals: StudyDetailsTotals;
}

export const HISTORY_DIMENSION_META: Record<string, { label: string; color: string }> = {
  ORDER: {
    label: "radiology.historyDimension.ORDER",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  PREP: {
    label: "radiology.historyDimension.PREP",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  REPORT: {
    label: "radiology.historyDimension.REPORT",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  PAYMENT: {
    label: "radiology.historyDimension.PAYMENT",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

export const PAY_METHODS = ["CASH", "CARD", "BANK", "VODAFONE_CASH"] as const;
