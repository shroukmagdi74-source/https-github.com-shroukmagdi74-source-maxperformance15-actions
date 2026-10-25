export interface Promotion {
  id: string;
  employeeId: string;
  fromPositionId?: string;
  toPositionId: string;
  fromPositionName?: string;
  toPositionName: string;
  fromSalary?: number | string;
  toSalary?: number | string;
  promotionDate: string;
  effectiveDate: string;
  reason: string;
  rejectionReason?: string;
  approvedBy?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  employee?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    avatar?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    avatar?: string;
  };
  fromPosition?: {
    id: string;
    title: string;
  } | null;
  toPosition: {
    id: string;
    title: string;
  };
}

export interface PromotionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}
