import { RewardUiStatus } from "../rewardRecordUtils";
import { RewardListFilters } from "./types";

export const REWARD_STATUS_BADGE_CONFIG: Record<
  RewardUiStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "قيد الانتظار",
    className: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: {
    label: "معتمد",
    className: "bg-green-100 text-green-800",
  },
  APPLIED: {
    label: "مطبق",
    className: "bg-blue-100 text-blue-800",
  },
  REJECTED: {
    label: "مرفوض",
    className: "bg-red-100 text-red-800",
  },
  VOIDED: {
    label: "ملغي",
    className: "bg-gray-100 text-gray-800",
  },
};

export const REWARD_CATEGORY_BADGE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ATTENDANCE: {
    label: "حضور وانضباط",
    className: "bg-blue-100 text-blue-800",
  },
  PERFORMANCE: {
    label: "أداء متميز",
    className: "bg-purple-100 text-purple-800",
  },
  ACHIEVEMENT: {
    label: "إنجاز",
    className: "bg-green-100 text-green-800",
  },
  SEASONAL: {
    label: "موسمية",
    className: "bg-orange-100 text-orange-800",
  },
  TEAM_BASED: {
    label: "فريق",
    className: "bg-indigo-100 text-indigo-800",
  },
  COMPANY_WIDE: { label: "عامة", className: "bg-pink-100 text-pink-800" },
  TARGET_ACHIEVEMENT: {
    label: "تحقيق تارجت",
    className: "bg-emerald-100 text-emerald-800",
  },
  TARGET_EXCEED: {
    label: "تجاوز تارجت",
    className: "bg-cyan-100 text-cyan-800",
  },
  PUNCTUALITY: {
    label: "التزام بالمواعيد",
    className: "bg-sky-100 text-sky-800",
  },
  NO_ABSENCE: {
    label: "عدم غياب",
    className: "bg-teal-100 text-teal-800",
  },
  QUALITY: {
    label: "جودة العمل",
    className: "bg-violet-100 text-violet-800",
  },
  EMPLOYEE_OF_MONTH: {
    label: "موظف الشهر",
    className: "bg-amber-100 text-amber-800",
  },
  INITIATIVE: {
    label: "مبادرة مميزة",
    className: "bg-rose-100 text-rose-800",
  },
  PROJECT_SUCCESS: {
    label: "مشروع ناجح",
    className: "bg-lime-100 text-lime-800",
  },
  SALES: { label: "مبيعات", className: "bg-blue-100 text-blue-800" },
  ADMINISTRATIVE: {
    label: "مكافأة إدارية",
    className: "bg-slate-100 text-slate-800",
  },
  OTHER: { label: "أخرى", className: "bg-gray-100 text-gray-800" },
};

export const getRewardCategoryBadgeConfig = (category: string) =>
  REWARD_CATEGORY_BADGE_CONFIG[category] || REWARD_CATEGORY_BADGE_CONFIG.OTHER;

export const createDefaultRewardFilters = (): RewardListFilters => ({
  search: "",
  status: "",
  category: "",
  month: "",
  year: new Date().getFullYear().toString(),
  userId: "",
  rewardTypeId: "",
});
