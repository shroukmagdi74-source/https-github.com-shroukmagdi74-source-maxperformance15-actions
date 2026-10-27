import { Product } from '../../storefront/hooks/useProducts';

export type DemoProduct = Product & {
  badge?: string;
  eta?: string;
};

export type OrderSummary = {
  orderId: string;
  customerName: string;
  total: number;
  eta: string;
  itemCount: number;
};

export type DemoCartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type RestaurantCheckoutForm = {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  eta: string;
};

export const DISPLAY_FONT = {
  fontFamily: "'Teko', 'Cairo', sans-serif",
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const CATEGORY_LABELS: Record<string, string> = {
  All: 'الكل',
  Combos: 'الكومبوهات',
  Burgers: 'البرجر',
  Sides: 'الإضافات',
  Drinks: 'المشروبات',
  Desserts: 'الحلو',
  'Chef Picks': 'اختيارات الشيف',
};

export const categoryName = (name?: string | null) => {
  const value = name?.trim();
  if (!value) return 'اختيارات الشيف';
  return CATEGORY_LABELS[value] || value;
};

export const PRODUCT_NAME_OVERRIDES: Record<string, string> = {
  'rush-combo': 'راش كومبو',
  firebird: 'فايربيرد تشيكن',
  'volcano-fries': 'فولكانو فرايز',
  'citrus-fizz': 'سيتروس فيز',
  'cookie-bomb': 'كوكي بومب',
  'family-rush': 'فاميلي راش ميل',
};

export const productDisplayName = (product: Pick<Product, 'id' | 'slug' | 'name'>) =>
  PRODUCT_NAME_OVERRIDES[product.slug || product.id] || product.name;

export const fallbackProducts: DemoProduct[] = [
  {
    id: 'rush-combo',
    slug: 'rush-combo',
    name: 'راش كومبو',
    description: 'دابل سماش برجر مع فرايز وكولا في كومبو سريع ومشبع من أول ضغطة.',
    price: 235,
    comparePrice: 275,
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'combos', name: 'الكومبوهات' },
    badge: 'أفضل عرض',
    eta: '18-22 دقيقة',
  },
  {
    id: 'firebird',
    slug: 'firebird',
    name: 'فايربيرد تشيكن',
    description: 'دجاج كرسبي بصوص مدخن ومخلل وآيولي ثوم بطعم قوي لآخر اليوم.',
    price: 185,
    comparePrice: 210,
    images: ['https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'burgers', name: 'البرجر' },
    badge: 'الأكثر طلبًا',
    eta: '20-25 دقيقة',
  },
  {
    id: 'volcano-fries',
    slug: 'volcano-fries',
    name: 'فولكانو فرايز',
    description: 'فرايز محمّلة بجبنة وجلابينو وبصل مقرمش تكمل أي طلب صح.',
    price: 95,
    comparePrice: 115,
    images: ['https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'sides', name: 'الإضافات' },
    badge: 'إضافة جامدة',
    eta: '10-12 دقيقة',
  },
  {
    id: 'citrus-fizz',
    slug: 'citrus-fizz',
    name: 'سيتروس فيز',
    description: 'مشروب لايم منعش بالنعناع يوازن الطلب ويكمل الكومبو.',
    price: 55,
    images: ['https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'drinks', name: 'المشروبات' },
    badge: 'منعش',
    eta: '6-8 دقائق',
  },
  {
    id: 'cookie-bomb',
    slug: 'cookie-bomb',
    name: 'كوكي بومب',
    description: 'كوكي دافئة مع فانيلا وكراميل لنهاية حلوة بعد الوجبة.',
    price: 88,
    images: ['https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'desserts', name: 'الحلو' },
    badge: 'تحلية',
    eta: '8-10 دقائق',
  },
  {
    id: 'family-rush',
    slug: 'family-rush',
    name: 'فاميلي راش ميل',
    description: 'أربع ساندوتشات مع فرايز ومشروبات تكفي الشلة في طلب واحد.',
    price: 540,
    comparePrice: 610,
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'],
    category: { id: 'combos', name: 'الكومبوهات' },
    badge: 'توصيل مجاني',
    eta: '30-35 دقيقة',
  },
];

export const lanes = [
  {
    title: 'مسار الكومبوهات',
    description: 'وجبات جاهزة تشبع بسرعة وتخلّي القرار أسهل من أول ثانية.',
    category: 'الكومبوهات',
    accent: 'bg-[#171717] text-white',
  },
  {
    title: 'مسار البرجر',
    description: 'ساندوتشات BiteRush الأساسية بطعم قوي ولمسة نار واضحة.',
    category: 'البرجر',
    accent: 'bg-[#ff6b2c] text-white',
  },
  {
    title: 'مسار الإضافات',
    description: 'فرايز ومشروبات وحلو تكمل الطلب من غير ما تثقله.',
    category: 'الإضافات',
    accent: 'bg-white text-[#171717]',
  },
];

export const zones = [
  { name: 'مدينة نصر', eta: '18-22 دقيقة' },
  { name: 'القاهرة الجديدة', eta: '25-30 دقيقة' },
  { name: 'الشيخ زايد', eta: '28-34 دقيقة' },
];

export const heroStats = [
  ['سرعة التوصيل', '18-22 دقيقة'],
  ['متوسط الطلب', '245 ج.م+'],
  ['الدفع', 'كاش أو أونلاين'],
] as const;

export const emptyForm: RestaurantCheckoutForm = {
  name: '',
  phone: '',
  address: '',
  paymentMethod: 'الدفع عند الاستلام',
  eta: '20-30 دقيقة',
};

export const toDemoProduct = (product: Product): DemoProduct => ({
  ...product,
  name: productDisplayName(product),
  description:
    product.description || 'وجبة جاهزة بطابع BiteRush السريع والسخن.',
  images: product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80'],
  category: product.category || {
    id: categoryName(product.category?.name).toLowerCase().replace(/\s+/g, '-'),
    name: categoryName(product.category?.name),
  },
  badge:
    typeof product.comparePrice === 'number' && product.comparePrice > product.price
      ? 'عرض مباشر'
      : 'اختيار سريع',
  eta: '20-30 دقيقة',
});
