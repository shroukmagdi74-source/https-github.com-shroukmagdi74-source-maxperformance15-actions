export interface RewardRecord {
  id: string;
  rewardName: string;
  rewardCategory: string;
  calculatedValue: number;
  status: string;
  isIncludedInPayroll?: boolean;
  isLocked?: boolean;
  appliedMonth: number;
  appliedYear: number;
  periodStart: string;
  periodEnd: string;
  reason?: string;
  voidedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    departmentRelation?: { name: string };
  };
  rewardType: {
    name: string;
    nameAr?: string;
    category: string;
  };
}

export interface RewardListStatistics {
  total: number;
  totalValue: number;
  byStatus: Array<{ status: string; count: number; value: number }>;
  byCategory: Array<{ category: string; count: number; value: number }>;
}

export interface RewardListFilters {
  search: string;
  status: string;
  category: string;
  month: string;
  year: string;
  userId: string;
  rewardTypeId: string;
}

export interface RewardListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
