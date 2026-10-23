import type { LucideIcon } from "lucide-react";

export interface FlowStep {
  id?: string;
  flowId?: string;
  delayDays: number;
  delayHours?: number;
  delayUnit: string;
  content: string;
  mediaUrl?: string;
  stepOrder: number;
}

export interface Flow {
  id: string;
  companyId: string;
  name: string;
  isEnabled: boolean;
  isGeneral: boolean;
  _count: {
    steps: number;
    journeys: number;
    categories: number;
  };
  steps?: FlowStep[];
  categories?: {
    id: string;
    name: string;
    color: string | null;
  }[];
}

export interface LeadCategory {
  id: string;
  name: string;
  color: string;
  autoFollowUp: boolean;
  triggerFlowId?: string;
  autoPromoteCategoryId?: string;
}

export interface Journey {
  id: string;
  companyId: string;
  customerId: string;
  flowId: string;
  status: string;
  currentStep: number;
  nextSendAt: string;
  lastSentAt?: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  flow: {
    name: string;
    steps: { id: string }[];
  };
  order?: {
    orderNumber: string;
  };
}

export interface LegacyEnrollment {
  id: string;
  companyId: string;
  customerId: string;
  whatsappContactId: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  nextSendAt: string;
  lastSentAt?: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  whatsAppContact: {
    phoneNumber: string;
    name?: string;
    pushName?: string;
  };
}

export interface Stats {
  active: number;
  completed: number;
  cancelled: number;
  replied: number;
  total: number;
  totalSent: number;
  replyRate: number;
  completionRate: number;
}

export interface CategoryStatItem {
  id: string;
  name: string;
  color: string;
  totalContacts: number;
  enrolled: number;
  completed: number;
  replied: number;
  replyRate: number;
}

export interface Settings {
  isEnabled: boolean;
  businessHourStart?: number | null;
  businessHourEnd?: number | null;
  timezone?: string | null;
  steps?: Record<string, unknown>[] | null;
}

export interface StatCardItem {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone: "primary" | "info" | "success" | "warning";
}

export const TIMEZONES = [
  "UTC", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Riyadh", "Asia/Kuwait", "Asia/Qatar", "Asia/Bahrain",
  "Asia/Muscat", "Asia/Amman", "Asia/Beirut", "Asia/Jerusalem", "Asia/Tehran",
  "Asia/Karachi", "Asia/Kolkata", "Asia/Bangkok", "Asia/Shanghai", "Asia/Tokyo",
  "Australia/Sydney", "Africa/Cairo", "Africa/Casablanca", "Africa/Lagos", "Africa/Johannesburg",
] as const;

export const WA_HOURS = Array.from({ length: 24 }, (_, i) => i);

export const STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;

export const statusCfg: Record<string, { dot: string; bg: string }> = {
  ACTIVE: { dot: "bg-amber-500", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  COMPLETED: { dot: "bg-emerald-500", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  CANCELLED: { dot: "bg-rose-500", bg: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  FAILED: { dot: "bg-rose-500", bg: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

export const apiBase = "/api/v1/whatsapp/automation";
export const lfBase = "/api/v1/whatsapp/lead-followup";
