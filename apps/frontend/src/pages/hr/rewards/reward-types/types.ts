export interface RewardTypeEligibilityConditions {
  minTargetProgress: number;
  maxLatenessCount: number;
  maxAbsenceCount: number;
  maxErrorRate: number;
  minProjectScore: number;
  minSalesAmount: number;
  requiresManagerNomination: boolean;
  requiresHRApproval: boolean;
}

export interface RewardTypeRecord {
  id: string;
  name: string;
  category: string;
  calculationMethod: string;
  value: number;
  isActive: boolean;
  triggerType: string;
  eligibilityConditions: RewardTypeEligibilityConditions | any;
}

export interface RewardTypeFormData {
  name: string;
  category: string;
  calculationMethod: string;
  value: number;
  triggerType: string;
  eligibilityConditions: RewardTypeEligibilityConditions;
}
