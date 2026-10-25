export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count?: {
    shiftAssignments: number;
  };
}

export interface ShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  color: string;
  sortOrder: number;
}

export type ViewMode = "grid" | "table";
export type StatusFilter = "all" | "active" | "inactive";
export type SortBy = "name" | "startTime" | "employees" | "custom";

export interface ShiftStats {
  total: number;
  active: number;
  inactive: number;
  totalAssignments: number;
}
