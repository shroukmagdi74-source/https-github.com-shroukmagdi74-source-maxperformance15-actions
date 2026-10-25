export interface AdvanceInstallment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
}

export interface AdvanceEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  avatar: string;
  department: { name: string } | null;
  position: { title: string } | null;
}

export interface AdvanceRequest {
  id: string;
  amount: number;
  reason: string;
  requestDate: string;
  createdAt: string;
  status: string;
  repaymentType: string;
  installmentsCount: number;
  monthlyAmount: number;
  approvedAt: string | null;
  remainingBalance?: number;
  isPaidOff?: boolean;
  employee: AdvanceEmployee;
  installments: AdvanceInstallment[];
}

export interface AdvancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdvanceStats {
  total: number;
  pending: number;
  approved: number;
  totalAmount: number;
}

export type PayStatusFilter = "all" | "paid" | "unpaid";
