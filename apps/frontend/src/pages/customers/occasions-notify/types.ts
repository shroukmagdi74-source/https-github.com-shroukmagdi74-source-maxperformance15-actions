export type OccasionAudience = 'all' | 'withOrders' | 'newCustomers' | 'activeCustomers';

export interface Occasion {
  id: string;
  name: string;
  message: string;
  mediaUrl: string | null;
  scheduledAt: string;
  recurrence: 'none' | 'monthly' | 'yearly';
  customerListIds: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  lastSentAt: string | null;
  totalSent: number;
  sendLimit: number;
  templateId?: string | null;
  templateName?: string | null;
  metaTemplateName?: string | null;
  metaTemplateStatus?: string | null;
}

export interface OccasionSession {
  sessionId: string;
  phoneNumber: string;
  isConnected: boolean;
}

export interface OccasionFormData {
  id: string;
  name: string;
  message: string;
  mediaUrl: string;
  scheduledAt: string;
  recurrence: Occasion['recurrence'];
  sendLimit: number;
  templateId: string;
}

export const RECURRENCE_LABEL: Record<string, string> = {
  none: 'مرة واحدة',
  monthly: 'شهري',
  yearly: 'سنوي',
};

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'مجدولة', cls: 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400' },
  draft: { label: 'مسودة', cls: 'border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400' },
  sent: { label: 'أُرسلت', cls: 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' },
  cancelled: { label: 'موقوفة', cls: 'border-destructive/40 text-destructive' },
};

export const emptyOccasionForm: OccasionFormData = {
  id: '',
  name: '',
  message: '',
  mediaUrl: '',
  scheduledAt: '',
  recurrence: 'none',
  sendLimit: 0,
  templateId: '',
};
