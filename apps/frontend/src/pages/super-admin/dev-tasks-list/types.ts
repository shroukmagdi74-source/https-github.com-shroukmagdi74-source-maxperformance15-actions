export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  component: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  reporterName: string;
  projectId: string | null;
  projectName: string | null;
  projectColor: string | null;
  releaseId: string | null;
  releaseVersion: string | null;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  subtasksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DevTasksFilters {
  search: string;
  status: string;
  priority: string;
  type: string;
  projectId: string;
  assigneeId: string;
  component: string;
  releaseId: string;
  dueDateFrom: string;
  dueDateTo: string;
  tags: string;
  dateType: string;
}

export interface ConfirmModalState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface DevTasksStats {
  overview?: {
    totalTasks?: number;
    overdueTasks?: number;
    activeProjects?: number;
  };
  tasksByStatus?: {
    IN_PROGRESS?: number;
    DONE?: number;
    [key: string]: number | undefined;
  };
}

export interface ProjectOption {
  id: string;
  name: string;
  color?: string | null;
}

export interface TeamMemberOption {
  id: string;
  userId?: string;
  name: string;
  role?: string;
}

export interface ReleaseOption {
  id: string;
  name: string;
  version: string;
}
