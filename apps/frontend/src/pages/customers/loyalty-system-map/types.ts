import React from "react";
import {
  ShoppingBag,
  Coins,
  Award,
  Target,
} from "lucide-react";

export type NodeStatus = "active" | "inactive" | "warning" | "unknown";

export interface MapNode {
  id: string;
  label: string;
  route: string;
  icon: React.ElementType;
  status: NodeStatus;
  summary: string;
  chips?: string[];
}

export interface StageDef {
  id: string;
  label: string;
  icon: React.ElementType;
  nodeIds: string[];
}

export interface EdgeDef {
  from: string;
  to: string;
  label: string;
  loop?: boolean;
}

export interface DrawnEdge {
  id: string;
  d: string;
  color: string;
  marker: string;
  label: string;
  lx: number;
  ly: number;
  loop?: boolean;
}

export interface RoutingInfo {
  key: "meta" | "wa" | "unknown";
  label: string;
  desc: string;
}

export interface ReEngagementLine {
  id: string;
  trigger: string;
  tool: string;
  route: string;
  message: string;
  source: RoutingInfo;
  status: "scheduled" | "sent" | "failed" | "inactive" | "unknown";
  count: number | null;
  enabled: boolean;
  settingsKey?: "occasion" | "inactive" | "points";
  trend?: { up: boolean; text: string; goodWhenUp: boolean };
}

export interface CustomerRow {
  name: string;
  phone: string;
  extra: string;
}

export interface CustomerListState {
  id: string;
  title: string;
  loading: boolean;
  rows: CustomerRow[];
}

export type DateRangeKey = "today" | "7d" | "30d" | "all";

export interface TimelineEvent {
  label: string;
  date?: string;
  route?: string;
}

export interface TimelineStage {
  id: string;
  label: string;
  icon: React.ElementType;
  dateLabel: string;
  date: string | null;
  note?: string;
  events: TimelineEvent[];
}

export interface NodeDetail {
  count: string;
  lastActivity: string;
  route: string;
}

export const STAGES: StageDef[] = [
  {
    id: "entry",
    label: "الاشتراك والطلب",
    icon: ShoppingBag,
    nodeIds: ["customers"],
  },
  {
    id: "collect",
    label: "جمع النقاط والولاء",
    icon: Coins,
    nodeIds: ["postPurchase", "loyaltyPrograms", "loyaltyMembers", "pointsCenter"],
  },
  {
    id: "redeem",
    label: "الاستبدال والكاش باك",
    icon: Award,
    nodeIds: ["analytics", "settings"],
  },
  {
    id: "reengage",
    label: "إعادة الاستهداف",
    icon: Target,
    nodeIds: [
      "segmentation",
      "customerLists",
      "whatsappNotify",
      "occasions",
      "birthdays",
      "customerNotifications",
    ],
  },
];

export const EDGES: EdgeDef[] = [
  { from: "customers", to: "postPurchase", label: "بعد كل أوردر" },
  { from: "postPurchase", to: "loyaltyPrograms", label: "أكسب نقاط" },
  { from: "loyaltyPrograms", to: "loyaltyMembers", label: "تسجيل تلقائي" },
  { from: "loyaltyMembers", to: "pointsCenter", label: "استبدال نقاط" },
  { from: "pointsCenter", to: "analytics", label: "تغذية الأرقام" },
  { from: "analytics", to: "settings", label: "توصيات وضبط" },
  { from: "settings", to: "loyaltyPrograms", label: "تفعيل / إيقاف" },
  { from: "loyaltyMembers", to: "segmentation", label: "تحديد الشرائح" },
  { from: "segmentation", to: "customerLists", label: "بناء قوائم" },
  { from: "customerLists", to: "whatsappNotify", label: "إرسال جماعي" },
  { from: "customers", to: "occasions", label: "مناسبة قريبة", loop: true },
  { from: "customers", to: "birthdays", label: "عيد ميلاد", loop: true },
  {
    from: "loyaltyMembers",
    to: "customerNotifications",
    label: "استهداف بالنقاط",
    loop: true,
  },
  {
    from: "postPurchase",
    to: "whatsappNotify",
    label: "متابعة الساكت",
    loop: true,
  },
];

export const STATUS_META: Record<
  NodeStatus,
  {
    label: string;
    border: string;
    badge: string;
    dot: string;
    iconBg: string;
    iconFg: string;
  }
> = {
  active: {
    label: "شغالة",
    border: "border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    iconFg: "text-emerald-600 dark:text-emerald-400",
  },
  inactive: {
    label: "مقفولة",
    border: "border-gray-200 dark:border-gray-600",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300",
    dot: "bg-gray-300 dark:bg-gray-500",
    iconBg: "bg-gray-100 text-gray-400 dark:bg-gray-700/60 dark:text-gray-400",
    iconFg: "text-gray-400 dark:text-gray-400",
  },
  warning: {
    label: "محتاجة مراجعة",
    border: "border-amber-400 dark:border-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-500",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    iconFg: "text-amber-600 dark:text-amber-400",
  },
  unknown: {
    label: "غير محدد",
    border: "border-blue-300 dark:border-blue-700",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-400",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    iconFg: "text-blue-600 dark:text-blue-400",
  },
};
