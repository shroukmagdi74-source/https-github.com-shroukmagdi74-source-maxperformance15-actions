export interface PromotionFormData {
  employeeId: string;
  fromPositionId?: string;
  fromPositionName?: string;
  toPositionId: string;
  toPositionName?: string;
  fromSalary?: number;
  toSalary?: number;
  promotionDate: string;
  effectiveDate: string;
  reason: string;
  notes?: string;
}

export interface PromotionEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  avatar?: string;
  baseSalary?: number | string;
  position?: {
    id: string;
    title: string;
  };
}

export interface SalaryIncreaseStats {
  diff: number;
  percent: number;
}
