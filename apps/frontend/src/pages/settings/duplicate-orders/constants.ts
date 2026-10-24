import type {
  DuplicateActionOption,
  DuplicateCriteriaOption,
  DuplicateOrderSettingsData,
  StatusOption,
  TimeWindowPreset,
} from './types';

export const DEFAULT_SETTINGS: DuplicateOrderSettingsData = {
  enabled: true,
  criteria: 'phone',
  activeStatuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PREPARING', 'SHIPPED', 'ON_HOLD'],
  windowEnabled: false,
  windowMinutes: 60,
  action: 'record_visible',
  alertTeam: true,
  includeStoreOrders: true,
  reportTreatment: 'separate',
  exemptPhones: [],
};

export const AVAILABLE_STATUS_OPTIONS: StatusOption[] = [
  { code: 'PENDING', label: 'قيد الانتظار', dot: 'bg-amber-500' },
  { code: 'CONFIRMED', label: 'مؤكد', dot: 'bg-blue-500' },
  { code: 'PROCESSING', label: 'قيد التنفيذ', dot: 'bg-purple-500' },
  { code: 'PREPARING', label: 'قيد التجهيز', dot: 'bg-indigo-500' },
  { code: 'SHIPPED', label: 'تم الشحن', dot: 'bg-cyan-500' },
  { code: 'ON_HOLD', label: 'معلق', dot: 'bg-orange-500' },
];

export const TIME_WINDOW_PRESETS: TimeWindowPreset[] = [
  { minutes: 60, label: 'ساعة' },
  { minutes: 360, label: '6 ساعات' },
  { minutes: 1440, label: '24 ساعة' },
  { minutes: 4320, label: '3 أيام' },
  { minutes: 10080, label: '7 أيام' },
];

export const CRITERIA_OPTIONS: DuplicateCriteriaOption[] = [
  {
    id: 'phone',
    title: 'رقم الموبايل (افتراضي)',
    desc: 'أي طلب من نفس الرقم يُعتبر مكرر إذا كان له طلب سابق لا يزال جاريًا',
  },
  {
    id: 'phone_amount',
    title: 'موبايل + نفس المبلغ',
    desc: 'نفس رقم الهاتف وتطابق إجمالي الطلب بالجنيه',
  },
  {
    id: 'phone_items',
    title: 'موبايل + نفس المنتجات',
    desc: 'نفس رقم الهاتف وتطابق نفس الأصناف والكميات',
  },
];

export const ACTION_OPTIONS: DuplicateActionOption[] = [
  {
    id: 'record_visible',
    title: 'يسجّل ويبان للفريق (افتراضي)',
    desc: 'يُنشأ الطلب بحالة «طلب مكرر» ويظهر في قائمة الطلبات مع شارة تمييز واضحة للفريق',
  },
  {
    id: 'record_hidden',
    title: 'يسجّل ومخفي',
    desc: 'يُنشأ الطلب بحالة «طلب مكرر» ويُخفى من القائمة الافتراضية للطلبات (يمكن الوصول إليه عبر فلتر الحالة)',
  },
  {
    id: 'block',
    title: 'مايتسجلش خالص',
    desc: 'يتم حظر تسجيل الطلب تمامًا ولا يُحفظ في قاعدة البيانات',
  },
];
