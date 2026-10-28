import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Download,
  Globe,
  Info,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl } from "../../utils/urlHelper";
import tokenManager from "../../utils/tokenManager";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";

const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) =>
  tokenManager.createAuthHeaders(additionalHeaders);

interface VersionConfigFormData {
  latestVersion: string;
  latestVersionCode: number;
  minRequiredVersion: string;
  minRequiredVersionCode: number;
  forceUpdate: boolean;
  isEnabled: boolean;
  downloadUrl: string;
  directApkUrl: string;
  storeUrl: string;
  releaseNotesAr: string;
  releaseNotesEn: string;
  featuresArText: string;
  featuresEnText: string;
}

const DEFAULT_FORM_VALUES: VersionConfigFormData = {
  latestVersion: "1.2.0",
  latestVersionCode: 12,
  minRequiredVersion: "1.0.8",
  minRequiredVersionCode: 8,
  forceUpdate: false,
  isEnabled: true,
  downloadUrl: "https://maxp.online/download/maxp.apk",
  directApkUrl: "https://maxp.online/download/maxp.apk",
  storeUrl: "https://maxp.online/download/maxp.apk",
  releaseNotesAr: "تحديث رئيسي: خدمة المكالمات في الخلفية، تحسينات شاملة في الأداء والاستقرار.",
  releaseNotesEn: "Major update: background telephony service, performance and stability improvements.",
  featuresArText: [
    "الاتصال الصادر السحابي بنقرة واحدة عبر هاتف الموظف",
    "توثيق مدة المكالمة الرسمية تلقائياً وربطها بسجل الطلب",
    "نافذة التوثيق السريع وتحديث حالات الطلبات بعد كل مكالمة",
    "مزامنة فورية لحالة اتصال الهاتف بدون استهلاك للبطارية",
  ].join("\n"),
  featuresEnText: [
    "Outbound click-to-call via paired employee phone",
    "Official call duration recording and order log linking",
    "Quick disposition modal with one-click order transitions",
    "Real-time socket-aware presence with zero battery drain",
  ].join("\n"),
};

export default function SuperAdminAppVersionSettings() {
  const [formData, setFormData] = useState<VersionConfigFormData>(DEFAULT_FORM_VALUES);
  const [source, setSource] = useState<"db" | "default">("default");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrors([]);
      const res = await fetch(buildApiUrl("super-admin/app-version/android"), {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`خطأ ${res.status}: تعذر جلب إعدادات الإصدار`);
      }

      const json = await res.json();
      if (json.success) {
        setSource(json.source || "default");
        if (json.data) {
          const d = json.data;
          setFormData({
            latestVersion: d.latestVersion || DEFAULT_FORM_VALUES.latestVersion,
            latestVersionCode: d.latestVersionCode ?? DEFAULT_FORM_VALUES.latestVersionCode,
            minRequiredVersion: d.minRequiredVersion || DEFAULT_FORM_VALUES.minRequiredVersion,
            minRequiredVersionCode: d.minRequiredVersionCode ?? DEFAULT_FORM_VALUES.minRequiredVersionCode,
            forceUpdate: Boolean(d.forceUpdate),
            isEnabled: d.isEnabled !== false,
            downloadUrl: d.downloadUrl || DEFAULT_FORM_VALUES.downloadUrl,
            directApkUrl: d.directApkUrl || DEFAULT_FORM_VALUES.directApkUrl,
            storeUrl: d.storeUrl || DEFAULT_FORM_VALUES.storeUrl,
            releaseNotesAr: d.releaseNotesAr || DEFAULT_FORM_VALUES.releaseNotesAr,
            releaseNotesEn: d.releaseNotesEn || DEFAULT_FORM_VALUES.releaseNotesEn,
            featuresArText: Array.isArray(d.featuresAr)
              ? d.featuresAr.join("\n")
              : (d.featuresAr || DEFAULT_FORM_VALUES.featuresArText),
            featuresEnText: Array.isArray(d.featuresEn)
              ? d.featuresEn.join("\n")
              : (d.featuresEn || DEFAULT_FORM_VALUES.featuresEnText),
          });
        }
      }
    } catch (err: any) {
      console.error("[SuperAdminAppVersionSettings] fetch error:", err);
      toast.error(err.message || "فشل تحميل إعدادات الإصدار من السيرفر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      latestVersion: formData.latestVersion.trim(),
      latestVersionCode: Number(formData.latestVersionCode),
      minRequiredVersion: formData.minRequiredVersion.trim(),
      minRequiredVersionCode: Number(formData.minRequiredVersionCode),
      forceUpdate: formData.forceUpdate,
      isEnabled: formData.isEnabled,
      downloadUrl: formData.downloadUrl.trim(),
      directApkUrl: formData.directApkUrl.trim(),
      storeUrl: formData.storeUrl.trim(),
      releaseNotesAr: formData.releaseNotesAr.trim(),
      releaseNotesEn: formData.releaseNotesEn.trim(),
      featuresAr: formData.featuresArText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      featuresEn: formData.featuresEnText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(buildApiUrl("super-admin/app-version/android"), {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors && Array.isArray(json.errors)) {
          setErrors(json.errors);
        }
        throw new Error(json.message || "فشل حفظ وتحديث إعدادات الإصدار");
      }

      setSource("db");
      toast.success("تم نشر إعدادات الإصدار بنجاح وحفظها في قاعدة البيانات");
    } catch (err: any) {
      console.error("[SuperAdminAppVersionSettings] save error:", err);
      toast.error(err.message || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              إعدادات إصدار تطبيق الأندرويد
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              التحكم المركزي في إصدارات APK وقواعد الإلزام والتنبيهات لمستخدمي تطبيق الجوال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>إعادة تحميل</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || saving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>نشر الإعدادات</span>
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">مصدر الإعدادات الحالي</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  source === "db"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {source === "db" ? "قاعدة البيانات (مخصص)" : "القيم الافتراضية للكود"}
              </span>
            </div>
          </div>
          <Info className="w-5 h-5 text-muted-foreground/50" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">الإصدار الأحدث المنشور</span>
            <div className="flex items-baseline gap-1.5 mt-1 font-mono">
              <span className="text-lg font-bold text-foreground">v{formData.latestVersion}</span>
              <span className="text-xs text-muted-foreground">(كود {formData.latestVersionCode})</span>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block">وضع التحديث الإلزامي</span>
            <div className="flex items-center gap-1.5 mt-1">
              {formData.forceUpdate ? (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  مفعل (يمنع استخدام التطبيق دون تحديث)
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  اختياري (يمكن للمستخدم التأجيل)
                </span>
              )}
            </div>
          </div>
          <Globe className="w-5 h-5 text-muted-foreground/50" />
        </div>
      </div>

      {/* Validation Errors Box */}
      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>تعذر نشر الإعدادات بسبب الأخطاء التالية:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 pr-2">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Version Identifiers */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">أرقام وإصدارات الحزمة</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              تحديد أحدث إصدار متاح على الخادم والحد الأدنى المطلوب لتشغيل التطبيق
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="latestVersion" className="text-xs font-semibold">
                الإصدار الأحدث (latestVersion) *
              </Label>
              <Input
                id="latestVersion"
                type="text"
                placeholder="1.2.1"
                value={formData.latestVersion}
                onChange={(e) => setFormData({ ...formData, latestVersion: e.target.value })}
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground">
                يجب أن يطابق نمط SemVer الثلاثي (مثال: 1.2.0)
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="latestVersionCode" className="text-xs font-semibold">
                كود الإصدار الأحدث (latestVersionCode) *
              </Label>
              <Input
                id="latestVersionCode"
                type="number"
                min={1}
                placeholder="13"
                value={formData.latestVersionCode}
                onChange={(e) =>
                  setFormData({ ...formData, latestVersionCode: parseInt(e.target.value, 10) || 1 })
                }
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground">
                رقم صحيح متزايد يطابق versionCode في ملف build.gradle
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minRequiredVersion" className="text-xs font-semibold">
                الحد الأدنى للإصدار المطلوب (minRequiredVersion) *
              </Label>
              <Input
                id="minRequiredVersion"
                type="text"
                placeholder="1.0.8"
                value={formData.minRequiredVersion}
                onChange={(e) => setFormData({ ...formData, minRequiredVersion: e.target.value })}
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground">
                أي إصدار مثبت أقل من هذا الرقم سيتم إلزامه بالتحديث فوراً
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minRequiredVersionCode" className="text-xs font-semibold">
                كود الحد الأدنى المطلوب (minRequiredVersionCode) *
              </Label>
              <Input
                id="minRequiredVersionCode"
                type="number"
                min={1}
                placeholder="8"
                value={formData.minRequiredVersionCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minRequiredVersionCode: parseInt(e.target.value, 10) || 1,
                  })
                }
                required
                className="font-mono text-sm"
              />
              <span className="text-[11px] text-muted-foreground">
                يجب أن يكون أقل من أو يساوي كود الإصدار الأحدث
              </span>
            </div>
          </div>
        </div>

        {/* Enforcement & System Flags */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">قواعد الإلزام والتفعيل</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              التحكم في إجبار المستخدمين على التحديث وتعطيل خدمة التنبيهات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5 pr-1">
                <Label htmlFor="forceUpdate" className="text-sm font-semibold cursor-pointer">
                  فرض التحديث الإلزامي (forceUpdate)
                </Label>
                <p className="text-xs text-muted-foreground">
                  عند التفعيل يمنع المستخدم من إغلاق التنبيه أو استخدام التطبيق حتى إكمال التحديث
                </p>
              </div>
              <Switch
                id="forceUpdate"
                checked={formData.forceUpdate}
                onCheckedChange={(checked) => setFormData({ ...formData, forceUpdate: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5 pr-1">
                <Label htmlFor="isEnabled" className="text-sm font-semibold cursor-pointer">
                  تفعيل نظام التنبيهات (isEnabled)
                </Label>
                <p className="text-xs text-muted-foreground">
                  عند إلغاء التفعيل يتوقف فحص التحديثات تماماً لجميع مستخدمي الأندرويد
                </p>
              </div>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
            </div>
          </div>
        </div>

        {/* Download URLs */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">روابط التحميل والتوزيع</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              روابط تنزيل حزمة APK المباشرة وصفحة التنزيل
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="downloadUrl" className="text-xs font-semibold">
                رابط صفحة التحميل العامة (downloadUrl) *
              </Label>
              <Input
                id="downloadUrl"
                type="url"
                placeholder="https://maxp.online/download/maxp.apk"
                value={formData.downloadUrl}
                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                required
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directApkUrl" className="text-xs font-semibold">
                رابط التنزيل المباشر لحزمة APK (directApkUrl)
              </Label>
              <Input
                id="directApkUrl"
                type="url"
                placeholder="https://maxp.online/download/maxp.apk"
                value={formData.directApkUrl}
                onChange={(e) => setFormData({ ...formData, directApkUrl: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl" className="text-xs font-semibold">
                رابط المتجر أو التنزيل البديل (storeUrl)
              </Label>
              <Input
                id="storeUrl"
                type="url"
                placeholder="https://maxp.online/download/maxp.apk"
                value={formData.storeUrl}
                onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Release Notes & Changelog */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground">ملاحظات الإصدار والميزات الجديدة</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              النصوص المعروضة للمستخدمين داخل نافذة التحديث
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="releaseNotesAr" className="text-xs font-semibold">
                ملاحظات الإصدار (عربي)
              </Label>
              <Textarea
                id="releaseNotesAr"
                rows={3}
                placeholder="وصف مختصر لأهم ما يقدمه التحديث بالعربية..."
                value={formData.releaseNotesAr}
                onChange={(e) => setFormData({ ...formData, releaseNotesAr: e.target.value })}
              />
            </div>

            <div className="space-y-2" dir="ltr">
              <Label htmlFor="releaseNotesEn" className="text-xs font-semibold">
                Release Notes (English)
              </Label>
              <Textarea
                id="releaseNotesEn"
                rows={3}
                placeholder="Brief summary of update highlights..."
                value={formData.releaseNotesEn}
                onChange={(e) => setFormData({ ...formData, releaseNotesEn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuresArText" className="text-xs font-semibold">
                قائمة الميزات الجديدة (عربي) - بند في كل سطر
              </Label>
              <Textarea
                id="featuresArText"
                rows={5}
                placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                value={formData.featuresArText}
                onChange={(e) => setFormData({ ...formData, featuresArText: e.target.value })}
              />
            </div>

            <div className="space-y-2" dir="ltr">
              <Label htmlFor="featuresEnText" className="text-xs font-semibold">
                Feature Highlights (English) - one per line
              </Label>
              <Textarea
                id="featuresEnText"
                rows={5}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                value={formData.featuresEnText}
                onChange={(e) => setFormData({ ...formData, featuresEnText: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={fetchSettings}
            disabled={loading || saving}
          >
            إلغاء التغييرات
          </Button>

          <Button
            type="submit"
            disabled={loading || saving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>نشر الإعدادات الآن</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
