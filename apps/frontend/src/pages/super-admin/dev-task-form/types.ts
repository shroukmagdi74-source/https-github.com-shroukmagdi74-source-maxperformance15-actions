import { Attachment } from '../../../types/tasks';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Release {
  id: string;
  version: string;
  name: string;
}

export interface RelatedLink {
  title: string;
  url: string;
}

export interface DevTaskFormData {
  title: string;
  description: string;
  businessValue: string;
  acceptanceCriteria: string;
  type: string;
  priority: string;
  status: string;
  component: string;
  assigneeId: string;
  projectId: string;
  releaseId: string;
  dueDate: string;
  startDate: string;
  estimatedHours: string;
  tags: string;
  gitBranch: string;
  companyId: string;
  ticketId: string;
  campaignId: string;
  targetAudience: string;
  budgetAllocation: string;
  expectedROI: string;
  relatedLinks: RelatedLink[];
}

export const COMPONENT_OPTIONS = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'ui', label: 'UI/UX' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'devops', label: 'DevOps' },
  { value: 'testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'general', label: 'General' },
];
