export interface RewardDetailsRecord {
  id: string;
  rewardName: string;
  rewardCategory: string;
  calculatedValue: number;
  calculationDetails?: string;
  status: string;
  appliedMonth: number;
  appliedYear: number;
  periodStart: string;
  periodEnd: string;
  reason?: string;
  eligibilityMet?: string;
  isIncludedInPayroll: boolean;
  isLocked: boolean;
  approvedBy?: string;
  approvedAt?: string;
  appliedAt?: string;
  voidedBy?: string;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeNumber: string;
    phone?: string;
    departmentRelation?: { name: string };
    positionRelation?: { title: string };
  };
  rewardType?: {
    id: string;
    name: string;
    nameAr?: string;
    description?: string;
    category: string;
    calculationMethod: string;
    value: number;
    frequency: string;
    triggerType: string;
  } | null;
}
