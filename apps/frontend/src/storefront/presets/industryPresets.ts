import type { PageStyleDensity } from "../studio/StudioTypes";
import type { StorefrontPageConfig } from "../types/theme.types";

export type IndustryPresetId =
  | "fashion"
  | "food"
  | "electronics"
  | "beauty"
  | "home"
  | "perfume"
  | "clinic"
  | "academy"
  | "realestate"
  | "gym"
  | "pharmacy"
  | "grocery"
  | "services";

export interface IndustryPresetSection {
  type: string;
  variant?: string;
  settings: Record<string, unknown>;
}

export interface IndustryPresetStyle {
  accent: string;
  density: PageStyleDensity;
  radius: number;
}

export interface IndustryPreset {
  id: IndustryPresetId;
  label: string;
  industry: string;
  description: string;
  accent: string;
  sections: IndustryPresetSection[];
  style: IndustryPresetStyle;
  icon?: string;
}

export const INDUSTRY_PRESETS: readonly IndustryPreset[] = [
  // 1. Fashion — أزياء وأحذية
  {
    id: "fashion",
    label: "أزياء وأحذية",
    industry: "أزياء وأحذية",
    description: "واجهة متكاملة لعلامات الموضة والأحذية تركز على تنسيقات الإطلالات والكتالوج الموسمي",
    accent: "#B45309",
    style: {
      accent: "#B45309",
      density: "normal",
      radius: 8,
    },
    sections: [
      {
        type: "hero-banner",
        variant: "bold",
        settings: {
          variant: "bold",
          eyebrow: "تشكيلة الموسم الجديد",
          title: "أناقة يومية وتصاميم تواكب حضورك",
          subtitle: "قطع عصرية مختارة بعناية لتناسب إطلالتك في كل مشوار ومناسبة بتفاصيل مريحة.",
          ctaText: "تصفح التشكيلة",
          ctaLink: "/shop",
          secondaryCtaText: "أحدث الإطلالات",
          secondaryCtaLink: "/collections",
        },
      },
      {
        type: "category-strip",
        settings: {
          title: "تصنيفات الأزياء",
          subtitle: "تسوق حسب القطعة أو النمط الملائم لذوقك",
          categories: [
            { label: "ملابس رجالي", link: "/shop?cat=men" },
            { label: "ملابس حريمي", link: "/shop?cat=women" },
            { label: "أحذية كاجوال", link: "/shop?cat=shoes" },
            { label: "حقائب وإكسسوارات", link: "/shop?cat=accessories" },
          ],
        },
      },
      {
        type: "featured-products",
        settings: {
          title: "القطع الأكثر طلباً",
          subtitle: "أحدث الإطلالات التي تناسب مشاويرك اليومية والمناسبات",
          limit: 4,
        },
      },
      {
        type: "lookbook-showcase",
        settings: {
          title: "دليل تنسيق الإطلالة",
          subtitle: "أفكار متناسقة لدمج القطع والألوان بأناقة وبساطة",
          ctaText: "تسوق الإطلالة كاملة",
          ctaLink: "/shop",
        },
      },
      {
        type: "promo-strip",
        settings: {
          badge: "مزايا التسوق",
          message: "معاينة قبل الاستلام وشحن لكل المحافظات والدفع عند الاستلام",
          shippingLabel: "شحن لكل المحافظات",
          saleLabel: "استبدال واسترجاع ميسر",
          ctaText: "اكتشف العروض",
          ctaLink: "/shop",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "انضم إلى مجتمع الأناقة",
          subtitle: "كن أول من يطّلع على التشكيلات الحصرية والتخفيضات الموسمية",
          buttonText: "اشترك الآن",
          placeholder: "أدخل بريدك الإلكتروني",
        },
      },
    ],
  },

  // 2. Food — مطاعم/كافيهات
  {
    id: "food",
    label: "مطاعم وكافيهات",
    industry: "مطاعم/كافيهات",
    description: "واجهة دافئة وجذابة للمطاعم ومحلات المخبوزات والحلويات مع إبراز قوائم الطعام والعروض",
    accent: "#B91C1C",
    style: {
      accent: "#B91C1C",
      density: "compact",
      radius: 12,
    },
    sections: [
      {
        type: "hero-banner",
        variant: "dark",
        settings: {
          variant: "dark",
          eyebrow: "نكهات طازجة يومياً",
          title: "وجبات شهية ومذاق أصيل يُحضر بعناية",
          subtitle: "مكونات طازجة ووصفات مميزة تصلك ساخنة وسريعة حتى باب بيتك.",
          ctaText: "اطلب الآن",
          ctaLink: "/shop",
          secondaryCtaText: "قائمة الطعام",
          secondaryCtaLink: "/collections",
        },
      },
      {
        type: "menu-highlights",
        settings: {
          title: "أبرز أطباق القائمة",
          subtitle: "تشكيلة مختارة من الأطباق المفضلة لوجبات الغداء والعشاء",
        },
      },
      {
        type: "offer-bento",
        settings: {
          title: "باقات ووجبات التوفير",
          subtitle: "عروض عائلية وفردية متكاملة بأسعار مناسبة",
          badge: "عروض التوفير",
        },
      },
      {
        type: "review-circle",
        settings: {
          title: "آراء وتجارب رواد المطعم",
          subtitle: "انطباعات حقيقية من زبائننا عن جودة المذاق وسرعة الخدمة",
        },
      },
      {
        type: "promo-strip",
        settings: {
          badge: "التوصيل السريع",
          message: "توصيل ساخن حتى باب بيتك والدفع عند الاستلام نقداً أو إلكترونياً",
          shippingLabel: "توصيل سريع وساخن",
          saleLabel: "تغليف حراري محكم",
          ctaText: "اختر وجبتك",
          ctaLink: "/shop",
        },
      },
      {
        type: "info-content",
        settings: {
          badge: "قصتنا ومطبخنا",
          title: "شغف بالطهي وجودة نلتزم بها",
          body: "نعتمد على أجود المكونات المحلية الطازجة يومياً مع التزام كامل بأعلى معايير النظافة والطهي الصحي.",
        },
      },
    ],
  },

  // 3. Electronics — إلكترونيات
  {
    id: "electronics",
    label: "إلكترونيات وأجهزة ذكية",
    industry: "إلكترونيات",
    description: "واجهة تقنية موثوقة لعرض المواصفات والضمان ومقارنات الأجهزة الذكية والإكسسوارات",
    accent: "#1D4ED8",
    style: {
      accent: "#1D4ED8",
      density: "compact",
      radius: 6,
    },
    sections: [
      {
        type: "hero-sidebar",
        settings: {
          eyebrow: "أحدث التقنيات المعتمدة",
          title: "أجهزة ذكية وإكسسوارات تواكب يومك التقني",
          subtitle: "منتجات أصلية بضمان حقيقي وتوصيل سريع مع فحص المنتج قبل الاستلام.",
          ctaText: "تصفح الأجهزة",
          ctaLink: "/shop",
        },
      },
      {
        type: "product-grid",
        variant: "grid",
        settings: {
          variant: "grid",
          title: "أحدث المنتجات والإكسسوارات",
          subtitle: "اكتشف أحدث الإلكترونيات المتوافقة مع أجهزتك",
          columns: 4,
        },
      },
      {
        type: "features-bar",
        variant: "trust-strip",
        settings: {
          variant: "trust-strip",
          title: "ضمانات الشراء وخدمة ما بعد البيع",
          items: [
            { title: "ضمان معتمد", description: "أجهزة أصلية مع فاتورة شراء وضمان محلي" },
            { title: "فحص وتشغيل قبل الدفع", description: "حق المعاينة والتأكد من سلامة المنتج عند الاستلام" },
            { title: "شحن سريع وآمن", description: "تغليف محكم ضد الصدمات وشحن لكل المحافظات" },
            { title: "دعم فني واستبدال", description: "خدمة عملاء جاهزة للمساعدة واستبدال سريع عند أي عيب صناعة" },
          ],
        },
      },
      {
        type: "before-after",
        settings: {
          title: "فارق الأداء وتجربة الاستخدام",
          subtitle: "شاهد الفارق الملموس في السرعة والجودة مع الجيل الجديد",
        },
      },
      {
        type: "faq-accordion",
        settings: {
          title: "الأسئلة الشائعة حول الضمان والشحن",
          subtitle: "كل ما تحتاج معرفته عن مدة الضمان وطرق الدفع والاستبدال",
          items: [
            {
              question: "هل الأجهزة أصلية وتحمل ضماناً معتمداً؟",
              answer: "نعم، جميع الأجهزة جديدة ومرفق معها شهادة الضمان والفاتورة المعتمدة.",
            },
            {
              question: "هل يمكنني معاينة الجهاز وتشغيله قبل الاستلام؟",
              answer: "بالتأكيد، يحق للمشتري فحص المنتج والتأكد من حالته قبل سداد القيمة لمندوب الشحن.",
            },
            {
              question: "ما هي سياسة الاستبدال والاسترجاع؟",
              answer: "نوفر استبدالاً واسترجاعاً ميسراً خلال المدة القانونية في حال وجود أي عيب مصنعي.",
            },
          ],
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "نشرة التحديثات والعروض التقنية",
          subtitle: "اشترك لتصلك مراجعات الأجهزة وأحدث التخفيضات فور توفرها",
          buttonText: "متابعة العروض",
          placeholder: "بريدك الإلكتروني",
        },
      },
    ],
  },

  // 4. Beauty — تجميل/عناية
  {
    id: "beauty",
    label: "تجميل وعناية شخصية",
    industry: "تجميل/عناية",
    description: "واجهة ناعمة وأنيقة لمنتجات العناية بالبشرة والشعر والمكياج تركز على المكونات والنتائج",
    accent: "#BE185D",
    style: {
      accent: "#BE185D",
      density: "airy",
      radius: 16,
    },
    sections: [
      {
        type: "hero-banner",
        variant: "soft",
        settings: {
          variant: "soft",
          eyebrow: "عناية طبيعية متكاملة",
          title: "إشراقة يومية مستخلصة من الطبيعة",
          subtitle: "تركيبات نقية ومكونات لطيفة على البشرة لتمنحك عناية متوازنة تدوم طويلاً.",
          ctaText: "اكتشفي التشكيلة",
          ctaLink: "/shop",
          secondaryCtaText: "روتين العناية",
          secondaryCtaLink: "/collections",
        },
      },
      {
        type: "featured-collections",
        settings: {
          title: "مجموعات العناية المتخصصة",
          subtitle: "اختاري روتينك المناسب حسب نوع بشرتك واحتياجك اليومي",
          limit: 4,
        },
      },
      {
        type: "review-circle",
        settings: {
          title: "تجارب حقيقية وروتين العناية",
          subtitle: "مشاركات وانطباعات صادقة عن نتائج المنتجات على البشرة والشعر",
        },
      },
      {
        type: "social-gallery",
        settings: {
          title: "من مجتمع العناية والجمال",
          subtitle: "صور وإطلالات يومية من استخدام المنتجات في الروتين المنزلي",
        },
      },
      {
        type: "offer-bento",
        settings: {
          title: "باقات الروتين الكامل",
          subtitle: "مجموعات العناية الصباحية والمسائية متكاملة بتوفير أفضل",
          badge: "باقات العناية",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "نصائح وإرشادات العناية بالبشرة",
          subtitle: "اشتركي لتصلك إرشادات خبراء العناية وأحدث المنتجات المناسبة لبشرتك",
          buttonText: "انضمي إلينا",
          placeholder: "بريدك الإلكتروني",
        },
      },
    ],
  },

  // 5. Home — منزل/أثاث
  {
    id: "home",
    label: "منزل وأثاث وديكور",
    industry: "منزل/أثاث",
    description: "واجهة تحريرية هادئة للأثاث العصري وتنسيقات الغرف والديكور المنزلي الدافئ",
    accent: "#4B5563",
    style: {
      accent: "#4B5563",
      density: "airy",
      radius: 8,
    },
    sections: [
      {
        type: "hero-banner",
        variant: "editorial",
        settings: {
          variant: "editorial",
          eyebrow: "دفء المنزل المعاصر",
          title: "مساحات معيشة تنبض بالراحة والأناقة",
          subtitle: "قطع أثاث وديكورات مختارة بعناية لتجعل كل ركن في منزلك مكاناً محبباً للاسترخاء.",
          ctaText: "تصفح المجموعات",
          ctaLink: "/shop",
          secondaryCtaText: "أفكار للغرف",
          secondaryCtaLink: "/collections",
        },
      },
      {
        type: "featured-collections",
        settings: {
          title: "مجموعات الأثاث والديكور",
          subtitle: "غرف المعيشة، طاولات الطعام، وحدات التخزين، والإضاءات الدافئة",
          limit: 4,
        },
      },
      {
        type: "story-parallax",
        settings: {
          title: "صناعة متقنة وخامات تدوم",
          subtitle: "نختار الأخشاب المتينة والأقمشة المقاومة لتصاميم تدوم طويلاً وتتحمل الاستخدام اليومي.",
          badge: "حكاية الجودة",
        },
      },
      {
        type: "features-bar",
        settings: {
          title: "مميزات شراء الأثاث معنا",
          items: [
            { title: "معاينة واختبار الخامات", description: "فحص جودة الخشب والتشطيب ومطابقة المواصفات قبل الاستلام" },
            { title: "شحن وتوصيل متخصص", description: "شحن مجهز للأثاث لحماية القطع من أي خدوش حتى الغرفة" },
            { title: "تركيب متقن", description: "فريق فني متخصص لتركيب وتجهيز القطع مباشرة عند التوصيل" },
            { title: "ضمان جودة الخامات", description: "ضمان ضد عيوب الصناعة مع التزام كامل بالصيانة" },
          ],
        },
      },
      {
        type: "info-content",
        settings: {
          badge: "دليل المقاسات والتنسيق",
          title: "كيف تختار الأبعاد المناسبة لمساحتك؟",
          body: "يقدم فريقنا نصائح عملية لمساعدتك على قياس المساحات وتوزيع الأثاث بتناغم يمنح الغرفة رحابة وسهولة حركة.",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "إلهام أسبوعي لتجديد منزلك",
          subtitle: "نصائح ديكور وتنسيقات ألوان وأحدث قطع الأثاث تصلك أولاً بأول",
          buttonText: "اشترك الآن",
          placeholder: "أدخل بريدك الإلكتروني",
        },
      },
    ],
  },

  // 6. Perfume — عطور
  {
    id: "perfume",
    label: "عطور وبخور فاخر",
    industry: "عطور",
    description: "واجهة فخمة لعطور النيش والخلطات الشرقية والغربية مع إبراز مكونات النوتات العطرية وثباتها",
    accent: "#8B5E3C",
    style: {
      accent: "#8B5E3C",
      density: "normal",
      radius: 10,
    },
    sections: [
      {
        type: "hero-banner",
        variant: "dark-luxe",
        settings: {
          variant: "dark-luxe",
          eyebrow: "نوتات عطرية استثنائية",
          title: "أريج يروي ذكرياتك ويترك بصمة تدوم",
          subtitle: "مجموعات عطرية فاخرة بنفحات شرقية وغربية متوازنة تدوم لساعات طويلة.",
          ctaText: "اكتشف العطور",
          ctaLink: "/shop",
          secondaryCtaText: "العطور الأكثر طلباً",
          secondaryCtaLink: "/collections",
        },
      },
      {
        type: "image-hotspot",
        settings: {
          title: "الهرم العطري ومكونات النوتات",
          subtitle: "اكتشف تدرج العطر من القمة المنعشة إلى القاعدة الدافئة الثابتة",
          badge: "النوتات العطرية",
        },
      },
      {
        type: "lookbook-showcase",
        settings: {
          title: "تشكيلات المناسبات والإهداء",
          subtitle: "خيارات راقية بتغليف فاخر يلائم الهدايا والمناسبات الخاصة",
          ctaText: "تصفح مجموعات الإهداء",
          ctaLink: "/shop",
        },
      },
      {
        type: "review-circle",
        settings: {
          title: "انطباعات محبي العطور",
          subtitle: "تجارب حقيقية عن ثبات العطور وفوحانها وتناسق مكوناتها",
        },
      },
      {
        type: "promo-strip",
        settings: {
          badge: "تجربة راقية",
          message: "عينة تجربة مجانية مع كل طلب للشراء بثقة واطمئنان مع شحن لكل المحافظات",
          shippingLabel: "شحن سريع وتغليف آمن",
          saleLabel: "عينة تجربة مجانية",
          ctaText: "اختر عطرك",
          ctaLink: "/shop",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "انضم إلى نادي النخبة العطرية",
          subtitle: "احصل على إشعارات فورية عند إطلاق العطور الحصرية والإصدارات الخاصة",
          buttonText: "انضم الآن",
          placeholder: "بريدك الإلكتروني",
        },
      },
    ],
  },
  // 7. Clinic — عيادات ومراكز طبية
  {
    id: "clinic",
    label: "عيادات ومراكز طبية",
    industry: "عيادات ومراكز طبية",
    description: "واجهة مهنية للعيادات والمراكز الصحية لعرض التخصصات الطبية وحجز الاستشارات والمواعيد",
    accent: "#0D9488",
    style: {
      accent: "#0D9488",
      density: "normal",
      radius: 10,
    },
    sections: [
      {
        type: "hero-sidebar",
        settings: {
          title: "رعاية صحية متكاملة لسلامتك وعائلتك",
          subtitle: "فريق طبي متخصص واستشارات تشخيصية بأحدث المعايير الطبية المعتمدة",
          ctaText: "حجز موعد كشف",
          ctaLink: "/booking",
          badge: "خدمات العيادة",
        },
      },
      {
        type: "services-grid",
        settings: {
          title: "التخصصات والعيادات المتاحة",
          subtitle: "خدمات تشخيصية وعلاجية شاملة بإشراف نخبة من الأطباء الاستشاريين",
        },
      },
      {
        type: "info-content",
        settings: {
          title: "عن المركز الطبي وفريقنا",
          subtitle: "نحرص على تقديم تجربة علاجية مريحة وتجهيزات متطورة للمرضى والزوار",
        },
      },
      {
        type: "reviews",
        settings: {
          title: "آراء المرضى والمراجعين",
          subtitle: "انطباعات وتجارب حقيقية عن مستوى الخدمة والرعاية الطبية",
        },
      },
      {
        type: "trusted-badges",
        settings: {
          title: "معايير الرعاية والاعتماد",
          subtitle: "تراخيص طبية معتمدة وتعقيم مستمر وخصوصية تامة لملفات المرضى",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "النشرة التوعوية الصحية",
          subtitle: "إرشادات طبية دورية ونصائح وقائية يقدمها أطباؤنا مباشرة إلى بريدك",
          buttonText: "اشترك الآن",
          placeholder: "أدخل بريدك الإلكتروني",
        },
      },
    ],
  },

  // 8. Academy — أكاديميات ومراكز تدريب
  {
    id: "academy",
    label: "أكاديميات ومراكز تدريب",
    industry: "تعليم وتدريب",
    description: "واجهة تعليمية تفاعلية للأكاديميات ومراكز التدريب لعرض المسارات التعليمية والبرامج المهنية",
    accent: "#4F46E5",
    style: {
      accent: "#4F46E5",
      density: "airy",
      radius: 8,
    },
    sections: [
      {
        type: "story-parallax",
        settings: {
          title: "مسارات تعليمية تصنع كفاءات المستقبل",
          subtitle: "برامج تدريبية متقدمة وتطبيق عملي يؤهلك للنجاح المهني بثقة واقتدار",
          ctaText: "استكشف البرامج",
          ctaLink: "/courses",
        },
      },
      {
        type: "article-grid",
        settings: {
          title: "المسارات التدريبية المتاحة",
          subtitle: "حقائب تدريبية موجهة تلائم احتياجات الطلاب والمهنيين في مختلف المجالات",
        },
      },
      {
        type: "features-bar",
        settings: {
          title: "مميزات التعلم معنا",
          subtitle: "مدربون ذوو خبرة ميدانية وتطبيقات عملية ومتابعة مستمرة بعد التخرج",
        },
      },
      {
        type: "reviews",
        settings: {
          title: "تجارب المتدربين والخريجين",
          subtitle: "قصص تطور حقيقية ومشاريع عملية أنجزها طلابنا خلال فترات التدريب",
        },
      },
      {
        type: "offer-bento",
        settings: {
          title: "باقات الالتحاق والمجموعات",
          subtitle: "خيارات تسجيل مرنة للدورات الفردية والبرامج الشاملة",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "نشرة الأكاديمية والورش المجانية",
          subtitle: "مواعيد ورش العمل المفتوحة واللقاءات الحوارية ومقالات التطور المهني",
          buttonText: "انضم الآن",
          placeholder: "بريدك الإلكتروني",
        },
      },
    ],
  },

  // 9. Realestate — تطوير وتسويق عقاري
  {
    id: "realestate",
    label: "تطوير وتسويق عقاري",
    industry: "عقارات ومشاريع",
    description: "واجهة معمارية راقية للمكاتب وشركات التطوير العقاري لعرض الوحدات والمشاريع السكنية",
    accent: "#047857",
    style: {
      accent: "#047857",
      density: "normal",
      radius: 6,
    },
    sections: [
      {
        type: "product-gallery",
        settings: {
          title: "معرض المشروعات والوحدات السكنية",
          subtitle: "مشاريع مختارة بمواقع حيوية ومخططات معمارية مدروسة تلبي متطلبات السكن والاستثمار",
        },
      },
      {
        type: "related-products",
        settings: {
          title: "وحدات ومساحات مميزة",
          subtitle: "تشكيلة من الشقق والفيلات والمكاتب بمساحات تناسب احتياجاتك",
        },
      },
      {
        type: "offer-bento",
        settings: {
          title: "خطط السداد والتسهيلات",
          subtitle: "أنظمة دفع متعددة وأقساط ميسرة تناسب ميزانيتك وخططك المستقبلية",
        },
      },
      {
        type: "info-content",
        settings: {
          title: "نبذة عن مشروعاتنا ورؤيتنا",
          subtitle: "خبرة واسعة في السوق العقاري والتزام بمواعيد التسليم وجودة التشطيب",
        },
      },
      {
        type: "trusted-badges",
        settings: {
          title: "معايير الثقة والالتزام",
          subtitle: "عقود قانونية واضحة ومواقع مسجلة وتراخيص بناء نظامية",
        },
      },
      {
        type: "whatsapp-cta",
        settings: {
          title: "تواصل مع مستشارك العقاري",
          subtitle: "فريق المبيعات متاح للإجابة عن استفساراتك وترتيب زيارة معاينة للوحدات",
          buttonText: "محادثة عبر واتساب",
        },
      },
    ],
  },

  // 10. Gym — صالات رياضية ولياقة
  {
    id: "gym",
    label: "صالات رياضية ولياقة",
    industry: "رياضة ولياقة بدنية",
    description: "واجهة رياضية حماسية للصالات ومراكز اللياقة لعرض باقات الاشتراكات والبرامج التدريبية",
    accent: "#EA580C",
    style: {
      accent: "#EA580C",
      density: "compact",
      radius: 14,
    },
    sections: [
      {
        type: "offer-bento",
        settings: {
          title: "باقات الاشتراك وعروض العضوية",
          subtitle: "خيارات عضوية متنوعة تشمل كافة الأجهزة والمرافق وحصص التدريب الجماعي",
        },
      },
      {
        type: "countdown",
        settings: {
          title: "فترة التسجيل المبكر للموسم",
          subtitle: "سارع بالانضمام والاستفادة من مزايا الاشتراك وحصص التدريب الإضافية",
        },
      },
      {
        type: "features-bar",
        settings: {
          title: "تجهيزات الصالة والمرافق",
          subtitle: "أجهزة تدريب حديثة ومساحات واسعة ومدربون معتمدون لخدمتك طوال اليوم",
        },
      },
      {
        type: "services-grid",
        settings: {
          title: "البرامج والأنشطة التدريبية",
          subtitle: "حصص لياقة وبناء أجسام وتدريب وظيفي بإشراف مدربين متخصصين",
        },
      },
      {
        type: "reviews",
        settings: {
          title: "انطباعات المشتركين وتجاربهم",
          subtitle: "شهادات حقيقية من أعضاء الصالة حول الالتزام الرياضي وبيئة التدريب",
        },
      },
      {
        type: "whatsapp-cta",
        settings: {
          title: "احجز جلستك التجريبية الآن",
          subtitle: "تواصل مع فريق الاستقبال لتحديد موعد زيارة وتجربة المرافق مجاناً",
          buttonText: "تواصل مع الصالة",
        },
      },
    ],
  },

  // 11. Pharmacy — صيدليات وعناية صحية
  {
    id: "pharmacy",
    label: "صيدليات وعناية صحية",
    industry: "صيدلية ورعاية صحية",
    description: "واجهة منظمة للصيدليات ومتاجر الرعاية الصحية للبحث السريع عن المستحضرات والأدوية",
    accent: "#0891B2",
    style: {
      accent: "#0891B2",
      density: "compact",
      radius: 8,
    },
    sections: [
      {
        type: "shop-command-bar",
        settings: {
          title: "البحث السريع في الأصناف الطبية",
          subtitle: "ابحث بالاسم التجاري أو العلمي أو تصنيف المستحضر الصحي",
        },
      },
      {
        type: "shopping-intents",
        settings: {
          title: "أقسام الرعاية والعناية اليومية",
          subtitle: "أدوية وفيتامينات ومستلزمات أطفال ومنتجات عناية شخصية موثوقة",
        },
      },
      {
        type: "product-grid",
        settings: {
          title: "المنتجات والمستحضرات المتاحة",
          subtitle: "أصناف متوفرة مع إمكانية الطلب والتوصيل السريع",
        },
      },
      {
        type: "featured-products",
        settings: {
          title: "أصناف العناية الأكثر طلباً",
          subtitle: "مستحضرات معتمدة يحتاجها البيت بصفة دورية",
        },
      },
      {
        type: "trusted-badges",
        settings: {
          title: "معايير الأمان الدوائي",
          subtitle: "تخزين طبي مطابق للاشتراطات وتاريخ صلاحية مضمون وفريق صيدلي متخصص",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "نشرة التوعية الدوائية والعروض",
          subtitle: "نصائح وإرشادات دوائية وتنبيهات بتوفر الأصناف المهمة",
          buttonText: "اشترك الآن",
          placeholder: "أدخل بريدك الإلكتروني",
        },
      },
    ],
  },

  // 12. Grocery — سوبرماركت ومواد غذائية
  {
    id: "grocery",
    label: "سوبرماركت ومواد غذائية",
    industry: "سوبرماركت وأغذية",
    description: "واجهة عملية لمتاجر الأغذية والسوبرماركت للطلب اليومي السريع مع إبراز سرعة التوصيل",
    accent: "#16A34A",
    style: {
      accent: "#16A34A",
      density: "compact",
      radius: 12,
    },
    sections: [
      {
        type: "shop-promo-rail",
        settings: {
          title: "عروض المنتجات والمستلزمات اليومية",
          subtitle: "تخفيضات أسبوعية على المواد التموينية والخضروات والمخبوزات الطازجة",
        },
      },
      {
        type: "featured-products",
        settings: {
          title: "الأصناف الأكثر طلباً للبيت",
          subtitle: "منتجات أساسية طازجة تطلب بصفة مستمرة",
        },
      },
      {
        type: "delivery-proof",
        settings: {
          title: "توصيل سريع وآمن حتى باب المنزل",
          subtitle: "شحن منظم بسيارات مجهزة للحفاظ على جودة الأغذية والمجمدات",
        },
      },
      {
        type: "product-grid",
        settings: {
          title: "تصفح كافة منتجات السوبرماركت",
          subtitle: "تشكيلة واسعة من المواد الغذائية ومنتجات الألبان والمعلبات والمنظفات",
        },
      },
      {
        type: "features-bar",
        settings: {
          title: "مزايا التسوق معنا",
          subtitle: "منتجات طازجة يومياً وأسعار عادلة ودفع نقدي أو إلكتروني عند الاستلام",
        },
      },
      {
        type: "newsletter",
        settings: {
          title: "نشرة العروض الأسبوعية",
          subtitle: "كن أول من يعلم عن العروض التوفيرية للمنتجات الغذائية فور صدورها",
          buttonText: "اشترك الآن",
          placeholder: "بريدك الإلكتروني",
        },
      },
    ],
  },

  // 13. Services — خدمات منزلية وصيانة
  {
    id: "services",
    label: "خدمات منزلية وصيانة",
    industry: "خدمات وصيانة",
    description: "واجهة موجهة للشركات ومقدمي الخدمات لعرض باقات الصيانة المنزلية والطلب المباشر",
    accent: "#7C3AED",
    style: {
      accent: "#7C3AED",
      density: "normal",
      radius: 16,
    },
    sections: [
      {
        type: "services-grid",
        settings: {
          title: "خدمات الصيانة والتشغيل المنزلي",
          subtitle: "حلول متكاملة في التكييف والكهرباء والسباكة والنظافة بإشراف فنيين مؤهلين",
        },
      },
      {
        type: "filters-sidebar",
        settings: {
          title: "تصفية الخدمات حسب التخصص",
          subtitle: "اختر نوع الخدمة المناسب لطلب المعاينة الفورية",
        },
      },
      {
        type: "trusted-badges",
        settings: {
          title: "ضمان الخدمة والتنفيذ",
          subtitle: "قطع غيار معتمدة والتزام بالمواعيد ومتابعة بعد انتهاء الصيانة",
        },
      },
      {
        type: "info-content",
        settings: {
          title: "خطوات طلب الخدمة والمعاينة",
          subtitle: "إجراءات واضحة تبدأ من تحديد الموعد وحتى إتمام الفحص وتسليم العمل",
        },
      },
      {
        type: "reviews",
        settings: {
          title: "تجارب وتقييمات العملاء",
          subtitle: "تقييمات واقعية من أصحاب المنازل والشركات حول دقة الفنيين وجودة الصيانة",
        },
      },
      {
        type: "whatsapp-cta",
        settings: {
          title: "اطلب فني الصيانة الآن",
          subtitle: "خدمة العملاء متوفرة للرد وتنسيق مواعيد الزيارات العاجلة والدورية",
          buttonText: "طلب خدمة عبر واتساب",
        },
      },
    ],
  },
] as const;

/**
 * Returns the preset definition matching the given id.
 */
export function getIndustryPreset(presetId: string): IndustryPreset | undefined {
  return INDUSTRY_PRESETS.find((p) => p.id === presetId);
}

/**
 * Builds a ready-to-use StorefrontPageConfig populated with the sections
 * of the specified industry preset, generating unique keys for each section.
 */
export function buildPresetPage(presetId: string): StorefrontPageConfig {
  const preset = getIndustryPreset(presetId);
  if (!preset) {
    throw new Error(`Industry preset not found: ${presetId}`);
  }

  const timestamp = Date.now();
  const sections = preset.sections.map((sectionDef, idx) => {
    const key = `${sectionDef.type}-${timestamp}-${idx}`;
    return {
      id: key,
      key,
      type: sectionDef.type,
      ...(sectionDef.variant ? { variant: sectionDef.variant } : {}),
      settings: {
        ...(sectionDef.variant ? { variant: sectionDef.variant } : {}),
        ...sectionDef.settings,
      },
    };
  });

  return {
    id: preset.id,
    slug: preset.id,
    title: preset.label,
    label: preset.label,
    sections,
    settings: {
      industry: preset.industry,
      presetId: preset.id,
      accent: preset.style.accent,
      density: preset.style.density,
      radius: preset.style.radius,
    },
  };
}
