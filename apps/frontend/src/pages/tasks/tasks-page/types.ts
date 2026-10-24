import type { TaskPageTab, TaskDraft } from "../types";

export const TASK_PAGE_ROUTES: Record<TaskPageTab, string> = {
  tasks: "/tasks",
  compliance: "/tasks/compliance",
  backlog: "/tasks/backlog",
  projects: "/tasks/projects",
  categories: "/tasks/categories",
  integrations: "/tasks/integrations",
  settings: "/tasks/settings",
};

export const getTaskPageTabFromPathname = (pathname: string): TaskPageTab => {
  if (pathname === TASK_PAGE_ROUTES.compliance) {
    return "compliance";
  }
  if (pathname === TASK_PAGE_ROUTES.backlog) {
    return "backlog";
  }
  if (pathname === TASK_PAGE_ROUTES.projects) {
    return "projects";
  }
  if (pathname === TASK_PAGE_ROUTES.categories) {
    return "categories";
  }
  if (pathname === TASK_PAGE_ROUTES.integrations) {
    return "integrations";
  }
  if (pathname === TASK_PAGE_ROUTES.settings) {
    return "settings";
  }
  return "tasks";
};

export const ensureArray = <T,>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

export const normalizeTaskStatus = (status: string | null | undefined): string =>
  String(status || "").toLowerCase();

export const createInitialTaskDraft = (
  userId: string,
  userName: string,
): TaskDraft => ({
  projectId: "",
  categoryId: "",
  goalId: "",
  title: "",
  description: "",
  priority: "medium",
  type: "manual",
  assignedTo: userId,
  assignedToName: userName,
  createdBy: userId,
  createdByName: userName,
  dueDate: "",
  startDate: "",
  estimatedHours: 0,
  measurementType: "TIME",
  metricUnit: "",
  metricTargetValue: null,
  metricCurrentValue: 0,
  tags: [],
  aiDescription: "",
  pageUrl: "",
});

export interface TasksProps {
  embeddedInModal?: boolean;
}
