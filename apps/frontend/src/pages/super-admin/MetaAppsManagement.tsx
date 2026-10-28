import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Layers,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Lock,
  ExternalLink,
  Power,
  Copy,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  metaAppsService,
  type MetaApp,
  type UpsertMetaAppPayload,
} from "../../services/metaAppsService";

export default function MetaAppsManagement() {
  const [apps, setApps] = useState<MetaApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<MetaApp | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState<UpsertMetaAppPayload>({
    key: "primary",
    appId: "",
    appSecretRef: "",
    configId: "",
    webhookVerifyTokenRef: "",
    isActive: true,
  });

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await metaAppsService.getApps();
      setApps(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل في تحميل سجل تطبيقات Meta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleToggle = async (key: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      await metaAppsService.toggleStatus(key, nextStatus);
      toast.success(
        nextStatus
          ? `تم تفعيل تطبيق ${key} بنجاح`
          : `تم تعطيل تطبيق ${key} — سيتم التراجع التلقائي إلى Primary`,
      );
      setApps((prev) =>
        prev.map((app) => (app.key === key ? { ...app, isActive: nextStatus } : app)),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل في تعديل حالة التطبيق");
    }
  };

  const handleOpenEdit = (app: MetaApp) => {
    setSelectedApp(app);
    setFormData({
      key: app.key,
      appId: app.appId,
      appSecretRef: app.appSecretRef,
      configId: app.configId || "",
      webhookVerifyTokenRef: app.webhookVerifyTokenRef || "",
      isActive: app.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appId.trim()) {
      toast.error("يرجى إدخال معرّف التطبيق (App ID)");
      return;
    }
    if (!formData.appSecretRef.trim()) {
      toast.error("يرجى إدخال مرجع سر التطبيق (Secret Reference)");
      return;
    }

    try {
      setSaving(true);
      await metaAppsService.upsertApp(formData);
      toast.success(`تم حفظ إعدادات تطبيق ${formData.key} بنجاح`);
      setIsEditDialogOpen(false);
      fetchApps();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل في حفظ إعدادات التطبيق");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const getPermissionsForApp = (key: string) => {
    if (key === "growth") {
      return [
        { name: "advanced_messaging_insights", label: "تحليلات متقدمة للمراسلات" },
        { name: "growth_ad_management", label: "إدارة إعلانات النمو المتكاملة" },
        { name: "wa_cross_copilot", label: "مساعد الذكاء الاصطناعي الهجين" },
        { name: "growth_feed_automation", label: "أتمتة المحتوى والمنشورات" },
      ];
    }
    return [
      { name: "pages_messaging", label: "إرسال واستقبال رسائل ماسنجر" },
      { name: "pages_read_engagement", label: "قراءة تفاعلات وتعليقات الصفحة" },
      { name: "pages_manage_metadata", label: "إدارة ربط واشتراكات الويب هوك" },
      { name: "ads_management", label: "إدارة الحملات الإعلانية الأساسية" },
    ];
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              إدارة تطبيقات Meta (Primary & Growth)
            </h1>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              T13 Architecture
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            سجل التطبيقات المعتمدة، عزل المفاتيح عبر الخزنة/البيئة، والويب هوك المزدوج مع دعم التراجع الفوري.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApps}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Security & Architecture Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            أمان مشدد: عدم تخزين أسرار التطبيقات كنصوص في قاعدة البيانات
          </p>
          <p className="text-emerald-700 dark:text-emerald-400">
            يتم تخزين مراجع المتغيرات (<code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">Ref</code>) فقط ويتم سحب الأسرار لحظياً من بيئة التشغيل الآمنة أو الخزنة المشفرة (Vault). لا يتم تسجيل أي أسرار في اللوجات أو واجهات البرمجة.
          </p>
        </div>
      </div>

      {/* App Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => {
          const isGrowth = app.key === "growth";
          const permissions = getPermissionsForApp(app.key);

          return (
            <Card
              key={app.key}
              className={`border-2 transition-shadow hover:shadow-md ${
                isGrowth
                  ? "border-purple-200 dark:border-purple-900 bg-gradient-to-b from-white to-purple-50/20 dark:from-gray-900 dark:to-purple-950/10"
                  : "border-blue-200 dark:border-blue-900 bg-gradient-to-b from-white to-blue-50/20 dark:from-gray-900 dark:to-blue-950/10"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold">
                        {isGrowth ? "تطبيق النمو (Growth App)" : "التطبيق الأساسي (Primary App)"}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          isGrowth
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {app.key}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {isGrowth
                        ? "مخصص للميزات المتقدمة، التحليلات، وإعلانات النمو"
                        : "تطبيق الإنتاج المعتمد لكافة الاتصالات الحالية ورسائل ماسنجر"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={app.isActive}
                      onCheckedChange={() => handleToggle(app.key, app.isActive)}
                      aria-label="تفعيل أو تعطيل التطبيق"
                    />
                    <Badge
                      variant={app.isActive ? "default" : "destructive"}
                      className={`text-[10px] ${
                        app.isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }`}
                    >
                      {app.isActive ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Credentials Overview */}
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">معرّف التطبيق (App ID):</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>{app.appId || "غير مضبوط"}</span>
                      {app.appId && (
                        <button
                          onClick={() => copyToClipboard(app.appId, "معرف التطبيق")}
                          className="text-gray-400 hover:text-gray-600"
                          title="نسخ"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">مرجع السر (Secret Ref):</span>
                    <div className="flex items-center gap-1.5">
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-[11px]">
                        {app.appSecretRef}
                      </code>
                      {app.hasSecretConfigured ? (
                        <span className="flex items-center text-emerald-600 gap-0.5 text-[10px]" title="تم العثور على السر في البيئة">
                          <CheckCircle2 className="h-3 w-3" /> متاح
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600 gap-0.5 text-[10px]" title="لم يتم العثور على السر في البيئة">
                          <AlertTriangle className="h-3 w-3" /> مفقود
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">رمز التحقق (Verify Token Ref):</span>
                    <div className="flex items-center gap-1.5">
                      <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-[11px]">
                        {app.webhookVerifyTokenRef || "غير محدد"}
                      </code>
                      {app.hasVerifyTokenConfigured ? (
                        <span className="flex items-center text-emerald-600 gap-0.5 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> مضبوط
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400 gap-0.5 text-[10px]">
                          <XCircle className="h-3 w-3" /> غير مضبوط
                        </span>
                      )}
                    </div>
                  </div>

                  {app.configId && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">معرف الدخول (Config ID):</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {app.configId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Permissions & Gated Features */}
                <div className="space-y-1.5">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {isGrowth ? "صلاحيات وميزات النمو المرتبطة:" : "صلاحيات التشغيل الأساسية:"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {permissions.map((p) => (
                      <div
                        key={p.name}
                        className="bg-white dark:bg-gray-800 border rounded px-2 py-1 text-[11px] flex items-center gap-1 text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate" title={p.name}>
                          {p.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action footer */}
                <div className="pt-2 border-t flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(app)}
                    className="flex items-center gap-1.5 text-xs h-8"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    تعديل الإعدادات
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit App Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
                تعديل إعدادات تطبيق Meta ({formData.key})
              </DialogTitle>
              <DialogDescription className="text-xs">
                تعديل معرف التطبيق ومراجع الأسرار. تذكر أن إدخال السكرت الخام محظور — استخدم اسم متغير البيئة فقط.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-gray-700 dark:text-gray-300">
                  معرّف التطبيق (App ID) *
                </label>
                <Input
                  value={formData.appId}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                  placeholder="e.g. 762328696481583"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700 dark:text-gray-300">
                  مرجع سر التطبيق (App Secret Ref) *
                </label>
                <Input
                  value={formData.appSecretRef}
                  onChange={(e) => setFormData({ ...formData, appSecretRef: e.target.value })}
                  placeholder="e.g. FACEBOOK_APP_SECRET or FACEBOOK_GROWTH_APP_SECRET"
                  className="font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-gray-500">
                  اسم متغير البيئة الذي يحتوي على سر التطبيق.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700 dark:text-gray-300">
                  معرف تكوين الدخول (Login Config ID - اختياري)
                </label>
                <Input
                  value={formData.configId || ""}
                  onChange={(e) => setFormData({ ...formData, configId: e.target.value })}
                  placeholder="e.g. 1047683957248554"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700 dark:text-gray-300">
                  مرجع رمز التحقق للويب هوك (Webhook Verify Token Ref - اختياري)
                </label>
                <Input
                  value={formData.webhookVerifyTokenRef || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, webhookVerifyTokenRef: e.target.value })
                  }
                  placeholder="e.g. FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={saving}
              >
                إلغاء
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
