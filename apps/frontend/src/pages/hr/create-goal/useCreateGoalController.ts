import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import {
  AssignmentDraft,
  DepartmentOption,
  EmployeeOption,
  GoalDetails,
  GoalFormState,
  ParentGoalOption,
  ProjectOption,
  TaskOption,
} from "./types";
import {
  buildGoalPayload,
  createEmptyAssignment,
  createInitialFormState,
  ensureArray,
  getHydrationErrorMessage,
  mapGoalDetailsToFormState,
  toInputDate,
  toNumber,
  validateGoalForm,
} from "./helpers";

export const useCreateGoalController = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(createInitialFormState);
  const [goalDetails, setGoalDetails] = useState<GoalDetails | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [parentGoals, setParentGoals] = useState<ParentGoalOption[]>([]);
  const [taskSearch, setTaskSearch] = useState("");

  const hydratePage = useCallback(async () => {
    try {
      setFetching(true);
      setLoadError(null);

      const [
        employeesResponse,
        departmentsResponse,
        projectsResponse,
        tasksResponse,
        parentGoalsResponse,
      ] = await Promise.all([
        api.get("/hr/employees"),
        api.get("/hr/departments"),
        api.get("/projects"),
        api.get("/tasks?limit=200"),
        api.get("/tasks/goals?includeDaily=false"),
      ]);

      const employeeRows =
        employeesResponse.data?.employees ||
        employeesResponse.data?.data ||
        employeesResponse.data ||
        [];
      const departmentRows =
        departmentsResponse.data?.departments ||
        departmentsResponse.data?.data ||
        departmentsResponse.data ||
        [];
      const projectRows =
        projectsResponse.data?.data ||
        projectsResponse.data?.projects ||
        [];
      const taskRows =
        tasksResponse.data?.data ||
        tasksResponse.data?.tasks ||
        [];
      const parentGoalRows =
        parentGoalsResponse.data?.goals ||
        parentGoalsResponse.data?.data ||
        [];

      setEmployees(ensureArray<EmployeeOption>(employeeRows));
      setDepartments(ensureArray<DepartmentOption>(departmentRows));
      setProjects(ensureArray<ProjectOption>(projectRows));
      setTasks(
        ensureArray<TaskOption>(
          taskRows ||
            tasksResponse.data?.tasks ||
            tasksResponse.data?.data?.tasks ||
            tasksResponse.data?.data?.items,
        ),
      );
      setParentGoals(ensureArray<ParentGoalOption>(parentGoalRows));

      if (!isEdit) {
        setGoalDetails(null);
        setForm({
          ...createInitialFormState(),
          startDate: toInputDate(new Date().toISOString()),
          endDate: toInputDate(new Date().toISOString()),
        });
        return;
      }

      const goalResponse = await api.get(`/tasks/goals/${id}`);
      const goal = goalResponse.data?.goal as GoalDetails;

      if (!goal) {
        const errorMessage = "الهدف المطلوب غير موجود أو تم حذفه";
        setGoalDetails(null);
        setLoadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      setGoalDetails(goal);
      setForm(mapGoalDetailsToFormState(goal));
    } catch (error) {
      console.error("Error hydrating goal form:", error);
      const errorMessage = getHydrationErrorMessage(error, isEdit);
      setGoalDetails(null);
      setLoadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    void hydratePage();
  }, [hydratePage]);

  const filteredTaskOptions = useMemo(() => {
    const normalizedSearch = taskSearch.trim().toLowerCase();
    const taskOptions = ensureArray<TaskOption>(tasks);

    return taskOptions.filter((task) => {
      if (
        form.projectId &&
        (task as { projectId?: string }).projectId !== form.projectId
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return task.title.toLowerCase().includes(normalizedSearch);
    });
  }, [form.projectId, taskSearch, tasks]);

  const availableParentGoals = useMemo(
    () =>
      parentGoals.filter(
        (goal) =>
          goal.goalType !== "DAILY" &&
          goal.id !== id &&
          (!form.projectId ||
            goal.goalType !== "PROJECT" ||
            goal.projectId === form.projectId),
      ),
    [form.projectId, id, parentGoals],
  );

  const assignmentTargetTotal = useMemo(
    () =>
      form.assignments.reduce(
        (sum, assignment) => sum + toNumber(assignment.targetValue || "0"),
        0,
      ),
    [form.assignments],
  );

  const targetValueNumber = useMemo(
    () => toNumber(form.targetValue || "0"),
    [form.targetValue],
  );

  const assignmentCoverage = targetValueNumber
    ? Math.min(100, (assignmentTargetTotal / targetValueNumber) * 100)
    : 0;

  const linkedTasks = useMemo(
    () =>
      ensureArray<TaskOption>(tasks).filter((task) =>
        form.linkedTaskIds.includes(task.id),
      ),
    [form.linkedTaskIds, tasks],
  );

  const setField = <K extends keyof GoalFormState>(
    key: K,
    value: GoalFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateAssignment = (
    index: number,
    key: keyof AssignmentDraft,
    value: string | boolean,
  ) => {
    setForm((previous) => ({
      ...previous,
      assignments: previous.assignments.map((assignment, assignmentIndex) =>
        assignmentIndex === index
          ? { ...assignment, [key]: value }
          : assignment,
      ),
    }));
  };

  const addAssignment = () => {
    setForm((previous) => ({
      ...previous,
      assignments: [...previous.assignments, createEmptyAssignment()],
    }));
  };

  const removeAssignment = (index: number) => {
    setForm((previous) => ({
      ...previous,
      assignments:
        previous.assignments.length === 1
          ? [createEmptyAssignment()]
          : previous.assignments.filter(
              (_, assignmentIndex) => assignmentIndex !== index,
            ),
    }));
  };

  const toggleTaskLink = (taskId: string) => {
    setForm((previous) => ({
      ...previous,
      linkedTaskIds: previous.linkedTaskIds.includes(taskId)
        ? previous.linkedTaskIds.filter((idValue) => idValue !== taskId)
        : [...previous.linkedTaskIds, taskId],
    }));
  };

  const handleSubmit = async () => {
    if (!validateGoalForm(form)) {
      return;
    }

    try {
      setLoading(true);
      const payload = buildGoalPayload(form);

      if (isEdit) {
        await api.put(`/tasks/goals/${id}`, payload);
        tToast.success("createGoal.success_update_d398");
      } else {
        await api.post("/tasks/goals", payload);
        tToast.success("createGoal.success_create_c282");
      }

      navigate("/goals");
    } catch (error) {
      console.error("Error saving goal:", error);
      tToast.error("createGoal.unable_save_6d4d");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) {
      return;
    }

    if (!window.confirm("هل تريد حذف هذا الهدف وكل الأبناء المرتبطين به؟")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/tasks/goals/${id}`);
      tToast.success("createGoal.success_delete_377b");
      navigate("/goals");
    } catch (error) {
      console.error("Error deleting goal:", error);
      tToast.error("createGoal.unable_delete_f427");
    } finally {
      setLoading(false);
    }
  };

  return {
    id,
    isEdit,
    loading,
    fetching,
    loadError,
    form,
    goalDetails,
    employees,
    departments,
    projects,
    tasks,
    parentGoals,
    taskSearch,
    setTaskSearch,
    filteredTaskOptions,
    availableParentGoals,
    assignmentTargetTotal,
    targetValueNumber,
    assignmentCoverage,
    linkedTasks,
    setField,
    updateAssignment,
    addAssignment,
    removeAssignment,
    toggleTaskLink,
    handleSubmit,
    handleDelete,
    navigate,
  };
};
