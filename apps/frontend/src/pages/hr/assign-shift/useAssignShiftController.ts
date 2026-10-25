import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import { Shift, Employee, Assignment } from "./types";
import { getDateRange } from "./helpers";

export function useAssignShiftController() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shift, setShift] = useState<Shift | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<Assignment[]>(
    [],
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [assignmentDate, setAssignmentDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [dateRangeMode, setDateRangeMode] = useState(false);

  const fetchExistingAssignments = useCallback(
    async (date: string) => {
      if (!id) return;
      try {
        const response = await api.get(`/hr/shifts/${id}`);
        const assignments =
          response.data?.shift?.assignments?.filter(
            (a: Assignment) => a.date?.split("T")[0] === date,
          ) || [];
        setExistingAssignments(assignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    },
    [id],
  );

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [shiftRes, employeesRes] = await Promise.all([
        api.get(`/hr/shifts/${id}`),
        api.get("/hr/employees?limit=1000&status=ACTIVE"),
      ]);

      setShift(shiftRes.data?.shift || null);
      setEmployees(employeesRes.data?.employees || []);

      if (assignmentDate) {
        fetchExistingAssignments(assignmentDate);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      tToast.error("AssignShift.failed_fetch_3c57");
    } finally {
      setLoading(false);
    }
  }, [id, assignmentDate, fetchExistingAssignments]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  useEffect(() => {
    if (assignmentDate && id) {
      fetchExistingAssignments(assignmentDate);
    }
  }, [assignmentDate, id, fetchExistingAssignments]);

  const handleAssign = useCallback(async () => {
    if (selectedEmployeeIds.length === 0 || !assignmentDate) {
      tToast.error("AssignShift.msg_59ee");
      return;
    }

    // Check for duplicate assignments
    const alreadyAssigned = selectedEmployeeIds.filter((empId) =>
      existingAssignments.some((a) => a.user?.id === empId),
    );

    if (alreadyAssigned.length > 0 && !dateRangeMode) {
      const employee = employees.find((e) => e.id === alreadyAssigned[0]);
      toast.error(
        `الموظف ${employee?.firstName} ${employee?.lastName} معيّن بالفعل في هذا التاريخ`,
      );
      return;
    }

    try {
      setSubmitting(true);

      if (dateRangeMode && endDate) {
        const dates = getDateRange(assignmentDate, endDate);
        const promises = selectedEmployeeIds.flatMap((userId) =>
          dates.map((date) =>
            api.post("/hr/shifts/assign", {
              shiftId: id,
              userId,
              date,
            }),
          ),
        );
        await Promise.all(promises);
        toast.success(
          `تم تعيين ${selectedEmployeeIds.length} موظف لـ ${dates.length} يوم`,
        );
      } else {
        const promises = selectedEmployeeIds.map((userId) =>
          api.post("/hr/shifts/assign", {
            shiftId: id,
            userId,
            date: assignmentDate,
          }),
        );
        await Promise.all(promises);
        toast.success(`تم تعيين ${selectedEmployeeIds.length} موظف بنجاح`);
      }

      navigate(`/hr/shifts/${id}`);
    } catch (error: any) {
      console.error("Error assigning shift:", error);
      toast.error(error.response?.data?.error || "فشل في تعيين المناوبة");
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedEmployeeIds,
    assignmentDate,
    existingAssignments,
    dateRangeMode,
    employees,
    endDate,
    id,
    navigate,
  ]);

  const toggleEmployeeSelection = useCallback((empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId)
        ? prev.filter((i) => i !== empId)
        : [...prev, empId],
    );
  }, []);

  const departments = useMemo(() => {
    const depts = new Set(
      employees.map((e) => e.department?.name).filter(Boolean),
    );
    return Array.from(depts);
  }, [employees]);

  const positions = useMemo(() => {
    const pos = new Set(
      employees.map((e) => e.position?.title).filter(Boolean),
    );
    return Array.from(pos);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        `${emp.firstName} ${emp.lastName} ${emp.employeeNumber || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || emp.department?.name === departmentFilter;
      const matchesPosition =
        positionFilter === "all" || emp.position?.title === positionFilter;

      const isAlreadyAssigned = existingAssignments.some(
        (a) => a.user && a.user.id === emp.id,
      );

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        !isAlreadyAssigned
      );
    });
  }, [
    employees,
    searchTerm,
    departmentFilter,
    positionFilter,
    existingAssignments,
  ]);

  const assignedEmployeeNames = useMemo(() => {
    return existingAssignments
      .filter((a) => a.user)
      .map((a) => `${a.user.firstName} ${a.user.lastName}`)
      .join("، ");
  }, [existingAssignments]);

  const handleNavigateBack = useCallback(() => {
    navigate(`/hr/shifts/${id}`);
  }, [navigate, id]);

  return {
    id,
    shift,
    employees,
    existingAssignments,
    selectedEmployeeIds,
    assignmentDate,
    setAssignmentDate,
    setExistingAssignments,
    endDate,
    setEndDate,
    loading,
    submitting,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    positionFilter,
    setPositionFilter,
    dateRangeMode,
    setDateRangeMode,
    departments,
    positions,
    filteredEmployees,
    assignedEmployeeNames,
    handleAssign,
    toggleEmployeeSelection,
    handleNavigateBack,
    refetchData: fetchData,
  };
}
