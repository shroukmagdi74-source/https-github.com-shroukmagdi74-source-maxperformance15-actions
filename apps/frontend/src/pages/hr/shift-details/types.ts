export interface ShiftAssignment {
  id: string;
  date: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber?: string;
    email?: string;
  } | null;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  isActive: boolean;
  assignments?: ShiftAssignment[];
  _count?: {
    assignments: number;
  };
}

export interface ShiftEditFormData {
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
}
