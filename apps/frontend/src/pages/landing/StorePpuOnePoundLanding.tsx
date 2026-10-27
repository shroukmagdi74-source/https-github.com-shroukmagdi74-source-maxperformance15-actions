import React, { useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Wallet,
  ShoppingBag,
  Package,
  Layers,
  Sparkles,
  Tag,
  Truck,
  Infinity as InfinityIcon,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const START_URL = "/register?redirect=%2Fmarketplace%2Fapps%2Fstore";

export const StorePpuOnePoundLanding: React.FC = () => {
  useEffect(() => {
    const TITLE = "المتجر — جنيه واحد على كل أوردر | MaxP";
    const DESC =
      "تثبيت المتجر 0 ج.م · من غير اشتراك شهري · من غير نسبة على البيعة. بتدفع على أوردرات المتجر بس: 1 ج.م على كل أوردر.";
    document.title = TITLE;

    const metaChanges: Array<{ el: HTMLMetaElement; prev: string | null }> = [];
    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const prev = el ? el.content : null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
      metaChanges.push({ el, prev });
    };

    setMeta("property", "og:title", TITLE);
    setMeta("property", "og:description", DESC);
    setMeta("name", "twitter:title", TITLE);
    setMeta("name", "twitter:description", DESC);

    const robotsMeta = document.createElement("meta");
    robotsMeta.name = "robots";
    robotsMeta.content = "index, follow";
    document.head.appendChild(robotsMeta);

    return () => {
      metaChanges.forEach(({ el, prev }) => {
        if (prev === null) {
          if (el.parentNode) el.parentNode.removeChild(el);
        } else {
          el.content = prev;
        }
      });
      if (robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta);
      }
    };
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white"
    >
      {/* ── 1. الهيرو + زر ── */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 sm:text-sm">
            <Sparkles className="h-4 w-4" />
            <span>بتدفع على أوردرات المتجر بس</span>
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            جنيه واحد على كل أوردر
          </h1>

          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-emerald-400 sm:text-7xl">1 ج.م</span>
              <span className="text-xl font-medium text-slate-300 sm:text-2xl">على كل أوردر</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm font-medium text-slate-300 sm:text-base">
              تثبيت المتجر 0 ج.م · من غير اشتراك شهري · من غير نسبة على البيعة
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <a
              href={START_URL}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:bg-emerald-700 sm:w-auto"
            >
              <span>ابدأ متجرك دلوقتي</span>
              <ArrowLeft className="h-5 w-5" />
            </a>
            <p className="text-xs text-slate-400">
              بعد تسجيل حسابك، بتدخل على سوق التطبيقات وتثبت تطبيق المتجر بـ 0 ج.م وتبدأ فورا
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. إزاي بتتحسب ── */}
      <section className="border-b border-slate-800 bg-slate-900/50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">إزاي بتتحسب؟</h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              معادلة مباشرة وواضحة بدون أي شروط خفية
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-400">
                1
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">تثبيت بـ 0 ج.م</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                تسجل حسابك وتثبت تطبيق المتجر من سوق التطبيقات بـ 0 ج.م وبدون أي مصاريف تثبيت.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-400">
                2
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">شحن المحفظة</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                بتشحن محفظتك برصيد مسبق الدفع عشان يغطي طلبات متجرك أولا بأول وبمرونة كاملة.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-lg font-bold text-emerald-400">
                3
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">جنيه على كل أوردر من المتجر</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                مع كل أوردر بيتم من المتجر بيتخصم 1 ج.م من رصيدك — بتدفع على أوردرات المتجر بس.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. اللي جوه المتجر ── */}
      <section className="border-b border-slate-800 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">اللي جوه المتجر</h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              أدوات مجهزة لإدارة تجارتك باحترافية
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">إدارة الطلبات</h3>
              <p className="mt-2 text-sm text-slate-400">
                متابعة حركة كل أوردر لحظيا من لحظة وصوله وحتى تسليمه للعميل.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">إدارة المنتجات</h3>
              <p className="mt-2 text-sm text-slate-400">
                تنظيم المنتجات والألوان والمقاسات ومتابعة كميات المخزون بسهولة.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">المتجر الإلكتروني</h3>
              <p className="mt-2 text-sm text-slate-400">
                واجهة تسوق سريعة ومتجاوبة مصممة للبيع على الموبايل والكمبيوتر.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">سلة تسوق ذكية</h3>
              <p className="mt-2 text-sm text-slate-400">
                تجربة شراء سريعة بدون تعقيد تضمن إتمام الطلب في ثوان معدودة.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">كوبونات وعروض</h3>
              <p className="mt-2 text-sm text-slate-400">
                إنشاء قسائم ترويجية وتخفيضات تشجع العملاء على زيادة مشترياتهم.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">إدارة الشحن</h3>
              <p className="mt-2 text-sm text-slate-400">
                ربط شركات الشحن وإصدار بوالص الشحن وتتبع حالة التوصيل بدقة.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <InfinityIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">منتجات غير محدودة</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    أضف كل منتجاتك وصورك وتفاصيلها بدون أي قيود على سعة الكتالوج.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href={START_URL}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:bg-emerald-700 sm:w-auto"
            >
              <span>ابدأ متجرك دلوقتي</span>
              <ArrowLeft className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. شفافية الرصيد ── */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">شفافية الرصيد</h2>
                <p className="text-xs text-slate-400 sm:text-sm">
                  بتدفع على أوردرات المتجر بس وبأمان تام
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-base font-semibold leading-relaxed text-emerald-300 sm:text-lg">
                لو الرصيد مش كفاية الأوردر بيتسجّل ومستني شحن
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                لو رصيد محفظتك غير كافٍ، متجرك مابيوقفش؛ الطلب بيوصل وبيتسجل في لوحة التحكم وتظهر حالته بانتظار شحن الرصيد عشان تتابعه وتستكمله بدون ما تخسر أي عميل.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="text-xs text-slate-300 sm:text-sm">
                  <span className="font-bold text-white">الطلب محفوظ:</span> عميلك بيطلب بشكل طبيعي والبيانات محفوظة بالكامل.
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="text-xs text-slate-300 sm:text-sm">
                  <span className="font-bold text-white">بدون غرامات:</span> مفيش أي رسوم تأخير أو مصاريف إضافية (0 ج.م).
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. خمس أسئلة شائعة ── */}
      <section className="border-b border-slate-800 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">أسئلة شائعة</h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              كل الإجابات اللي محتاج تعرفها قبل ما تبدأ
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span>إزاي بتحاسب؟</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                بتدفع 1 ج.م على كل أوردر بيتم من خلال متجرك الإلكتروني بس، وبيتخصم تلقائيا من رصيد محفظتك.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <span>أقل مبلغ شحن للمحفظة كام؟</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                تقدر تشحن محفظتك بأي مبلغ يناسبك للبدء، بدون أي حد أدنى وبدون أي اشتراطات مسبقة.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span>هل فيه تجربة مجانية؟</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                مفيش تجربة مجانية لأن تثبيت المتجر 0 ج.م وبدون اشتراك شهري؛ بتبدأ مباشرة مع أول أوردر برصيد في محفظتك.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span>هل فيه اشتراك شهري؟</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                مفيش اشتراك شهري ولا مصاريف دورية؛ حسابك بيعتمد بالكامل على الاستهلاك الفعلي: 1 ج.م على كل أوردر من المتجر بس.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <span>إيه وضع الأوردرات اليدوية؟</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                الأوردرات اليدوية مجانًا تماما (0 ج.م) — بتدفع على أوردرات المتجر بس.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ختامي ── */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ابدأ متجرك دلوقتي
          </h2>
          <p className="mt-4 text-base font-medium text-slate-300 sm:text-lg">
            تثبيت المتجر 0 ج.م · من غير اشتراك شهري · من غير نسبة على البيعة
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-400 sm:text-base">
            1 ج.م على كل أوردر · بتدفع على أوردرات المتجر بس
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <a
              href={START_URL}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 active:bg-emerald-700 sm:w-auto"
            >
              <span>ابدأ متجرك دلوقتي</span>
              <ArrowLeft className="h-5 w-5" />
            </a>
            <p className="text-xs text-slate-400">
              بعد تسجيل حسابك، بتدخل على سوق التطبيقات وتثبت تطبيق المتجر بـ 0 ج.م وتبدأ فورا
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <p>MaxP — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default StorePpuOnePoundLanding;
