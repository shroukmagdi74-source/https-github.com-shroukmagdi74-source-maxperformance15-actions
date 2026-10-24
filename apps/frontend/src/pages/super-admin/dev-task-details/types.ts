export type DevTaskTab =
  | "details"
  | "subtasks"
  | "comments"
  | "activities"
  | "time"
  | "checklists"
  | "attachments";

export interface SubtaskFormData {
  title: string;
  description: string;
  department: string;
  assigneeId: string;
  type: string;
  priority: string;
}

export interface DuplicateFormData {
  newAssigneeId: string;
  includeChecklists: boolean;
  includeAttachments: boolean;
}

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export interface ConfirmModalState {
  open: boolean;
  message: string;
  onConfirm: () => void;
}

export interface EditingTimeLogState {
  id: string;
  duration: number;
  description: string;
}

export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
