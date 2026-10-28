import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Package,
  TrendingUp,
  Bell,
  Percent,
} from "lucide-react";
import { tryApiFetch } from "../types";

export interface GoalsStockSettings {
  enabled: boolean;
  daily_orders: number;
  weekly_orders: number;
  daily_revenue: number;
  weekly_revenue: number;
  min_stock_threshold: number;
  alert_phone: string | null;
  notify_whatsapp: boolean;
  milestones: number[];
  last_notified_target_date?: string | null;
  last_notified_weekly_target_date?: string | null;
  last_stock_alert_date?: string | null;
}

const AVAILABLE_MILESTONES = [50, 80, 100, 120];

export const GoalsStockSection: React.FC<{ slug?: string }> = ({
  slug = "stock-target-monitor-agent",
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<GoalsStockSettings>({
    enabled: false,
    daily_orders: 0,
    weekly_orders: 0,
    daily_revenue: 0,
    weekly_revenue: 0,
    min_stock_threshold: 5,
    alert_phone: "",
    notify_whatsapp: true,
    milestones: [50, 80, 100],
  });

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await tryApiFetch<{ success: boolean; settings: GoalsStockSettings }>(
        `/api/v1/agent-automation/${slug}`
      );
      if (data?.success && data.settings) {
        setSettings({
          ...data.settings,
          alert_phone: data.settings.alert_phone || "",
          milestones:
            Array.isArray(data.settings.milestones) && data.settings.milestones.length > 0
              ? data.settings.milestones
              : [50, 80, 100],
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "فشل تحميل إعدادات الأهداف والمخزون");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [slug]);

  const toggleMilestone = (m: number) => {
    const exists = settings.milestones.includes(m);
    let updated: number[];
    if (exists) {
      if (settings.milestones.length === 1) {
        return; // Don't allow empty milestones
      }
      updated = settings.milestones.filter((item) => item !== m);
    } else {
      updated = [...settings.milestones, m].sort((a, b) => a - b);
    }
    setSettings({ ...settings, milestones: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    if (settings.min_stock_threshold <= 0) {
      setErrorMessage("الحد الأدنى لرصيد المخزون يجب أن يكون أكبر من صفر");
      setSaving(false);
      return;
    }

    if (!Array.isArray(settings.milestones) || settings.milestones.length === 0) {
      setErrorMessage("يجب تحديد مرحلة إنجاز واحدة على الأقل للتنبيهات");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        enabled: settings.enabled,
        daily_orders: Math.max(0, Number(settings.daily_orders) || 0),
        weekly_orders: Math.max(0, Number(settings.weekly_orders) || 0),
        daily_revenue: Math.max(0, Number(settings.daily_revenue) || 0),
        weekly_revenue: Math.max(0, Number(settings.weekly_revenue) || 0),
        min_stock_threshold: Math.max(1, Number(settings.min_stock_threshold) || 5),
        alert_phone: settings.alert_phone ? String(settings.alert_phone).trim() : null,
        notify_whatsapp: settings.notify_whatsapp,
        milestones: settings.milestones,
      };

      const res = await tryApiFetch<{ success: boolean; settings: GoalsStockSettings }>(
        `/api/v1/agent-automation/${slug}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (res?.success) {
        setSaveSuccess(true);
        if (res.settings) {
          setSettings({
            ...res.settings,
            alert_phone: res.settings.alert_phone || "",
          });
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage("فشل حفظ إعدادات الأهداف والمخزون");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
        <RefreshCw className="size-4 animate-spin" />
        <span>جاري تحميل إعدادات الأهداف والمخزون...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>تم حفظ إعدادات الأهداف والمخزون بنجاح.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="size-5 text-primary" />
              متابعة تارجت المبيعات ونفاد المخزون
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              متابعة دورية لتحقيق أهداف الأوردرات اليومية والأسبوعية وتنبيهات فورية عند وصول المخزون للحد الحرج.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            حفظ التغييرات
          </button>
        </div>

        {/* Master Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">
                تفعيل متابعة الأهداف والمخزون
              </span>
              <span className="text-xs text-muted-foreground">
                تشغيل الفحص الدوري كل 30 دقيقة لاحتساب التقدم ومستوى النواقص.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.notify_whatsapp}
              onChange={(e) => setSettings({ ...settings, notify_whatsapp: e.target.checked })}
              className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">
                إرسال تنبيهات عبر واتساب
              </span>
              <span className="text-xs text-muted-foreground">
                إرسال رسائل الإنجاز ونقص الأصناف إلى رقم الإدارة عبر واتساب.
              </span>
            </div>
          </label>
        </div>

        {/* Target Orders Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="size-4 text-primary" />
            <span>مستهدفات عدد الطلبات (الأوردرات)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                تارجت الأوردرات اليومي
              </label>
              <input
                type="number"
                min={0}
                value={settings.daily_orders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_orders: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                الهدف المطلوب تحقيقه يومياً (0 = معطل).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                تارجت الأوردرات الأسبوعي
              </label>
              <input
                type="number"
                min={0}
                value={settings.weekly_orders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    weekly_orders: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                يبدأ الأسبوع من يوم السبت تلقائياً (0 = معطل).
              </p>
            </div>
          </div>
        </div>

        {/* Optional Revenue Targets */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Percent className="size-4 text-primary" />
            <span>مستهدفات الإيرادات المالية (اختياري)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                تارجت الإيراد اليومي
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={settings.daily_revenue}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_revenue: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                القيمة المالية المستهدفة بالعملة المحلية لليوم.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                تارجت الإيراد الأسبوعي
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={settings.weekly_revenue}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    weekly_revenue: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                القيمة المالية المستهدفة بالعملة المحلية للأسبوع.
              </p>
            </div>
          </div>
        </div>

        {/* Stock Threshold & Phone */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Package className="size-4 text-primary" />
            <span>حد التنبيه للمخزون والتواصل</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                عتبة انخفاض المخزون (قطع)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={settings.min_stock_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    min_stock_threshold: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                يتم التنبيه عند وصول رصيد أي منتج أو موديل إلى هذا العدد أو أقل (الافتراضي: 5).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                هاتف التنبيهات (واتساب)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="افتراضي: هاتف المتجر المسجل"
                  value={settings.alert_phone || ""}
                  onChange={(e) => setSettings({ ...settings, alert_phone: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Phone className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                الرقم الذي يستلم رسائل التارجت وقائمة الأصناف الناقصة.
              </p>
            </div>
          </div>
        </div>

        {/* Milestones Selection */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="block text-xs font-medium text-foreground">
            مراحل تحقيق الهدف التي يُرسل عندها تنبيه (%):
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MILESTONES.map((m) => {
              const active = settings.milestones.includes(m);
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggleMilestone(m)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {m}%
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            يُرسل التنبيه مرة واحدة فقط لكل مرحلة متحققة دون تكرار.
          </p>
        </div>
      </div>
    </div>
  );
};
