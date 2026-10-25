import {
  RewardTypeEligibilityConditions,
  RewardTypeFormData,
  RewardTypeRecord,
} from "./types";

export const REWARD_TYPE_CATEGORIES = [
  "PERFORMANCE",
  "TARGET_ACHIEVEMENT",
  "TARGET_EXCEED",
  "PUNCTUALITY",
  "NO_ABSENCE",
  "QUALITY",
  "EMPLOYEE_OF_MONTH",
  "INITIATIVE",
  "PROJECT_SUCCESS",
  "SALES",
  "ADMINISTRATIVE",
  "SEASONAL",
  "ACHIEVEMENT",
] as const;

export const REWARD_TYPE_CALCULATION_METHODS = [
  "FIXED_AMOUNT",
  "PERCENTAGE_SALARY",
  "PERCENTAGE_SALES",
  "PERCENTAGE_PROJECT_PROFIT",
  "POINTS",
] as const;

export const PERCENTAGE_CALCULATION_METHODS = [
  "PERCENTAGE_SALARY",
  "PERCENTAGE_SALES",
  "PERCENTAGE_PROJECT_PROFIT",
];

export const createDefaultEligibilityConditions =
  (): RewardTypeEligibilityConditions => ({
    minTargetProgress: 0,
    maxLatenessCount: 0,
    maxAbsenceCount: 0,
    maxErrorRate: 0,
    minProjectScore: 0,
    minSalesAmount: 0,
    requiresManagerNomination: false,
    requiresHRApproval: false,
  });

export const createInitialRewardTypeForm = (): RewardTypeFormData => ({
  name: "",
  category: "PERFORMANCE",
  calculationMethod: "FIXED_AMOUNT",
  value: 0,
  triggerType: "SEMI_AUTOMATIC",
  eligibilityConditions: createDefaultEligibilityConditions(),
});

export const mapRewardTypeToFormData = (
  type: RewardTypeRecord,
): RewardTypeFormData => ({
  name: type.name,
  category: type.category,
  calculationMethod: type.calculationMethod,
  value: type.value,
  triggerType: type.triggerType,
  eligibilityConditions: {
    ...createDefaultEligibilityConditions(),
    ...(type.eligibilityConditions || {}),
  },
});
