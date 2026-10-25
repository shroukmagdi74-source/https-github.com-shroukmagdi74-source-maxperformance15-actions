import {
  SpecialAdCategoryOption,
  TimezoneOption,
  BidStrategyOption,
  BuyingTypeOption,
  ConversionLocationOption,
  OptimizationGoalOption,
  PlacementOption,
  InterestOption,
  LocationOption,
  CampaignFormData,
} from "./types";

export const initialCampaignFormData: CampaignFormData = {
  name: "",
  objective: "OUTCOME_TRAFFIC",
  status: "PAUSED",
  budgetType: "DAILY",
  budgetAmount: 100,
  startDate: "",
  endDate: "",
  adAccountId: "",
  pixelId: "",
  description: "",
  specialAdCategories: [],
  budgetOptimization: false,
  spendLimit: undefined,
  timezone: "Africa/Cairo",
  buyingType: "AUCTION",
  bidStrategy: "LOWEST_COST_WITHOUT_CAP",
  conversionLocation: "WEBSITE",
  optimizationGoal: "LINK_CLICKS",
  targetingAgeMin: 18,
  targetingAgeMax: 65,
  targetingGenders: [],
  targetingLocations: ["EG"],
  targetingInterests: [],
  placementType: "AUTOMATIC",
  placements: [],
};

export const specialAdCategories: SpecialAdCategoryOption[] = [
  {
    value: "HOUSING",
    label: "إعلانات الإسكان",
    description: "إعلانات عن بيع أو تأجير الممتلكات",
  },
  {
    value: "EMPLOYMENT",
    label: "إعلانات التوظيف",
    description: "إعلانات عن فرص عمل",
  },
  {
    value: "CREDIT",
    label: "إعلانات الائتمان",
    description: "إعلانات عن القروض والتمويل",
  },
];

export const timezones: TimezoneOption[] = [
  { value: "Africa/Cairo", label: "القاهرة (GMT+2)" },
  { value: "Africa/Casablanca", label: "الدار البيضاء (GMT+1)" },
  { value: "Asia/Dubai", label: "دبي (GMT+4)" },
  { value: "Asia/Riyadh", label: "الرياض (GMT+3)" },
  { value: "Europe/London", label: "لندن (GMT+0)" },
];

export const bidStrategies: BidStrategyOption[] = [
  {
    value: "LOWEST_COST_WITHOUT_CAP",
    label: "أقل تكلفة (بدون حد)",
    description: "Facebook يحصل على أكبر عدد من النتائج بأقل تكلفة",
  },
  {
    value: "LOWEST_COST_WITH_BID_CAP",
    label: "أقل تكلفة (مع حد للمزايدة)",
    description: "تحديد أقصى مبلغ للمزايدة",
  },
  {
    value: "COST_CAP",
    label: "حد التكلفة",
    description: "تحديد متوسط التكلفة لكل نتيجة",
  },
  {
    value: "LOWEST_COST_WITH_MIN_ROAS",
    label: "أقل تكلفة مع ROAS",
    description: "تحقيق حد أدنى من العائد على الإنفاق الإعلاني",
  },
];

export const buyingTypes: BuyingTypeOption[] = [
  {
    value: "AUCTION",
    label: "مزاد (Auction)",
    description: "الطريقة الأكثر مرونة - تنافس مع معلنين آخرين",
  },
  {
    value: "RESERVED",
    label: "محجوز (Reserved)",
    description: "حجز مسبق للوصول المضمون - للحملات الكبيرة",
  },
];

export const conversionLocations: ConversionLocationOption[] = [
  {
    value: "WEBSITE",
    label: "الموقع الإلكتروني",
    description: "توجيه الزوار لموقعك",
  },
  {
    value: "APP",
    label: "التطبيق",
    description: "توجيه المستخدمين لتطبيقك",
  },
  {
    value: "MESSENGER",
    label: "Messenger",
    description: "بدء محادثات على Messenger",
  },
  {
    value: "WHATSAPP",
    label: "WhatsApp",
    description: "بدء محادثات على WhatsApp",
  },
  {
    value: "INSTAGRAM",
    label: "Instagram Direct",
    description: "بدء محادثات على Instagram",
  },
  {
    value: "CALLS",
    label: "المكالمات",
    description: "تشجيع الاتصال بنشاطك التجاري",
  },
];

export const optimizationGoals: OptimizationGoalOption[] = [
  {
    value: "LINK_CLICKS",
    label: "نقرات الرابط",
    description: "أكبر عدد من النقرات على الرابط",
  },
  {
    value: "LANDING_PAGE_VIEWS",
    label: "مشاهدات الصفحة",
    description: "أكبر عدد من مشاهدات صفحة الهبوط",
  },
  {
    value: "IMPRESSIONS",
    label: "مرات الظهور",
    description: "أكبر عدد من مرات ظهور الإعلان",
  },
  {
    value: "REACH",
    label: "الوصول",
    description: "الوصول لأكبر عدد من الأشخاص",
  },
  {
    value: "CONVERSIONS",
    label: "التحويلات",
    description: "أكبر عدد من التحويلات",
  },
  { value: "VALUE", label: "القيمة", description: "أعلى قيمة للتحويلات" },
  {
    value: "LEAD_GENERATION",
    label: "توليد العملاء المحتملين",
    description: "جمع بيانات العملاء المحتملين",
  },
  {
    value: "POST_ENGAGEMENT",
    label: "التفاعل مع المنشور",
    description: "أكبر عدد من التفاعلات",
  },
];

export const availablePlacements: PlacementOption[] = [
  { value: "FACEBOOK_FEED", label: "Facebook Feed", platform: "Facebook" },
  { value: "FACEBOOK_STORIES", label: "Facebook Stories", platform: "Facebook" },
  { value: "FACEBOOK_REELS", label: "Facebook Reels", platform: "Facebook" },
  { value: "FACEBOOK_MARKETPLACE", label: "Facebook Marketplace", platform: "Facebook" },
  { value: "FACEBOOK_RIGHT_COLUMN", label: "العمود الأيمن", platform: "Facebook" },
  { value: "INSTAGRAM_FEED", label: "Instagram Feed", platform: "Instagram" },
  { value: "INSTAGRAM_STORIES", label: "Instagram Stories", platform: "Instagram" },
  { value: "INSTAGRAM_REELS", label: "Instagram Reels", platform: "Instagram" },
  { value: "INSTAGRAM_EXPLORE", label: "Instagram Explore", platform: "Instagram" },
  { value: "MESSENGER_INBOX", label: "Messenger Inbox", platform: "Messenger" },
  { value: "MESSENGER_STORIES", label: "Messenger Stories", platform: "Messenger" },
  { value: "AUDIENCE_NETWORK", label: "Audience Network", platform: "Audience Network" },
];

export const availableInterests: InterestOption[] = [
  { value: "SHOPPING", label: "التسوق", category: "سلوكيات" },
  { value: "ONLINE_SHOPPING", label: "التسوق عبر الإنترنت", category: "سلوكيات" },
  { value: "FASHION", label: "الموضة", category: "اهتمامات" },
  { value: "TECHNOLOGY", label: "التكنولوجيا", category: "اهتمامات" },
  { value: "SPORTS", label: "الرياضة", category: "اهتمامات" },
  { value: "FOOD", label: "الطعام", category: "اهتمامات" },
  { value: "TRAVEL", label: "السفر", category: "اهتمامات" },
  { value: "BEAUTY", label: "الجمال", category: "اهتمامات" },
  { value: "FITNESS", label: "اللياقة البدنية", category: "اهتمامات" },
  { value: "BUSINESS", label: "الأعمال", category: "اهتمامات" },
  { value: "ENTERTAINMENT", label: "الترفيه", category: "اهتمامات" },
  { value: "GAMING", label: "الألعاب", category: "اهتمامات" },
];

export const availableLocations: LocationOption[] = [
  { value: "EG", label: "مصر" },
  { value: "SA", label: "السعودية" },
  { value: "AE", label: "الإمارات" },
  { value: "KW", label: "الكويت" },
  { value: "QA", label: "قطر" },
  { value: "BH", label: "البحرين" },
  { value: "OM", label: "عمان" },
  { value: "JO", label: "الأردن" },
  { value: "LB", label: "لبنان" },
  { value: "MA", label: "المغرب" },
  { value: "DZ", label: "الجزائر" },
  { value: "TN", label: "تونس" },
  { value: "IQ", label: "العراق" },
  { value: "LY", label: "ليبيا" },
  { value: "SD", label: "السودان" },
];

export const genderOptions = [
  { value: "male", label: "ذكور" },
  { value: "female", label: "إناث" },
];

export const STEP_TITLES = [
  "معلومات الحملة",
  "الميزانية",
  "الاستهداف",
  "المواضع",
  "إعدادات متقدمة",
  "المراجعة",
];
