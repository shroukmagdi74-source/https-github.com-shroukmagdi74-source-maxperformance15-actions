import { Department, DepartmentFormData, Employee } from "./types";

export const validateDepartmentData = (data: DepartmentFormData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("اسم القسم مطلوب");
  }

  if (data.name && data.name.length > 100) {
    errors.push("اسم القسم يجب ألا يتجاوز 100 حرف");
  }

  if (data.nameEn && data.nameEn.length > 100) {
    errors.push("الاسم الإنجليزي يجب ألا يتجاوز 100 حرف");
  }

  if (data.nameEn && !/^[a-zA-Z0-9\s]*$/.test(data.nameEn)) {
    errors.push("الاسم الإنجليزي يجب أن يحتوي على أحرف إنجليزية وأرقام فقط");
  }

  if (data.description && data.description.length > 500) {
    errors.push("الوصف يجب ألا يتجاوز 500 حرف");
  }

  return errors;
};

export const filterAndSortDepartments = (
  departments: Department[],
  searchQuery: string,
  filterStatus: "all" | "active" | "inactive",
): Department[] => {
  return departments
    .filter((dept) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && dept.isActive) ||
        (filterStatus === "inactive" && !dept.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const filterEmployeesByQuery = (
  employees: Employee[],
  searchQuery: string,
): Employee[] => {
  if (!searchQuery.trim()) return employees;
  const query = searchQuery.toLowerCase();
  return employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query),
  );
};
