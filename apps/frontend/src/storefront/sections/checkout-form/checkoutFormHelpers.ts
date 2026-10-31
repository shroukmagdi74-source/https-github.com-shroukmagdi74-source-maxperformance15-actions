import type { CheckoutFormVariant, GovernorateOption } from './checkoutFormTypes';

export const fieldIds = {
  customerName: 'checkout-customer-name',
  email: 'checkout-email',
  phone: 'checkout-phone',
  address: 'checkout-address',
  city: 'checkout-city',
  governorate: 'checkout-governorate',
  notes: 'checkout-notes',
} as const;

export const normalizeVariant = (value: unknown): CheckoutFormVariant => {
  if (typeof value !== 'string') {
    return 'standard';
  }

  const normalizedValue = value.trim().toLowerCase();
  if (
    normalizedValue === 'split' ||
    normalizedValue === 'compact' ||
    normalizedValue === 'standard' ||
    normalizedValue === 'market-checkout' ||
    normalizedValue === 'nature-checkout' ||
    normalizedValue === 'safe-adventure' ||
    normalizedValue === 'soft-flow' ||
    normalizedValue === 'command-checkout' ||
    normalizedValue === 'fitting-room-checkout'
  ) {
    return normalizedValue;
  }

  return 'standard';
};

export const getStepWrapperClassName = (variant: CheckoutFormVariant) => {
  switch (variant) {
    case 'split':
      return 'space-y-4 rounded-[1.5rem] border border-border bg-card p-5';
    case 'compact':
      return 'space-y-3 rounded-[1rem] border border-border bg-card p-4';
    case 'market-checkout':
      return 'space-y-4 rounded-[1.8rem] border border-[#f0d4b0] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ec_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(154,93,34,0.14)]';
    case 'nature-checkout':
      return 'space-y-4 rounded-[1.8rem] border border-[#dbe3d4] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8f2_100%)] p-5 shadow-[0_22px_70px_-56px_rgba(26,51,40,0.16)]';
    case 'command-checkout':
      return 'space-y-4 rounded-[1.8rem] border border-[#ead8b1] bg-white/96 p-5 shadow-[0_22px_70px_-56px_rgba(90,62,24,0.16)]';
    case 'soft-flow':
      return 'space-y-4 rounded-[1.7rem] border border-[#ead9d8] bg-[linear-gradient(180deg,#ffffff_0%,#fff9f7_100%)] p-5 shadow-[0_20px_70px_-58px_rgba(107,33,49,0.16)]';
    case 'fitting-room-checkout':
      return 'space-y-4 rounded-[1.45rem] border border-[#efe5dd] bg-white p-4 shadow-[0_18px_54px_-42px_rgba(42,38,35,0.16)]';
    case 'safe-adventure':
      return 'relative space-y-6 rounded-[3rem] border-8 border-white bg-white/60 p-8 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60';
    default:
      return 'space-y-4';
  }
};

export const parseListSetting = (value: unknown, fallback: string[]) => {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/,|\n/)
      : fallback;

  return items.map((item) => String(item).trim()).filter(Boolean);
};

export const parseBooleanSetting = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true') {
      return true;
    }
    if (normalizedValue === 'false') {
      return false;
    }
  }

  return fallback;
};

export const normalizeArabic = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

export const governorates: GovernorateOption[] = [
  { value: 'Cairo', label: 'القاهرة' },
  { value: 'Giza', label: 'الجيزة' },
  { value: 'Alexandria', label: 'الإسكندرية' },
  { value: 'Dakahlia', label: 'الدقهلية' },
  { value: 'Red Sea', label: 'البحر الأحمر' },
  { value: 'Beheira', label: 'البحيرة' },
  { value: 'Fayoum', label: 'الفيوم' },
  { value: 'Gharbiya', label: 'الغربية' },
  { value: 'Ismailia', label: 'الإسماعيلية' },
  { value: 'Menofia', label: 'المنوفية' },
  { value: 'Minya', label: 'المنيا' },
  { value: 'Qaliubiya', label: 'القليوبية' },
  { value: 'New Valley', label: 'الوادي الجديد' },
  { value: 'Suez', label: 'السويس' },
  { value: 'Aswan', label: 'أسوان' },
  { value: 'Assiut', label: 'أسيوط' },
  { value: 'Beni Suef', label: 'بني سويف' },
  { value: 'Port Said', label: 'بورسعيد' },
  { value: 'Damietta', label: 'دمياط' },
  { value: 'Sharqia', label: 'الشرقية' },
  { value: 'South Sinai', label: 'جنوب سيناء' },
  { value: 'Kafr El Sheikh', label: 'كفر الشيخ' },
  { value: 'Matrouh', label: 'مطروح' },
  { value: 'Luxor', label: 'الأقصر' },
  { value: 'Qena', label: 'قنا' },
  { value: 'North Sinai', label: 'شمال سيناء' },
  { value: 'Sohag', label: 'سوهاج' },
];

export const governorateAliases: Record<string, string[]> = {
  Cairo: ['cairo', 'القاهرة', 'مدينة نصر', 'nasr city', 'new cairo'],
  Giza: ['giza', 'الجيزة', '6 october', 'october', 'الشيخ زايد', 'sheikh zayed'],
  Alexandria: ['alexandria', 'الإسكندرية', 'الاسكندرية', 'alex'],
  Dakahlia: ['dakahlia', 'الدقهلية', 'mansoura', 'المنصورة'],
  'Red Sea': ['red sea', 'البحر الأحمر', 'الغردقة', 'hurghada'],
  Beheira: ['beheira', 'البحيرة', 'دمنهور', 'damanhur'],
  Fayoum: ['fayoum', 'الفيوم'],
  Gharbiya: ['gharbiya', 'الغربية', 'طنطا', 'tanta'],
  Ismailia: ['ismailia', 'الإسماعيلية', 'الاسماعيلية'],
  Menofia: ['menofia', 'المنوفية', 'شبين الكوم', 'shebin el kom'],
  Minya: ['minya', 'المنيا'],
  Qaliubiya: ['qaliubiya', 'القليوبية', 'بنها', 'banha', 'شبرا الخيمة'],
  'New Valley': ['new valley', 'الوادي الجديد', 'الخارجة', 'kharga'],
  Suez: ['suez', 'السويس'],
  Aswan: ['aswan', 'أسوان', 'اسوان'],
  Assiut: ['assiut', 'أسيوط', 'اسيوط'],
  'Beni Suef': ['beni suef', 'بني سويف'],
  'Port Said': ['port said', 'بورسعيد'],
  Damietta: ['damietta', 'دمياط'],
  Sharqia: ['sharqia', 'الشرقية', 'الزقازيق', 'zagazig'],
  'South Sinai': ['south sinai', 'جنوب سيناء', 'شرم الشيخ', 'sharm'],
  'Kafr El Sheikh': ['kafr el sheikh', 'كفر الشيخ'],
  Matrouh: ['matrouh', 'مطروح', 'مرسى مطروح'],
  Luxor: ['luxor', 'الأقصر', 'الاقصر'],
  Qena: ['qena', 'قنا'],
  'North Sinai': ['north sinai', 'شمال سيناء', 'العريش', 'arish'],
  Sohag: ['sohag', 'سوهاج'],
};
