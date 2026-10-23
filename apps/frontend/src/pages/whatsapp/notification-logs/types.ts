export interface LogEntry {
  id: string;
  status: string;
  messageType: string;
  sessionId?: string | null;
  recipientPhone: string;
  recipientName?: string | null;
  eventType: string;
  category: string;
  content?: string | null;
  failureReason?: string | null;
  errorCode?: string | null;
  whatsappMessageId?: string | null;
  createdAt: string;
  templateName?: string | null;
  metaTemplateName?: string | null;
  templateChannel?: string | null;
  orderNumber?: string | null;
  orderTotal?: string | null;
  sessionName?: string | null;
  sessionPhone?: string | null;
  sessionProvider?: string | null;
}

export const STATUS_STYLES: Record<string, string> = {
  SENT: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400',
  DELIVERED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400',
  READ: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-400',
  FAILED:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400',
  PENDING:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400',
  CANCELLED:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400',
};

export const MESSAGE_TYPE_STYLES: Record<string, string> = {
  TEMPLATE:
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-400',
  BUTTONS:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/20 dark:text-violet-400',
  TEXT: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400',
  LIST: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  QUEUED: 'في الطابور',
  SENDING: 'جاري الإرسال',
  SENT: 'تم الإرسال',
  DELIVERED: 'تم التسليم',
  READ: 'تمت القراءة',
  FAILED: 'فشل',
  CANCELLED: 'ملغي',
};

export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  TEMPLATE: 'قالب ميتا',
  BUTTONS: 'أزرار',
  TEXT: 'نص حر',
  LIST: 'قائمة',
};

export const EVENT_LABELS: Record<string, string> = {
  ORDER_CREATED: 'طلب جديد',
  ORDER_CONFIRMED: 'تأكيد الطلب',
  ORDER_PROCESSING: 'قيد التنفيذ',
  ORDER_SHIPPED: 'تم الشحن',
  ORDER_DELIVERED: 'تم التسليم',
  ORDER_CANCELLED: 'إلغاء الطلب',
  ORDER_RETURNED: 'تم الإرجاع',
  PAYMENT_REMINDER: 'تذكير بالدفع',
  ABANDONED_CART: 'سلة متروكة',
  WELCOME_MESSAGE: 'رسالة ترحيب',
};

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
