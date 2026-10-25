import { RewardFormData } from "./types";

export const REWARD_CATEGORIES: Record<string, string> = {
  ATTENDANCE: "حضور وانضباط",
  PERFORMANCE: "أداء متميز",
  ACHIEVEMENT: "إنجاز",
  SEASONAL: "موسمية",
  TEAM_BASED: "فريق",
  COMPANY_WIDE: "عامة",
  TARGET_ACHIEVEMENT: "تحقيق تارجت",
  TARGET_EXCEED: "تجاوز تارجت",
  PUNCTUALITY: "التزام بالمواعيد",
  NO_ABSENCE: "عدم غياب",
  QUALITY: "جودة العمل",
  EMPLOYEE_OF_MONTH: "موظف الشهر",
  INITIATIVE: "مبادرة مميزة",
  PROJECT_SUCCESS: "مشروع ناجح",
  SALES: "مبيعات",
  ADMINISTRATIVE: "مكافأة إدارية",
  OTHER: "أخرى",
};

export const CALCULATION_METHODS: Record<string, string> = {
  FIXED_AMOUNT: "مبلغ ثابت",
  PERCENTAGE_SALARY: "نسبة من الراتب",
  PERCENTAGE_SALES: "نسبة من المبيعات",
  PERCENTAGE_PROJECT_PROFIT: "نسبة من أرباح المشروع",
  POINTS: "نقاط",
  NON_MONETARY: "عينية",
};

export const getCategoryLabel = (category: string): string =>
  REWARD_CATEGORIES[category] || category;

export const getMethodLabel = (method: string): string =>
  CALCULATION_METHODS[method] || method;

export const createInitialRewardFormData = (): RewardFormData => ({
  userId: "",
  rewardTypeId: "",
  calculatedValue: "",
  periodStart: "",
  periodEnd: "",
  appliedMonth: (new Date().getMonth() + 1).toString(),
  appliedYear: new Date().getFullYear().toString(),
  reason: "",
  rewardName: "",
  rewardCategory: "OTHER",
});

export const validateRewardForm = (
  formData: RewardFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.userId) {
    errors.userId = "يجب اختيار الموظف";
  }

  if (!formData.rewardTypeId) {
    errors.rewardTypeId = "يجب اختيار نوع المكافأة";
  } else if (formData.rewardTypeId === "custom" && !formData.rewardName) {
    errors.rewardName = "يجب إدخال اسم المكافأة المخصصة";
  }

  if (
    !formData.calculatedValue ||
    parseFloat(formData.calculatedValue) <= 0
  ) {
    errors.calculatedValue = "يجب إدخال قيمة صحيحة للمكافأة";
  }

  if (!formData.periodStart) {
    errors.periodStart = "يجب تحديد تاريخ بداية الفترة";
  }

  if (!formData.periodEnd) {
    errors.periodEnd = "يجب تحديد تاريخ نهاية الفترة";
  }

  if (formData.periodStart && formData.periodEnd) {
    if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      errors.periodEnd = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    }
  }

  if (
    !formData.appliedMonth ||
    parseInt(formData.appliedMonth, 10) < 1 ||
    parseInt(formData.appliedMonth, 10) > 12
  ) {
    errors.appliedMonth = "يجب إدخال شهر صحيح (1-12)";
  }

  if (!formData.appliedYear || parseInt(formData.appliedYear, 10) < 2020) {
    errors.appliedYear = "يجب إدخال سنة صحيحة";
  }

  return errors;
};
