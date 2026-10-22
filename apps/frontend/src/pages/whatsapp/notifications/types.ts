import type React from "react";

export interface NotificationSettings {
  id: string;
  companyId: string;
  isEnabled: boolean;
  defaultSessionId: string | null;
  stickySessionEnabled: boolean;
  orderNotificationsEnabled: boolean;
  orderCreatedEnabled: boolean;
  orderConfirmedEnabled: boolean;
  orderProcessingEnabled: boolean;
  orderShippedEnabled: boolean;
  orderDeliveredEnabled: boolean;
  orderCancelledEnabled: boolean;
  paymentReminderEnabled: boolean;
  paymentReminderHours: number;
  productNotificationsEnabled: boolean;
  backInStockEnabled: boolean;
  priceDropEnabled: boolean;
  newProductEnabled: boolean;
  abandonedCartEnabled: boolean;
  abandonedCartFirstReminder: number;
  abandonedCartSecondReminder: number;
  abandonedCartThirdReminder: number;
  abandonedCartDiscountEnabled: boolean;
  abandonedCartDiscountPercent: number;
  marketingNotificationsEnabled: boolean;
  promotionalEnabled: boolean;
  couponEnabled: boolean;
  birthdayEnabled: boolean;
  loyaltyEnabled: boolean;
  companyLifecycleNotificationsEnabled: boolean;
  newSignupWelcomeEnabled: boolean;
  newSignupAdminAlertEnabled: boolean;
  companyLifecycleAdminPhones: string | null;
  companyLifecycleAdminRoutingMode: string;
  subscriptionCreatedEnabled: boolean;
  subscriptionRenewedEnabled: boolean;
  subscriptionCancelledEnabled: boolean;
  newsletterSubscribedEnabled: boolean;
  benefitGrantedEnabled: boolean;
  hrNotificationsEnabled: boolean;
  attendanceReminderEnabled: boolean;
  attendanceConfirmedEnabled: boolean;
  checkoutConfirmedEnabled: boolean;
  leaveApprovalEnabled: boolean;
  permissionApprovalEnabled: boolean;
  manualDeductionEnabled: boolean;
  payrollEnabled: boolean;
  birthdayWishEnabled: boolean;
  warningNotificationEnabled: boolean;
  taskNotificationsEnabled: boolean;
  taskCreatedEnabled: boolean;
  taskUpdatedEnabled: boolean;
  taskStatusChangedEnabled: boolean;
  taskCommentedEnabled: boolean;
  taskAttachmentAddedEnabled: boolean;
  taskDeletedEnabled: boolean;
  taskWatcherAddedEnabled: boolean;
  taskExecutionCheckEnabled: boolean;
  taskDeadlineReminderEnabled: boolean;
  taskOverdueEnabled: boolean;
  taskSubtaskCreatedEnabled: boolean;
  taskChecklistItemCompletedEnabled: boolean;
  taskTimeEntryAddedEnabled: boolean;
  rateLimitPerMinute: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface Session {
  id: string;
  name: string;
  phoneNumber: string;
  status?: string;
}

export interface Template {
  id: string | null;
  name: string;
  category: string;
  eventType: string;
  content: string;
  isActive: boolean;
  isDefault: boolean;
  sentCount?: number;
  deliveredCount?: number;
  readCount?: number;
}

export type NoticeTone = "success" | "error" | "warning" | "info";

export type NoticeState = {
  tone: NoticeTone;
  message: string;
} | null;

export type TemplateFormState = {
  name: string;
  category: string;
  eventType: string;
  content: string;
  isActive: boolean;
};

export type TabId =
  | "general"
  | "products"
  | "marketing"
  | "company"
  | "hr"
  | "tasks"
  | "reports";

export interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface WhatsAppNotificationsProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

export const SUPER_ADMIN_EVENT_TYPES = [
  "NEW_SIGNUP_WELCOME",
  "NEW_SIGNUP_ADMIN_ALERT",
  "SUBSCRIPTION_CREATED",
  "SUBSCRIPTION_RENEWED",
  "SUBSCRIPTION_CANCELLED",
] as const;

export const SUPER_ADMIN_EVENT_TYPE_SET = new Set<string>(SUPER_ADMIN_EVENT_TYPES);
export const SUPER_ADMIN_CATEGORY_SET = new Set<string>(["CUSTOMER", "SYSTEM"]);

export const noticeStyles: Record<NoticeTone, string> = {
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  error:
    "border-destructive/20 bg-destructive/10 text-destructive",
  warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  info: "border-blue-500/20 bg-blue-500/10 text-blue-800 dark:text-blue-300",
};

export const createEmptyTemplateForm = (
  superAdminMode = false,
): TemplateFormState => ({
  name: "",
  category: superAdminMode ? "CUSTOMER" : "PRODUCTS",
  eventType: superAdminMode ? "NEW_SIGNUP_WELCOME" : "",
  content: "",
  isActive: true,
});
