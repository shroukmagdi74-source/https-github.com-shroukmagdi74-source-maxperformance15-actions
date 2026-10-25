export type PromotionFormData = {
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
  status: string;
};

export interface SalaryIncreaseStats {
  diff: number;
  percent: number;
}
