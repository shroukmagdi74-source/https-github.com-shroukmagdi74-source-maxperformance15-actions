import {
  ProductLandingProduct,
  SectionType,
} from "../../../services/productLandingPagesService";
import { LandingSection, SIDEBAR_ITEMS } from "./types";

export function createDefaultSection(
  type: SectionType,
  selectedProduct?: ProductLandingProduct | null,
): LandingSection {
  const itemConfig = SIDEBAR_ITEMS.find((item) => item.type === type);

  return {
    id: `sec-${type.toLowerCase()}-${Date.now()}`,
    type,
    title: itemConfig?.label || type,
    enabled: true,
    content: {
      heading:
        type === "TEXT"
          ? "عنوان جديد للقسم"
          : type === "HOW_IT_WORKS"
          ? "طريقة الاستخدام السهلة في 3 خطوات"
          : type === "HEADING"
          ? "اكتشف القوة والأناقة في منتج واحد"
          : type === "YOUTUBE_VIDEO"
          ? "شاهد تجربة واستعراض المنتج على الطبيعة"
          : undefined,
      bodyText:
        type === "TEXT" ? "اكتب تفاصيل ومواصفات المنتج هنا..." : undefined,
      bannerText:
        type === "BANNERS"
          ? "🔥 عرض خاص لفترة محدودة — خصم 30% + شحن مجاني"
          : undefined,
      timerEndsMinutes: type === "COUNTDOWN" ? 45 : undefined,
      lowStockCount: type === "COUNTDOWN" ? 14 : undefined,
      comparisonTitle:
        type === "COMPARISON"
          ? "لماذا تختار منتجنا الأصلي بدلاً من البدائل في السوق؟"
          : undefined,
      comparisonUsLabel: type === "COMPARISON" ? "منتجنا الأصلي" : undefined,
      comparisonThemLabel:
        type === "COMPARISON" ? "المنتجات المقلدة في السوق" : undefined,
      comparisonItems:
        type === "COMPARISON"
          ? [
              {
                feature: "جودة الخامات",
                us: "خامات أصلية عالية التحمل ومقاومة للتآكل",
                them: "خامات بلاستيكية سريعة التلف والتقشير",
              },
              {
                feature: "الراحة وسهولة الاستخدام",
                us: "تصميم مريح للاستخدام اليومي والمشاوير الطويلة",
                them: "يسبب إجهاد وتعب بعد الاستخدام لفترة وجيزة",
              },
              {
                feature: "معاينة قبل الدفع",
                us: "افحص المنتج براحتك قبل الاستلام والدفع",
                them: "ممنوع فتح الشحنة قبل الدفع",
              },
              {
                feature: "الضمان والاستبدال",
                us: "ضمان 14 يوم استرجاع واستبدال فوري",
                them: "لا يوجد أي ضمان أو استرجاع بعد البيع",
              },
            ]
          : undefined,
      breakdownTitle:
        type === "BREAKDOWN"
          ? "تشريح ومواصفات المنتج الدقيقة"
          : undefined,
      breakdownItems:
        type === "BREAKDOWN"
          ? [
              {
                title: "نعل طبي ماص للصدمات",
                desc: "مرونة كاملة لراحة الكعب والركبة طوال اليوم",
                icon: "👟",
                tag: "طبي 100%",
              },
              {
                title: "خامات مسامية مانعة للتعرق",
                desc: "تهوية مستمرة لانتعاش القدم ومنع الروائح",
                icon: "💨",
                tag: "انتعاش",
              },
              {
                title: "خياطة يدوية مدعمة",
                desc: "متانة فائقة تتحمل المشاوير اليومية الشاقة",
                icon: "🧵",
                tag: "متانة",
              },
              {
                title: "خفة وزن استثنائية",
                desc: "وزن خفيف جداً يمنحك راحة وسرعة في الحركة",
                icon: "🪶",
                tag: "خفيف جداً",
              },
            ]
          : undefined,
      galleryTitle:
        type === "GALLERY" ? "لقطات حية للمنتج على الطبيعة" : undefined,
      galleryImages:
        type === "GALLERY"
          ? [
              {
                url: selectedProduct?.mainImage || "",
                caption: "زاوية أمامية للمنتج",
              },
            ]
          : undefined,
      satisfactionRate:
        type === "LIVE_PROOF" ? "4.9 / 5 (أكثر من 1,420 تقييم)" : undefined,
      recentOrders:
        type === "LIVE_PROOF"
          ? [
              {
                buyer: "أميرة م.",
                city: "مدينة نصر، القاهرة",
                timeAgo: "منذ 4 دقائق",
                item: selectedProduct?.name || "المنتج",
              },
              {
                buyer: "محمود ع.",
                city: "سموحة، الإسكندرية",
                timeAgo: "منذ 11 دقيقة",
                item: `${selectedProduct?.name || "المنتج"} (باقة قطعتين)`,
              },
              {
                buyer: "نورهان س.",
                city: "المنصورة، الدقهلية",
                timeAgo: "منذ 19 دقيقة",
                item: selectedProduct?.name || "المنتج",
              },
            ]
          : undefined,
      videoUrl:
        type === "VIDEO_REEL"
          ? "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-person-unboxing-a-new-pair-of-shoes-42998-large.mp4"
          : undefined,
      videoThumbnail:
        type === "VIDEO_REEL" ? selectedProduct?.mainImage || "" : undefined,
      videoCaption:
        type === "VIDEO_REEL"
          ? "شاهد تجربة المنتج والأنبوكسينغ على الطبيعة بدون فلاتر"
          : undefined,
      beforeImage:
        type === "BEFORE_AFTER" ? selectedProduct?.mainImage || "" : undefined,
      afterImage:
        type === "BEFORE_AFTER" ? selectedProduct?.mainImage || "" : undefined,
      beforeLabel:
        type === "BEFORE_AFTER" ? "الأحذية العادية (إجهاد وألم في الكعب)" : undefined,
      afterLabel:
        type === "BEFORE_AFTER"
          ? `${selectedProduct?.name || "المنتج الأصلي"} (راحة وامتصاص صدمات)`
          : undefined,
      mainImage:
        type === "IMAGE_ONLY"
          ? selectedProduct?.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80"
          : undefined,
      imageUrl:
        type === "IMAGE_ONLY" || type === "FEATURED_PRODUCT"
          ? selectedProduct?.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80"
          : undefined,
      isFullWidth: type === "IMAGE_ONLY" ? true : undefined,
      variant: type === "IMAGE_ONLY" ? "rounded" : undefined,
      carouselImages:
        type === "CAROUSEL"
          ? [
              { id: "c-1", url: selectedProduct?.mainImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", caption: "اللقطة الأولى" },
              { id: "c-2", url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80", caption: "اللقطة الثانية" },
            ]
          : undefined,
      autoplay: type === "CAROUSEL" ? true : undefined,
      slideInterval: type === "CAROUSEL" ? 3 : undefined,
      title:
        type === "HOW_IT_WORKS"
          ? "طريقة الاستخدام السهلة في 3 خطوات"
          : type === "HEADING"
          ? "اكتشف القوة والأناقة في منتج واحد"
          : type === "YOUTUBE_VIDEO"
          ? "شاهد تجربة واستعراض المنتج على الطبيعة"
          : undefined,
      subheading:
        type === "HOW_IT_WORKS"
          ? "خطوات بسيطة تضمن لك أقصى استفادة من أول يوم"
          : type === "HEADING"
          ? "صُمم خصيصاً ليلبي أعلى معايير الجودة والراحة اليومية"
          : undefined,
      subtitle:
        type === "HOW_IT_WORKS"
          ? "خطوات بسيطة تضمن لك أقصى استفادة من أول يوم"
          : type === "HEADING"
          ? "صُمم خصيصاً ليلبي أعلى معايير الجودة والراحة اليومية"
          : undefined,
      steps:
        type === "HOW_IT_WORKS"
          ? [
              { stepNumber: 1, number: 1, title: "الطلب وتأكيد الشحن", desc: "املأ نموذج الطلب وسيتواصل معك فريق خدمة العملاء فوراً لتأكيد العنوان.", icon: "📦" },
              { stepNumber: 2, number: 2, title: "المعاينة قبل الدفع", desc: "استلم شحنتك وافتحها وافحص جودة المنتج والمقاس بنفسك قبل دفع أي جنيه للمندوب.", icon: "🔍" },
              { stepNumber: 3, number: 3, title: "تجربة واستخدام مريح", desc: "استمتع بالراحة والأداء العالي مع ضمان استبدال واسترجاع مجاني لمدة 14 يوماً.", icon: "✨" },
            ]
          : undefined,
      productName:
        type === "FEATURED_PRODUCT" ? selectedProduct?.name || "المنتج المميز" : undefined,
      featuredBadge:
        type === "FEATURED_PRODUCT" ? "الأكثر طلباً وتوفيراً 🔥" : undefined,
      badge:
        type === "FEATURED_PRODUCT" ? "الأكثر طلباً وتوفيراً 🔥" : type === "HEADING" ? "ميزة حصرية ✨" : undefined,
      price:
        type === "FEATURED_PRODUCT" ? selectedProduct?.price || 499 : undefined,
      oldPrice:
        type === "FEATURED_PRODUCT" ? (selectedProduct?.price || 499) + 200 : undefined,
      currency:
        type === "FEATURED_PRODUCT" ? "ج.م" : undefined,
      rating:
        type === "FEATURED_PRODUCT" ? 4.9 : undefined,
      ctaText:
        type === "FEATURED_PRODUCT" ? "اطلب الآن واستفد من العرض" : undefined,
      featuredBullets:
        type === "FEATURED_PRODUCT"
          ? [
              "خامات أصلية عالية الجودة تدوم لسنوات",
              "تصميم مريح يدعم الاستخدام اليومي المكثف",
              "شحن سريع لجميع المحافظات مع معاينة قبل الدفع",
            ]
          : undefined,
      youtubeUrl:
        type === "YOUTUBE_VIDEO" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
      buyButtonText:
        type === "BUY_BUTTON" ? "اضغط هنا لطلب المنتج الآن — الدفع عند الاستلام 🚚" : undefined,
      text:
        type === "BUY_BUTTON" ? "اضغط هنا لطلب المنتج الآن — الدفع عند الاستلام 🚚" : undefined,
      targetAction:
        type === "BUY_BUTTON" ? "scroll_to_form" : undefined,
      btnColor:
        type === "BUY_BUTTON" ? "#16a34a" : undefined,
      btnTextColor:
        type === "BUY_BUTTON" ? "#ffffff" : undefined,
      animation:
        type === "BUY_BUTTON" ? "pulse" : undefined,
      alignment:
        type === "HEADING" ? "center" : undefined,
      headingLevel:
        type === "HEADING" ? "h2" : undefined,
    },
  };
}
