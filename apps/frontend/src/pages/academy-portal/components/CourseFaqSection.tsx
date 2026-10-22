import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, MessageSquareQuote } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export const buildFaqItems = (price: number, isFreeCourse: boolean): FaqItem[] => {
  if (isFreeCourse) {
    return [
      {
        q: "هل الكورس متاح للبدء فوراً؟",
        a: "نعم، بمجرد تسجيل دخولك للأكاديمية برقم هاتفك، تفتح لك كافة الدروس والتمارين فوراً دون أي قيود.",
      },
      {
        q: "هل أحتاج لتفريغ وقت طويل لمتابعة الدروس؟",
        a: "كل درس مركز ومدته بين 5 و12 دقيقة ويتناول فكرة عملية واحدة، لتتمكن من التطبيق المباشر دون تعطيل يومك.",
      },
      {
        q: "كيف أستفيد من الكوتش الذكي والتمارين العملية؟",
        a: "كل درس يرافقه كوتش ذكي متخصص في محتوى الدرس للإجابة على استفساراتك وتوجيهك، مع تمارين عملية تطبقها على المنصة لترسيخ ما تعلمته.",
      },
    ];
  }

  return [
    {
      q: "هل الاستثمار في الكورس مناسب لمشروعي؟",
      a: "الاستثمار لمرة واحدة ويبقى الكورس في حسابك دائماً مع التحديثات. المسار مصمم ليوفر عليك تكلفة التجربة العشوائية وإهدار ميزانيات الإعلانات شهرياً.",
    },
    {
      q: "هل أحتاج لتفريغ وقت طويل لمتابعة الدروس؟",
      a: "كل درس قصير ومركّز بين 5 و12 دقيقة ويتناول خطوة واحدة محددة، لتتعلم الخطوة وتنفذها مباشرة من هاتفك أو جهازك.",
    },
    {
      q: "كيف أتأكد أن أسلوب الشرح مناسب لي قبل القرار؟",
      a: "يمكنك مشاهدة الدروس المتاحة للمعاينة مجاناً بالكامل دون الحاجة للدفع، لتتعرف على الأسلوب العملي والشاشات الحقيقية قبل اتخاذ قرارك.",
    },
  ];
};

interface Props {
  price: number;
  totalLessons?: number;
  isFreeCourse?: boolean;
}

export const CourseFaqSection: React.FC<Props> = ({ price, isFreeCourse = false }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const actuallyFree = isFreeCourse || Number(price) <= 0;
  const faqItems = buildFaqItems(Number(price) || 0, actuallyFree);

  return (
    <section className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-5 text-right shadow-xs" dir="rtl">
      <div className="space-y-1.5 border-b border-border/60 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>إجابات واضحة ومباشرة</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {actuallyFree ? "الأسئلة الشائعة حول الكورس" : "الأسئلة الشائعة قبل الاشتراك"}
        </h2>
      </div>

      <div className="divide-y divide-border/50 space-y-2">
        {faqItems.map((faq, idx) => {
          const isOpen = openFaq === idx;

          return (
            <div key={idx} className="pt-2.5">
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-3 text-right py-2 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>{faq.q}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {isOpen && (
                <p className="p-3.5 text-xs text-muted-foreground leading-relaxed bg-muted/20 border border-border/40 rounded-xl mt-1.5 transition-all text-pretty">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
