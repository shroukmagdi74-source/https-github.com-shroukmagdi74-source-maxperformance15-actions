export interface StatusItem {
  value: string;
  label: string;
  color: string;
}

export interface PermissionRule {
  // Task Permissions
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canArchive: boolean;
  // Project & Reports
  canViewReports: boolean;
  canManageProjects: boolean;
  canExport: boolean;
  // Settings Access
  canAccessSettings: boolean;
  canManageTaskSettings: boolean;
  // Users & Admin
  canViewAll: boolean;
  // View Scope
  viewScope: "all" | "project" | "assigned_only";
}

export interface ComponentMapping {
  [componentName: string]: string; // memberId
}

export interface LeaderboardSettings {
  baseXP: number;
  taskTypeScores: {
    [key: string]: number;
  };
  priorityScores: {
    [key: string]: number;
  };
  timeBasedScoring?: {
    enabled: boolean;
    earlyCompletionBonus: number;
    onTimeBonus: number;
    lateCompletionPenalty: number;
    maxBonusPercent: number;
    maxPenaltyPercent: number;
  };
}

export interface TaskDetailsVisibility {
  showDescription: boolean;
  showRelatedLinks: boolean;
  showChecklists: boolean;
  showBusinessValue: boolean;
  showAcceptanceCriteria: boolean;
  showAttachments: boolean;
  showCreatedAt: boolean;
}

export interface AutomationRule {
  threshold: number;
  unit: "hours" | "days";
  scope: "all" | string;
  action: "assign";
  targetId: string;
}

export interface AutomationSettings {
  rules: AutomationRule[];
}

export interface SettingsData {
  taskStatuses: StatusItem[];
  taskPriorities: StatusItem[];
  permissions: Record<string, PermissionRule>;
  componentMappings: ComponentMapping;
  autoTestingSubtask?: boolean;
  autoTestingAssigneeId?: string | null;
  leaderboardSettings?: LeaderboardSettings;
  taskDetailsVisibility?: TaskDetailsVisibility;
  automationSettings?: AutomationSettings;
  timezone?: string;
}

export interface DevTeamMember {
  id: string;
  name: string;
  role: string;
}

export const DEFAULT_STATUS_COLOR = "#cbd5e1";

export const isValidHexColor = (value?: string | null): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

export const getSafeHexColor = (value?: string | null): string =>
  isValidHexColor(value) ? value : DEFAULT_STATUS_COLOR;

export const sanitizeStatusItems = (items?: StatusItem[]): StatusItem[] =>
  Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        color: getSafeHexColor(item.color),
      }))
    : [];

export const TENANT_EXCLUDED_ROLES = [
  "OWNER",
  "AGENT",
  "Agent",
  "COMPANY_ADMIN",
];

export type DevTaskSettingsTab =
  | "general"
  | "permissions"
  | "automation"
  | "leaderboard"
  | "visibility";
