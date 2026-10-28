/**
 * COMPLY-1 — Default (neutral) legal copy for the compliance bundle.
 *
 * Deliberately generic wording that a merchant edits to match their own process.
 * It makes no absolute promise and no certification claim; every block carries a
 * visible reminder to review it with a legal adviser.
 */

export type LegalLocale = "ar" | "en";

export const LEGAL_LOCALES: readonly LegalLocale[] = ["ar", "en"] as const;

export const resolveLegalLocale = (value: unknown): LegalLocale =>
  value === "en" ? "en" : "ar";

export const LEGAL_DISCLAIMER: Record<LegalLocale, string> = {
  ar: "نصوص عامة توضيحية جاهزة للتعديل، وليست استشارة قانونية. راجع مستشارك القانوني قبل النشر.",
  en: "General sample wording meant for editing. It is not legal advice — review it with your legal adviser before publishing.",
};

export const COOKIE_CONSENT_COPY = {
  ar: {
    title: "الكوكيز والقياس",
    description:
      "نستخدم الكوكيز لتشغيل المتجر وحفظ تفضيلاتك. أدوات القياس لا تعمل قبل موافقتك، وتقدر ترفض وتكمل التصفح عادي.",
    accept: "قبول",
    reject: "رفض",
    policyLabel: "سياسة الخصوصية",
  },
  en: {
    title: "Cookies and measurement",
    description:
      "We use cookies to run the store and remember your preferences. Measurement tools stay off until you agree, and you can decline and keep browsing.",
    accept: "Accept",
    reject: "Decline",
    policyLabel: "Privacy policy",
  },
} as const;

export interface LegalDocumentCopy {
  badge: string;
  title: string;
  subtitle: string;
  paragraphs: readonly string[];
  lastUpdatedLabel: string;
  disclaimer: string;
}

export const PRIVACY_POLICY_COPY: Record<LegalLocale, LegalDocumentCopy> = {
  ar: {
    badge: "الخصوصية",
    title: "سياسة الخصوصية",
    subtitle: "كيف نتعامل مع بياناتك داخل المتجر.",
    paragraphs: [
      "نجمع البيانات التي تقدمها بنفسك عند إتمام طلب أو التسجيل أو التواصل معنا، مثل الاسم وبيانات التواصل وعنوان التوصيل وتفاصيل الطلب.",
      "نستخدم هذه البيانات لتنفيذ الطلبات، وخدمة العملاء، وتشغيل المتجر، وتحسين تجربة التسوق. لا نبيع بياناتك لأطراف أخرى.",
      "قد نستخدم أدوات قياس داخلية لجمع إحصاءات مجمعة عن الزيارات، ولا تعمل هذه الأدوات قبل موافقتك على الكوكيز.",
      "يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر التواصل مع خدمة العملاء.",
      "نحتفظ بالبيانات للمدة اللازمة لأغراض التشغيل والمحاسبة، ثم نحذفها أو نخفي هويتها.",
    ],
    lastUpdatedLabel: "آخر تحديث",
    disclaimer: LEGAL_DISCLAIMER.ar,
  },
  en: {
    badge: "Privacy",
    title: "Privacy policy",
    subtitle: "How we handle your data inside this store.",
    paragraphs: [
      "We collect the details you share yourself when you order, register or contact us — such as your name, contact details, delivery address and order information.",
      "We use that data to fulfil orders, support customers, run the store and improve the shopping experience. We do not sell your data to other parties.",
      "We may use internal measurement tools to collect aggregated visit statistics; those tools stay off until you accept cookies.",
      "You can ask to review, correct or delete your data by contacting customer support.",
      "We keep data for as long as operations and accounting require, then delete it or make it anonymous.",
    ],
    lastUpdatedLabel: "Last updated",
    disclaimer: LEGAL_DISCLAIMER.en,
  },
};

export const TERMS_COPY: Record<LegalLocale, LegalDocumentCopy> = {
  ar: {
    badge: "الشروط",
    title: "شروط الاستخدام",
    subtitle: "الأساسيات التي تنظم الشراء من المتجر.",
    paragraphs: [
      "باستخدامك المتجر فإنك توافق على هذه الشروط العامة وعلى السياسات المنشورة في صفحات المتجر.",
      "نعرض الأسعار والتوافر بأكبر دقة ممكنة، وإذا ظهر خطأ واضح في السعر أو الوصف فقد نصححه قبل تنفيذ الطلب بعد إبلاغك.",
      "يُعد الطلب مؤكدًا بعد مراجعة البيانات، وقد نتواصل معك لتأكيد عنوان التوصيل أو تفاصيل المنتج.",
      "مواعيد الشحن وتكاليفه وقواعد الاستبدال تُنشر في صفحات الشحن والاستبدال، وتُطبق على الطلبات الجديدة.",
      "المحتوى والصور والعلامات المعروضة في المتجر مملوكة للمتجر أو مرخّصة له، ولا يجوز إعادة استخدامها تجاريًا دون إذن.",
      "أي خلاف يُحل بالتواصل الودي أولًا للوصول إلى حل، وإلا فيُرجح إلى الجهات المختصة في بلد المتجر.",
    ],
    lastUpdatedLabel: "آخر تحديث",
    disclaimer: LEGAL_DISCLAIMER.ar,
  },
  en: {
    badge: "Terms",
    title: "Terms of use",
    subtitle: "The basics that govern buying from this store.",
    paragraphs: [
      "By using this store you agree to these general terms and to the policies published on the store pages.",
      "We show prices and availability as accurately as we can. If an obvious error appears in a price or description we may correct it before fulfilling the order, after telling you.",
      "An order counts as confirmed after we review the details, and we may contact you to confirm the delivery address or product details.",
      "Shipping times, costs and exchange rules are published on the shipping and returns pages and apply to new orders.",
      "Content, images and marks shown in the store belong to the store or are licensed to it, and may not be reused commercially without permission.",
      "Any disagreement is first handled through friendly contact to reach a solution, and otherwise referred to the competent authorities in the store's country.",
    ],
    lastUpdatedLabel: "Last updated",
    disclaimer: LEGAL_DISCLAIMER.en,
  },
};

export const MARKETING_CONSENT_COPY = {
  ar: {
    label: "أوافق على استلام رسائل تسويقية (عروض وخصومات) عبر البريد الإلكتروني أو واتساب.",
    helperText: "الموافقة اختيارية، وتقدر تلغيها في أي وقت من إعدادات حسابك أو رابط إلغاء الاشتراك.",
  },
  en: {
    label: "I agree to receive marketing messages (offers and discounts) by email or WhatsApp.",
    helperText: "This is optional, and you can withdraw it at any time from your account settings or the unsubscribe link.",
  },
} as const;

export const LEGAL_BUNDLE_COPY = {
  ar: {
    title: "حزمة الامتثال",
    subtitle: "شريط موافقة الكوكيز + صفحة خصوصية + صفحة شروط، بنصوص عامة جاهزة للتعديل.",
    apply: "أضف حزمة الامتثال",
    applied: "تمت إضافة الحزمة",
    appliedSummary: (count: number) => `تمت إضافة ${count} عناصر مرة واحدة — مفيش تكرار.`,
    pendingSummary: (count: number) => `هيتم إضافة ${count} عناصر لهذا المتجر.`,
    barItem: "شريط موافقة الكوكيز",
    privacyItem: "صفحة الخصوصية",
    termsItem: "صفحة الشروط",
    reminder: LEGAL_DISCLAIMER.ar,
    existingNote: "العناصر المضافة بالفعل لا تُضاف مرة تانية.",
    pageLabel: "الصفحة الحالية",
  },
  en: {
    title: "Compliance bundle",
    subtitle: "Cookie consent bar + privacy page + terms page, with generic sample wording.",
    apply: "Add compliance bundle",
    applied: "Bundle added",
    appliedSummary: (count: number) => `${count} items added once — no duplicates.`,
    pendingSummary: (count: number) => `${count} items will be added to this store.`,
    barItem: "Cookie consent bar",
    privacyItem: "Privacy page",
    termsItem: "Terms page",
    reminder: LEGAL_DISCLAIMER.en,
    existingNote: "Items that already exist are never added twice.",
    pageLabel: "Current page",
  },
} as const;

/**
 * Parses a free-text field into paragraphs (blank line separated), mirroring
 * the convention used by the info-content section.
 */
export const parseLegalParagraphs = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n\s*\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};
