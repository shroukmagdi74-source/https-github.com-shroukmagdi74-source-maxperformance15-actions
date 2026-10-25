export interface Enrollment {
  id: string;
  startDate: string;
  endDate?: string;
  status: string;
  notes?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export interface Benefit {
  id: string;
  name: string;
  description?: string;
  type: string;
  cost?: number;
  currency: string;
  isActive: boolean;
  activeEnrollments?: number;
  enrollments?: Enrollment[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

export interface BenefitFormData {
  name: string;
  description: string;
  type: string;
  cost: number;
  currency: string;
  isActive: boolean;
}

export interface EnrollmentFormData {
  employeeId: string;
  startDate: string;
  notes: string;
}

export interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
