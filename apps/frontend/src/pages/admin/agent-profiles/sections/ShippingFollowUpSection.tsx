import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Truck,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  ShieldAlert,
  Ticket,
} from "lucide-react";
import { tryApiFetch } from "../types";

interface ShippingSettings {
  enabled: boolean;
  minDays: number;
  statuses: string[];
  notifyAdmin: boolean;
  notifyCustomer: boolean;
  autoTicket: boolean;
  alertPhone: string | null;
  maxPerRun: number;
  dryRun: boolean;
  lastRunAt?: string | null;
  lastRunSummary?: {
    scanned: number;
    alerts: number;
    tickets: number;
    errors: number;
  } | null;
}

interface DelayedOrder {
  id: string;
  orderNumber: string;
  status: string;
  customStatusCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  turboCaptainName?: string | null;
  turboCaptainPhone?: string | null;
  turboDelayReason?: string | null;
  turboTrackingNumber?: string | null;
  daysInStatus: number;
  lastChangeAt: string;
}

const AVAILABLE_STATUSES = [
  { code: "SHIPPED", label: "تم الشحن (SHIPPED)" },
  { code: "OUT_FOR_DELIVERY", label: "مع المندوب (OUT_FOR_DELIVERY)" },
  { code: "NOT_SHIPPED", label: "لم يتم الشحن (NOT_SHIPPED)" },
  { code: "ON_HOLD", label: "معلق (ON_HOLD)" },
  { code: "PENDING", label: "قيد المراجعة (PENDING)" },
  { code: "CONFIRMED", label: "مؤكد (CONFIRMED)" },
];

export const ShippingFollowUpSection: React.FC<{ slug: string }> = ({ slug }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<ShippingSettings>({
    enabled: false,
    minDays: 2,
    statuses: ["SHIPPED", "OUT_FOR_DELIVERY", "NOT_SHIPPED", "ON_HOLD"],
    notifyAdmin: true,
    notifyCustomer: false,
    autoTicket: false,
    alertPhone: "",
    maxPerRun: 25,
    dryRun: false,
  });

  const [delayedOrders, setDelayedOrders] = useState<DelayedOrder[]>([]);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await tryApiFetch<{ success: boolean; settings: ShippingSettings }>(
        `/api/v1/agent-automation/${slug}`
      );
      if (data?.success && data.settings) {
        setSettings({
          ...data.settings,
          alertPhone: data.settings.alertPhone || "",
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "فشل تحميل إعدادات التشغيل");
    } finally {
      setLoading(false);
    }
  };

  const loadDelayedOrders = async () => {
    setDelayedLoading(true);
    try {
      const statusesParam = settings.statuses.join(",");
      const data = await tryApiFetch<{ success: boolean; items: DelayedOrder[] }>(
        `/api/v1/agent-automation/shipping/delayed?minDays=${settings.minDays}&status=${encodeURIComponent(statusesParam)}&limit=10`
      );
      if (data?.success && Array.isArray(data.items)) {
        setDelayedOrders(data.items);
      }
    } catch (_) {
      // ignore
    } finally {
      setDelayedLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [slug]);

  useEffect(() => {
    if (!loading) {
      loadDelayedOrders();
    }
  }, [loading, settings.minDays, settings.statuses]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const payload = {
        enabled: settings.enabled,
        minDays: Number(settings.minDays),
        statuses: settings.statuses,
        notifyAdmin: settings.notifyAdmin,
        notifyCustomer: settings.notifyCustomer,
        autoTicket: settings.autoTicket,
        alertPhone: settings.alertPhone ? String(settings.alertPhone).trim() : null,
        maxPerRun: Number(settings.maxPerRun),
        dryRun: settings.dryRun,
      };

      const res = await tryApiFetch<{ success: boolean; settings: ShippingSettings }>(
        `/api/v1/agent-automation/${slug}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (res?.success) {
        setSaveSuccess(true);
        if (res.settings) {
          setSettings((prev) => ({
            ...prev,
            ...res.settings,
          }));
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage("فشل حفظ الإعدادات، يُرجى التأكد من صحة المدخلات");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (code: string) => {
    setSettings((prev) => {
      const exists = prev.statuses.includes(code);
      if (exists) {
        if (prev.statuses.length === 1) return prev; // Don't allow empty
        return { ...prev, statuses: prev.statuses.filter((s) => s !== code) };
      }
      return { ...prev, statuses: [...prev.statuses, code] };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
        <RefreshCw className="size-5 animate-spin mr-2" />
        جاري تحميل إعدادات المتابعة...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          تم حفظ إعدادات متابعة الشحن بنجاح.
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Main Settings Card */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Truck className="size-5 text-primary" />
              متابعة الشحنات المتأخرة
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              فحص دوري للطلبات العالقة لدى شركات الشحن والمناديب وإرسال تنبيهات استباقية.
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
                تفعيل المتابعة التلقائية
              </span>
              <span className="text-xs text-muted-foreground">
                تشغيل الفحص الدوري كل 30 دقيقة ورصد أي تأخير.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={settings.dryRun}
              onChange={(e) => setSettings({ ...settings, dryRun: e.target.checked })}
              className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">
                وضع التجربة (Dry Run)
              </span>
              <span className="text-xs text-muted-foreground">
                تسجيل التنبيهات في سجل المنصة دون إرسال رسائل واتساب حقيقية.
              </span>
            </div>
          </label>
        </div>

        {/* Numeric and Text Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              عتبة التأخير (بالأيام)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={30}
                value={settings.minDays}
                onChange={(e) => setSettings({ ...settings, minDays: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Clock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              الحد الأدنى للأيام في نفس الحالة لبدء التنبيه (الافتراضي: 2).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              الحد الأقصى لكل تشغيل
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.maxPerRun}
              onChange={(e) => setSettings({ ...settings, maxPerRun: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              أقصى عدد شحنات يتم تنبيهها في التشغيلة الواحدة (1 - 100).
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              هاتف التنبيهات (اختياري)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="افتراضي: هاتف المتجر"
                value={settings.alertPhone || ""}
                onChange={(e) => setSettings({ ...settings, alertPhone: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Phone className="size-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              رقم الواتساب الخاص بمسؤول الشحن لاستلام التنبيهات.
            </p>
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-foreground">
            حالات الطلب المشمولة في المتابعة:
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_STATUSES.map((st) => {
              const active = settings.statuses.includes(st.code);
              return (
                <button
                  type="button"
                  key={st.code}
                  onClick={() => toggleStatus(st.code)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification & Ticket Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyAdmin}
              onChange={(e) => setSettings({ ...settings, notifyAdmin: e.target.checked })}
              className="size-4 rounded border-gray-300 text-primary"
            />
            <span className="font-medium text-foreground">تنبيه الإدارة (واتساب)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifyCustomer}
              onChange={(e) => setSettings({ ...settings, notifyCustomer: e.target.checked })}
              className="size-4 rounded border-gray-300 text-primary"
            />
            <span className="font-medium text-foreground">تنبيه العميل (واتساب)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoTicket}
              onChange={(e) => setSettings({ ...settings, autoTicket: e.target.checked })}
              className="size-4 rounded border-gray-300 text-primary"
            />
            <div className="flex items-center gap-1.5">
              <Ticket className="size-3.5 text-indigo-500" />
              <span className="font-medium text-foreground">تذكرة آلية (تربو)</span>
            </div>
          </label>
        </div>

        {/* Last Run Summary */}
        {settings.lastRunAt && (
          <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 border border-border/40">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              آخر تشغيل تلقائي: {new Date(settings.lastRunAt).toLocaleString("ar-EG")}
            </span>
            {settings.lastRunSummary && (
              <span className="flex items-center gap-3">
                <span>تم الفحص: <b>{settings.lastRunSummary.scanned}</b></span>
                <span>تنبيهات: <b>{settings.lastRunSummary.alerts}</b></span>
                <span>تذاكر: <b>{settings.lastRunSummary.tickets}</b></span>
                <span>أخطاء: <b>{settings.lastRunSummary.errors}</b></span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delayed Orders Live Inspection Table */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-500" />
              معاينة الطلبات المتأخرة حالياً ({delayedOrders.length})
            </h4>
            <p className="text-xs text-muted-foreground">
              الطلبات المطابقة للمعايير الحالية والتي سيتم متابعتها في التشغيل القادم.
            </p>
          </div>

          <button
            onClick={loadDelayedOrders}
            disabled={delayedLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${delayedLoading ? "animate-spin" : ""}`} />
            تحديث القائمة
          </button>
        </div>

        {delayedOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
            لا توجد طلبات متأخرة مطابقة لمعايير البحث الحالية (أقل من {settings.minDays} أيام تأخير).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">رقم الطلب</th>
                  <th className="py-2.5 px-3 font-semibold">العميل</th>
                  <th className="py-2.5 px-3 font-semibold">الحالة</th>
                  <th className="py-2.5 px-3 font-semibold">مدة التأخير</th>
                  <th className="py-2.5 px-3 font-semibold">المندوب والتتبع</th>
                  <th className="py-2.5 px-3 font-semibold">سبب التأخير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {delayedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono font-medium text-foreground">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-2 px-3">
                      <div>{ord.customerName || "غير محدد"}</div>
                      <div className="text-[11px] text-muted-foreground dir-ltr text-right">
                        {ord.customerPhone || "-"}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-muted font-medium text-[11px]">
                        {ord.customStatusCode || ord.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-amber-600 dark:text-amber-400">
                      {ord.daysInStatus} يوم
                    </td>
                    <td className="py-2 px-3">
                      <div>{ord.turboCaptainName || ord.turboTrackingNumber || "لا يوجد"}</div>
                      {ord.turboCaptainPhone && (
                        <div className="text-[11px] text-muted-foreground dir-ltr text-right">
                          {ord.turboCaptainPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {ord.turboDelayReason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
