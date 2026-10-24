export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "triggered" | "completed" | "dismissed";
  companyId: string;
  userId: string;
  customerId?: string;
  scheduledTime: string;
  createdAt: string;
  snoozeCount: number;
  maxSnooze: number;
  canSnooze: boolean;
  metadata?: any;
}

export interface ReminderStats {
  active?: {
    total?: number;
    overdue?: number;
  };
  completed?: {
    thisWeek?: number;
    total?: number;
  };
  performance?: {
    completionRate?: number;
    averageSnoozeCount?: number;
    onTimeCompletion?: number;
  };
  trends?: Array<{
    period: string;
    created: number;
    completed: number;
    overdue: number;
  }>;
}

export interface ReminderFormState {
  title: string;
  description: string;
  type: string;
  priority: string;
  customerId: string;
  scheduledTime: string;
}

export const INITIAL_REMINDER_FORM: ReminderFormState = {
  title: "",
  description: "",
  type: "FOLLOW_UP",
  priority: "medium",
  customerId: "",
  scheduledTime: "",
};

export const isOverdue = (scheduledTime: string): boolean => {
  return new Date(scheduledTime) < new Date();
};

export const formatReminderTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const overdueMins = Math.abs(diffMins);
    if (overdueMins < 60) return `متأخر ${overdueMins} دقيقة`;
    if (overdueMins < 1440) return `متأخر ${Math.floor(overdueMins / 60)} ساعة`;
    return `متأخر ${Math.floor(overdueMins / 1440)} يوم`;
  }

  if (diffMins < 60) return `خلال ${diffMins} دقيقة`;
  if (diffHours < 24) return `خلال ${diffHours} ساعة`;
  return `خلال ${diffDays} يوم`;
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "text-destructive bg-destructive/10 border-destructive/20";
    case "medium":
      return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "low":
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};
