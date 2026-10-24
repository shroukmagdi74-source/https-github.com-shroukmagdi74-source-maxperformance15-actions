import { useEffect, useState, useMemo } from "react";
import {
  RotateCcw,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Compass,
  CreditCard,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { academyApi, SourcesAnalyticsData } from "./academyApi";

export default function AcademySourcesPage() {
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<SourcesAnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"campaigns" | "sources" | "landing">("campaigns");

  const loadData = async (selectedDays: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await academyApi.getSourcesAnalytics(selectedDays);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "تعذر تحميل بيانات مصادر التسجيل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(days);
  }, [days]);

  const kpis = useMemo(() => {
    const totals = data?.totals || {
      enrollments: 0,
      paidEnrollments: 0,
      attributedEnrollments: 0,
      unattributedEnrollments: 0,
      revenue: 0,
      enrollmentValue: 0,
    };

    const avgValue =
      totals.enrollments > 0
        ? Math.round(totals.enrollmentValue / totals.enrollments)
        : 0;

    const pctAttributed =
      totals.enrollments > 0
        ? Math.round((totals.attributedEnrollments / totals.enrollments) * 100)
        : 0;

    return {
      enrollments: totals.enrollments,
      paidEnrollments: totals.paidEnrollments,
      revenue: totals.revenue,
      avgValue,
      pctAttributed,
    };
  }, [data]);

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-7xl mx-auto" dir="rtl">
      {/* ─── Control Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/70 p-4 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-primary shrink-0" />
            <span>مصادر تسجيل الطلاب ونتائج الحملات</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            تتبع مسار الطلاب، دقة إسناد الإعلانات، والعائد التجاري الفعلي لكل حملة
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Days Filter */}
          <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50 text-xs font-semibold">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  days === d
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d} يوم
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(days)}
            disabled={loading}
            className="p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/40 text-foreground transition active:scale-95 disabled:opacity-50"
            title="تحديث البيانات"
            aria-label="تحديث البيانات"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ─── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium block">
            إجمالي التسجيلات
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1 font-mono tabular-nums">
            {kpis.enrollments}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium block">
            تسجيلات مدفوعة
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {kpis.paidEnrollments}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium block">
            إيراد الحملات
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1 font-mono tabular-nums">
            {kpis.revenue.toLocaleString("ar-EG")} <span className="text-xs font-normal">ج.م</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium block">
            متوسط قيمة التسجيل
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1 font-mono tabular-nums">
            {kpis.avgValue.toLocaleString("ar-EG")} <span className="text-xs font-normal">ج.م</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border/70 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] text-muted-foreground font-medium block">
            نسبة معروف المصدر
          </span>
          <div className="text-xl sm:text-2xl font-bold text-primary mt-1 font-mono tabular-nums">
            {kpis.pctAttributed}%
          </div>
        </div>
      </div>

      {/* ─── Tabs Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "campaigns"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>الحملات ({data?.byCampaign?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "sources"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>المصادر ({data?.bySource?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("landing")}
          className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "landing"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>صفحات الهبوط ({data?.byLanding?.length || 0})</span>
        </button>
      </div>

      {/* ─── Table 1: Campaigns ──────────────────────────────────────── */}
      {activeTab === "campaigns" && (
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3 sm:p-3.5">اسم الحملة / المعرف</th>
                  <th className="p-3 sm:p-3.5">المصدر / الوسيط</th>
                  <th className="p-3 sm:p-3.5">التسجيلات</th>
                  <th className="p-3 sm:p-3.5">المدفوعة</th>
                  <th className="p-3 sm:p-3.5">الإيراد المحقق</th>
                  <th className="p-3 sm:p-3.5">قيمة الكورسات</th>
                  <th className="p-3 sm:p-3.5">آخر تسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!data?.byCampaign || data.byCampaign.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      لا توجد بيانات حملات مسجلة خلال هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  data.byCampaign.map((c, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 sm:p-3.5 font-bold text-foreground">
                        <div>
                          <div>{c.campaignName || "غير معروف"}</div>
                          {(c.campaignId || c.adId) && (
                            <div className="text-[10px] text-muted-foreground font-mono font-normal flex items-center gap-1 mt-0.5">
                              {c.campaignId && <span>ID: {c.campaignId}</span>}
                              {c.adId && <span>· Ad: {c.adId}</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 sm:p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/40 text-[11px] font-medium border border-border/40">
                          {c.source || "غير معروف"} {c.medium ? `· ${c.medium}` : ""}
                        </span>
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono font-bold tabular-nums">
                        {c.enrollments}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {c.paidEnrollments}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono tabular-nums">
                        {c.revenue.toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono text-muted-foreground tabular-nums">
                        {c.enrollmentValue.toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3 sm:p-3.5 text-muted-foreground font-mono text-[11px] tabular-nums">
                        {c.lastEnrolledAt ? new Date(c.lastEnrolledAt).toLocaleDateString("ar-EG") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Table 2: Sources ────────────────────────────────────────── */}
      {activeTab === "sources" && (
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3 sm:p-3.5">المصدر الأساسي</th>
                  <th className="p-3 sm:p-3.5">الوسيط (Medium)</th>
                  <th className="p-3 sm:p-3.5">المنصة</th>
                  <th className="p-3 sm:p-3.5">التسجيلات</th>
                  <th className="p-3 sm:p-3.5">المدفوعة</th>
                  <th className="p-3 sm:p-3.5">الإيراد</th>
                  <th className="p-3 sm:p-3.5">قيمة الكورسات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!data?.bySource || data.bySource.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      لا توجد بيانات مصادر مسجلة خلال هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  data.bySource.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 sm:p-3.5 font-bold text-foreground">
                        {s.source || "غير معروف"}
                      </td>
                      <td className="p-3 sm:p-3.5 text-muted-foreground font-mono text-[11px]">
                        {s.medium || "—"}
                      </td>
                      <td className="p-3 sm:p-3.5 text-muted-foreground">
                        {s.platform || "—"}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono font-bold tabular-nums">
                        {s.enrollments}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {s.paidEnrollments}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono tabular-nums">
                        {s.revenue.toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono text-muted-foreground tabular-nums">
                        {s.enrollmentValue.toLocaleString("ar-EG")} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Table 3: Landing Pages ──────────────────────────────────── */}
      {activeTab === "landing" && (
        <div className="rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3 sm:p-3.5">صفحة الهبوط الأولى</th>
                  <th className="p-3 sm:p-3.5">موقع الإحالة (Referrer)</th>
                  <th className="p-3 sm:p-3.5">التسجيلات</th>
                  <th className="p-3 sm:p-3.5">المدفوعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!data?.byLanding || data.byLanding.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      لا توجد بيانات صفحات هبوط خلال هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  data.byLanding.map((l, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 sm:p-3.5 font-mono text-foreground font-semibold text-[11px] max-w-[260px] truncate" title={l.landingPath}>
                        {l.landingPath || "غير معروف"}
                      </td>
                      <td className="p-3 sm:p-3.5 text-muted-foreground text-[11px] max-w-[200px] truncate" title={l.referrer}>
                        {l.referrer || "مباشر"}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono font-bold tabular-nums">
                        {l.enrollments}
                      </td>
                      <td className="p-3 sm:p-3.5 font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {l.paidEnrollments}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Daily Timeline Strip ─────────────────────────────────────── */}
      {data?.byDay && data.byDay.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>النشاط اليومي خلال الفترة</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {data.byDay.map((d) => (
              <div
                key={d.date}
                className="p-2.5 rounded-xl bg-card border border-border/70 shadow-xs min-w-[110px] shrink-0 text-center space-y-1 hover:border-border transition-colors"
              >
                <div className="text-[10px] text-muted-foreground font-mono tabular-nums">{d.date}</div>
                <div className="text-sm font-bold text-foreground font-mono tabular-nums">
                  {d.enrollments} <span className="text-[10px] font-normal text-muted-foreground">طالب</span>
                </div>
                {d.revenue > 0 && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold tabular-nums">
                    {d.revenue} ج.م
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
