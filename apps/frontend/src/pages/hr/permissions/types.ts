export type PermissionType =
  | "DEDUCTIBLE"
  | "NON_DEDUCTIBLE"
  | "FIXED_HOURS"
  | "COMPENSATORY";

export type PermissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PermissionEmployee {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  employeeNumber: string;
  department: { name: string } | null;
}

export interface PermissionApprover {
  id: string;
  firstName: string;
  lastName: string;
}

export interface PermissionRequest {
  id: string;
  type: PermissionType;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: PermissionStatus;
  reason: string;
  details?: string;
  notes?: string;
  isUrgent: boolean;
  isCompensated: boolean;
  compensationDate?: string;
  compensationNotes?: string;
  createdAt: string;
  attachments?: string;
  employee: PermissionEmployee;
  approvedBy?: PermissionApprover | null;
  rejectionReason?: string;
}

export interface PermissionFormData {
  employeeId: string;
  type: PermissionType;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  details: string;
  isUrgent: boolean;
  isCompensated: boolean;
  compensationDate: string;
  compensationNotes: string;
  attachments: string;
}

export interface PermissionStats {
  pendingCount?: number;
  totalHours?: number;
  byType?: {
    DEDUCTIBLE?: number;
    NON_DEDUCTIBLE?: number;
    FIXED_HOURS?: number;
    COMPENSATORY?: number;
  };
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
