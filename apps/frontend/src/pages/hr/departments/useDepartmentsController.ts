import { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { useAuth } from "../../../hooks/useAuthSimple";
import { Department, Employee, DepartmentFormData } from "./types";
import {
  validateDepartmentData,
  filterAndSortDepartments,
  filterEmployeesByQuery,
} from "./helpers";

export const useDepartmentsController = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Check if user has permission to manage departments
  const canManage = Boolean(
    user &&
    ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "OWNER"].includes(user.role),
  );

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isAddingEmployees, setIsAddingEmployees] = useState(false);

  // Form state
  const initialFormData: DepartmentFormData = {
    name: "",
    nameEn: "",
    description: "",
    color: "#3B82F6",
    parentId: "none",
    managerId: "none",
    isActive: true,
    sortOrder: 0,
  };
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormData);

  const [viewMode, setViewMode] = useState<"grid" | "hierarchy">("grid");

  // Selection states
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assignEmployeesSelection, setAssignEmployeesSelection] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAssigningEmployees, setIsAssigningEmployees] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/departments?includeInactive=true");
      setDepartments(response.data.departments || []);
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "حدث خطأ أثناء جلب الأقسام";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/hr/employees?limit=1000");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Filter and search logic
  const filteredDepartments = filterAndSortDepartments(
    departments,
    searchQuery,
    filterStatus,
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const filteredEmployees = filterEmployeesByQuery(employees, employeeSearchQuery);

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  };

  const resetEmployeeSelection = () => {
    setSelectedEmployees([]);
  };

  const fillFormFromDepartment = (dept: Department) => {
    setFormData({
      name: dept.name,
      nameEn: dept.nameEn || "",
      description: dept.description || "",
      color: dept.color || "#3B82F6",
      parentId: dept.parentId || "none",
      managerId: dept.managerId || "none",
      isActive: dept.isActive,
      sortOrder: dept.sortOrder || 0,
    });
  };

  const toggleAssignEmployeeSelection = (employeeId: string) => {
    setAssignEmployeesSelection((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  };

  const resetAssignEmployeeSelection = () => {
    setAssignEmployeesSelection([]);
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleAddDepartment = async () => {
    if (!canManage) {
      tToast.error("departments.msg_956a");
      return;
    }

    const validationErrors = validateDepartmentData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    if (selectedEmployees.length === 0) {
      try {
        const submitData = {
          ...formData,
          parentId: formData.parentId === "none" ? null : formData.parentId || null,
          managerId: formData.managerId === "none" ? null : formData.managerId || null,
        };
        await api.post("/hr/departments", submitData);
        tToast.success("departments.success_add_cd5f");
        setShowAddDialog(false);
        resetForm();
        fetchDepartments();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "حدث خطأ أثناء إضافة القسم";
        toast.error(errorMessage);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const deptData = {
        ...formData,
        parentId: formData.parentId === "none" ? null : formData.parentId || null,
        managerId: formData.managerId === "none" ? null : formData.managerId || null,
      };

      const deptResponse = await api.post("/hr/departments", deptData);
      const newDepartmentId = deptResponse.data.department.id;

      const assignPromises = selectedEmployees.map((empId) =>
        api.put(`/hr/employees/${empId}`, { departmentId: newDepartmentId }),
      );

      await Promise.all(assignPromises);

      toast.success(
        `تم إنشاء القسم وإضافة ${selectedEmployees.length} موظف بنجاح`,
      );

      setShowAddDialog(false);
      resetForm();
      resetEmployeeSelection();
      fetchDepartments();
      fetchEmployees();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
        "حدث خطأ أثناء إنشاء القسم وإضافة الموظفين",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;

    if (!canManage) {
      tToast.error("departments.msg_b6d5");
      return;
    }

    const validationErrors = validateDepartmentData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      const submitData = {
        ...formData,
        parentId: formData.parentId === "none" ? null : formData.parentId || null,
        managerId: formData.managerId === "none" ? null : formData.managerId || null,
      };
      await api.put(`/hr/departments/${selectedDepartment.id}`, submitData);
      tToast.success("departments.success_update_530d");
      const manager = submitData.managerId
        ? employees.find((e) => e.id === submitData.managerId)
        : null;
      const parent = submitData.parentId
        ? departments.find((d) => d.id === submitData.parentId)
        : null;
      setSelectedDepartment((prev) =>
        prev
          ? {
            ...prev,
            name: submitData.name,
            nameEn: submitData.nameEn || null,
            description: submitData.description || null,
            color: submitData.color,
            parentId: submitData.parentId,
            managerId: submitData.managerId,
            isActive: submitData.isActive,
            sortOrder: submitData.sortOrder || 0,
            parent: parent ? { id: parent.id, name: parent.name } : null,
            manager: manager
              ? {
                id: manager.id,
                firstName: manager.firstName,
                lastName: manager.lastName,
                avatar: manager.avatar || "",
              }
              : null,
          }
          : prev,
      );
      setIsEditingDetails(false);
      fetchDepartments();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء تحديث القسم");
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    if (!canManage) {
      tToast.error("departments.msg_6286");
      return;
    }

    try {
      await api.delete(`/hr/departments/${selectedDepartment.id}`);
      tToast.success("departments.success_delete_a80e");
      setShowDeleteDialog(false);
      setSelectedDepartment(null);
      fetchDepartments();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء حذف القسم");
    }
  };

  const openEditDialog = (dept: Department) => {
    setSelectedDepartment(dept);
    fillFormFromDepartment(dept);
    setShowDetailsDialog(true);
    setIsEditingDetails(true);
    setIsAddingEmployees(false);
    resetAssignEmployeeSelection();
  };

  const handleAssignEmployees = async () => {
    if (!selectedDepartment) return;

    if (!canManage) {
      tToast.error("departments.msg_c841");
      return;
    }

    if (assignEmployeesSelection.length === 0) {
      tToast.error("departments.msg_bca4");
      return;
    }

    setIsAssigningEmployees(true);
    try {
      const assignPromises = assignEmployeesSelection.map((empId) =>
        api.put(`/hr/employees/${empId}`, {
          departmentId: selectedDepartment.id,
        }),
      );
      await Promise.all(assignPromises);
      toast.success(`تم إضافة ${assignEmployeesSelection.length} موظف للقسم`);
      setIsAddingEmployees(false);
      resetAssignEmployeeSelection();
      fetchDepartments();
      fetchEmployees();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "حدث خطأ أثناء إضافة الموظفين للقسم",
      );
    } finally {
      setIsAssigningEmployees(false);
    }
  };

  const handleRemoveFromDepartment = (employeeId: string) => {
    if (!canManage) {
      tToast.error("departments.msg_7409");
      return;
    }

    setEmployeeToRemove(employeeId);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveFromDepartment = async () => {
    if (!employeeToRemove) return;

    try {
      await api.put(`/hr/employees/${employeeToRemove}`, {
        departmentId: null,
      });
      tToast.success("departments.msg_0e11");
      setShowRemoveConfirm(false);
      setEmployeeToRemove(null);
      fetchDepartments();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء إزالة الموظف");
    }
  };

  const openDetailsDialog = (dept: Department) => {
    setSelectedDepartment(dept);
    fillFormFromDepartment(dept);
    setShowDetailsDialog(true);
    setIsEditingDetails(false);
    setIsAddingEmployees(false);
    resetAssignEmployeeSelection();
  };

  const totalEmployees = departments.reduce(
    (sum, d) => sum + (d._count?.users || 0),
    0,
  );

  return {
    departments,
    employees,
    filteredEmployees,
    filteredDepartments,
    paginatedDepartments,
    loading,
    canManage,
    totalEmployees,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalPages,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    formData,
    setFormData,
    selectedEmployees,
    toggleEmployeeSelection,
    resetEmployeeSelection,
    assignEmployeesSelection,
    toggleAssignEmployeeSelection,
    resetAssignEmployeeSelection,
    selectedDepartment,
    setSelectedDepartment,
    showAddDialog,
    setShowAddDialog,
    showDetailsDialog,
    setShowDetailsDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    showRemoveConfirm,
    setShowRemoveConfirm,
    isEditingDetails,
    setIsEditingDetails,
    isAddingEmployees,
    setIsAddingEmployees,
    isProcessing,
    isAssigningEmployees,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleAssignEmployees,
    handleRemoveFromDepartment,
    confirmRemoveFromDepartment,
    openEditDialog,
    openDetailsDialog,
    resetForm,
    fillFormFromDepartment,
  };
};
