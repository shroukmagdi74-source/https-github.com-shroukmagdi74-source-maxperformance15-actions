export interface RewardEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  departmentRelation?: { name: string };
}

export interface RewardTypeEligibilityConditions {
  minTargetProgress?: number;
  maxLatenessCount?: number;
  maxAbsenceCount?: number;
  maxErrorRate?: number;
  requiresManagerNomination?: boolean;
  requiresHRApproval?: boolean;
  [key: string]: any;
}

export interface RewardType {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  calculationMethod: string;
  value: number;
  eligibilityConditions: RewardTypeEligibilityConditions | null;
}

export interface RewardFormData {
  userId: string;
  rewardTypeId: string;
  calculatedValue: string;
  periodStart: string;
  periodEnd: string;
  appliedMonth: string;
  appliedYear: string;
  reason: string;
  rewardName: string;
  rewardCategory: string;
}
