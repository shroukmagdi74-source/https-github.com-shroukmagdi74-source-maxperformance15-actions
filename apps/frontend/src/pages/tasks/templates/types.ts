export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  type: string;
  estimatedHours: number;
  tags: string[];
  projectId: string | null;
  projectName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  usageCount: number;
}

export interface Project {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface NewTemplatePayload {
  name: string;
  description: string;
  taskTitle: string;
  taskDescription: string;
  priority: string;
  type: string;
  estimatedHours: number;
  tags: string[];
  projectId: string;
  categoryId: string;
}
