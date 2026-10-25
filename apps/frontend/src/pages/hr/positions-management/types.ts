export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  code?: string;
  level: number;
  departmentId?: string;
  minSalary?: number;
  maxSalary?: number;
  department?: Department;
  _count?: {
    users: number;
  };
}

export interface PositionFormData {
  title: string;
  description?: string;
  code?: string;
  level: number;
  departmentId?: string;
  minSalary?: number;
  maxSalary?: number;
}
