export interface Department {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  parentId: string | null;
  managerId: string | null;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  } | null;
  parent: {
    id: string;
    name: string;
  } | null;
  _count: {
    users: number;
    positions: number;
    children: number;
  };
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  hasEmployeeRecord?: boolean;
  department?: {
    id: string;
    name: string;
  } | null;
  departmentId?: string | null;
  position?: {
    title: string;
  } | null;
}

export interface DepartmentFormData {
  name: string;
  nameEn: string;
  description: string;
  color: string;
  parentId: string;
  managerId: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ColorOption {
  value: string;
  label: string;
}

export const colorOptions: ColorOption[] = [
  { value: "#3B82F6", label: "أزرق" },
  { value: "#10B981", label: "أخضر" },
  { value: "#F59E0B", label: "برتقالي" },
  { value: "#EF4444", label: "أحمر" },
  { value: "#8B5CF6", label: "بنفسجي" },
  { value: "#EC4899", label: "وردي" },
  { value: "#06B6D4", label: "سماوي" },
  { value: "#84CC16", label: "ليموني" },
  { value: "#F97316", label: "برتقالي غامق" },
  { value: "#6366F1", label: "نيلي" },
  { value: "#14B8A6", label: "تركوازي" },
  { value: "#FACC15", label: "أصفر" },
  { value: "#475569", label: "رمادي" },
];
