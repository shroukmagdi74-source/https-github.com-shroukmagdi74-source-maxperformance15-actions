export interface Session {
  id: string;
  name?: string;
  phoneNumber?: string;
  provider?: string;
  metaDisplayPhoneNumber?: string;
}

export interface MetaTemplate {
  name: string;
  status: string;
  category: string;
  language: string;
  components?: Array<{
    type: string;
    format?: string;
    text?: string;
    example?: any;
    buttons?: any[];
  }>;
}

export interface CustomerList {
  id: string;
  name: string;
  description: string;
  count: number;
  isDefault?: boolean;
  criteria?: any;
  isStale?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadCategory {
  id: string;
  name: string;
  color: string | null;
  contactCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount?: number;
  failedCount: number;
  targetAudience: string;
  waTemplateName?: string;
  waLanguageCode?: string;
  failureReason?: string | null;
  sentAt?: string;
  createdAt: string;
}

export interface BroadcastResult {
  scheduled?: boolean;
  scheduledAt?: string;
  sentCount?: number;
  sent?: number;
  failedCount?: number;
  failed?: number;
  errors?: Array<{ error: string; recipient?: { to?: string; phone?: string } }>;
}

export function listCriteriaText(criteria: any): string {
  if (!criteria) return 'جميع العملاء النشطين';
  const c =
    typeof criteria === 'string'
      ? (() => {
          try {
            return JSON.parse(criteria);
          } catch {
            return {};
          }
        })()
      : criteria;
  const type = c.type || 'all';
  switch (type) {
    case 'active':
      return `نشط خلال آخر ${c.hours ?? 24} ساعة`;
    case 'inactive':
      return `غير نشط منذ ${c.days ?? 7} يوم`;
    case 'tag':
      return `يحمل وسم: ${c.tag}`;
    case 'orderStatus':
      return `طلبات بحالة "${c.status}" خلال ${c.days} يوم`;
    case 'returnRequest':
      return `مرتجعات بحالة "${c.status || 'الكل'}" خلال ${c.days} يوم`;
    case 'paymentStatus':
      return `دفع بحالة "${c.status}" خلال ${c.days} يوم`;
    case 'city':
      return `من مدينة: ${c.city}`;
    case 'customerRating':
      return `التقييم: ${c.rating}`;
    case 'latest':
      return `أحدث ${c.limit ?? 100} عميل`;
    case 'oldest':
      return `أقدم ${c.limit ?? 100} عميل`;
    case 'minTotalSpent':
      return `إجمالي إنفاق ≥ ${c.amount}`;
    case 'minOrdersCount':
      return `عدد طلبات ≥ ${c.count}`;
    case 'preset':
      return `قالب: ${c.preset}`;
    default:
      return 'جميع العملاء النشطين';
  }
}

export function formatListDate(date: string | undefined): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString('ar-EG');
  } catch {
    return '—';
  }
}
