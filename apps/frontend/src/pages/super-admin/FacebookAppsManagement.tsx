import React, { useEffect, useState } from "react";
import {
  Layers,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Power,
  Edit2,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Key,
  ExternalLink,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import tokenManager from "../../utils/tokenManager";
import { buildApiUrl } from "../../utils/urlHelper";

interface MetaApp {
  id: string;
  key: "primary" | "growth" | string;
  appId: string;
  configId: string;
  appSecretRef: string;
  webhookVerifyTokenRef: string;
  isActive: boolean;
  hasSecretConfigured: boolean;
  hasVerifyTokenConfigured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const FacebookAppsManagement: React.FC = () => {
  const [apps, setApps] = useState<MetaApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<MetaApp | null>(null);
  const [formAppId, setFormAppId] = useState("");
  const [formSecretRef, setFormSecretRef] = useState("");
  const [formConfigId, setFormConfigId] = useState("");
  const [formVerifyTokenRef, setFormVerifyTokenRef] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl("super-admin/platform/meta-apps"), {
        headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApps(json.data);
      } else {
        toast.error(json.message || "فشل تحميل قائمة التطبيقات");
      }
    } catch (err: any) {
      toast.error("خطأ في الاتصال بالخادم: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleToggleActive = async (key: string, currentStatus: boolean) => {
    try {
      setActionLoading(key);
      const res = await fetch(buildApiUrl(`super-admin/platform/meta-apps/${key}/toggle`), {
        method: "PATCH",
        headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`تم ${!currentStatus ? "تفعيل" : "تعطيل"} تطبيق ${key} بنجاح`);
        await fetchApps();
      } else {
        toast.error(json.message || "فشل تغيير حالة التطبيق");
      }
    } catch (err: any) {
      toast.error("خطأ أثناء تحديث الحالة: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditDialog = (app: MetaApp) => {
    setEditingApp(app);
    setFormAppId(app.appId || "");
    setFormSecretRef(app.appSecretRef || "");
    setFormConfigId(app.configId || "");
    setFormVerifyTokenRef(app.webhookVerifyTokenRef || "");
    setFormIsActive(app.isActive);
    setIsDialogOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setActionLoading("save");
      const res = await fetch(buildApiUrl("super-admin/platform/meta-apps"), {
        method: "POST",
        headers: tokenManager.createAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          key: editingApp.key,
          appId: formAppId.trim(),
          appSecretRef: formSecretRef.trim(),
          configId: formConfigId.trim(),
          webhookVerifyTokenRef: formVerifyTokenRef.trim(),
          isActive: formIsActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`تم حفظ بيانات تطبيق ${editingApp.key} بنجاح`);
        setIsDialogOpen(false);
        await fetchApps();
      } else {
        toast.error(json.message || "فشل حفظ التطبيق");
      }
    } catch (err: any) {
      toast.error("خطأ أثناء الحفظ: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-sm">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              بنية تطبيقي Meta (Primary + Growth)
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                T13 Multi-App Registry
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              إدارة التطبيق الأساسي (Primary) وتطبيق النمو المتقدم (Growth) مع حماية أسرار الاعتماد في البيئة (Vault Refs).
            </p>
          </div>
        </div>

        <button
          onClick={fetchApps}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-medium transition-colors"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          تحديث السجل
        </button>
      </div>

      {/* Security Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          <strong>مبدأ الأمان الإلزامي:</strong> يتم تخزين <em>مراجع الأسرار فقط (Ref)</em> في قاعدة البيانات. لا يتم حفظ أو عرض أسرار التطبيقات كنص خام في السجل أو اللوج نهائيًا، وتُقرأ عند الاستدعاء مباشرة من متغيرات البيئة الآمنة (process.env / Vault).
        </div>
      </div>

      {/* Apps Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[250px] border border-border/60 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">جاري تحميل سجل التطبيقات...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => {
            const isPrimary = app.key === "primary";
            return (
              <div
                key={app.key}
                className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                  app.isActive
                    ? "bg-card border-border/80 shadow-muted/5"
                    : "bg-muted/30 border-dashed border-border/70 opacity-80"
                }`}
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center ${
                          isPrimary
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                        }`}
                      >
                        <Lock className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold capitalize">
                            تطبيق {app.key === "primary" ? "الأساسي (Primary)" : "النمو (Growth)"}
                          </h2>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              app.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                            }`}
                          >
                            {app.isActive ? "نشط" : "معطّل"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">key: {app.key}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditDialog(app)}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="تعديل الإعدادات"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-3 text-xs bg-muted/40 p-3.5 rounded-lg border border-border/50 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">App ID:</span>
                      <span className="font-semibold text-foreground select-all">{app.appId || "غير محدد"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">App Secret Ref:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{app.appSecretRef}</span>
                        {app.hasSecretConfigured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Check className="size-2.5" /> مضبوط بالبيئة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <AlertCircle className="size-2.5" /> ناقص
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Login Config ID:</span>
                      <span className="text-foreground select-all">{app.configId || "—"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Verify Token Ref:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground">{app.webhookVerifyTokenRef}</span>
                        {app.hasVerifyTokenConfigured && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Check className="size-2.5" /> مضبوط
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    {isPrimary ? (
                      <span>تطبيق الإنتاج الأساسي لكافة الحسابات</span>
                    ) : (
                      <span>مخصص لميزات النمو وحسابات Growth</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleActive(app.key, app.isActive)}
                    disabled={actionLoading === app.key}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      app.isActive
                        ? "border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    }`}
                  >
                    <Power className="size-3.5" />
                    {app.isActive ? "تعطيل التطبيق" : "تفعيل التطبيق"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Gating Information Card */}
      <div className="rounded-xl border border-border/70 bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500" />
          ميزات تتطلب تطبيق Growth (Gating Protocol)
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          في حال كان الاتصال على تطبيق Primary وحاول المستخدم الوصول لإحدى الميزات المتقدمة التالية، يرفض النظام الوصول بكود <code>REAUTH_REQUIRED</code> ويطلب إعادة ربط الصفحة على Growth:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
          <li className="p-2 rounded border border-border/60 bg-muted/30">✓ إعلانات النمو المتقدمة (Growth Ads)</li>
          <li className="p-2 rounded border border-border/60 bg-muted/30">✓ مساعد WhatsApp المشترك (Cross-Copilot)</li>
          <li className="p-2 rounded border border-border/60 bg-muted/30">✓ تحليل محادثات Messenger الذكي</li>
          <li className="p-2 rounded border border-border/60 bg-muted/30">✓ أتمتة الردود على المنشورات (Feed Bot)</li>
          <li className="p-2 rounded border border-border/60 bg-muted/30">✓ التخصيص التلقائي للإعلانات (Creative Opt)</li>
        </ul>
      </div>

      {/* Edit App Dialog */}
      {isDialogOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl" dir="rtl">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="font-semibold text-sm">
                تعديل إعدادات تطبيق {editingApp.key}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">App ID:</label>
                <input
                  type="text"
                  value={formAppId}
                  onChange={(e) => setFormAppId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  اسم مرجع السر (App Secret Env Ref):
                </label>
                <input
                  type="text"
                  value={formSecretRef}
                  onChange={(e) => setFormSecretRef(e.target.value)}
                  required
                  placeholder="مثال: FACEBOOK_APP_SECRET"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <span className="text-[10px] text-amber-500 mt-1 block">
                  * أدخل اسم متغير البيئة فقط، ممنوع إدخال السر الفعلي هنا.
                </span>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Login Config ID:</label>
                <input
                  type="text"
                  value={formConfigId}
                  onChange={(e) => setFormConfigId(e.target.value)}
                  placeholder="اختياري"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  اسم مرجع رمز تحقق الويب هوك (Verify Token Ref):
                </label>
                <input
                  type="text"
                  value={formVerifyTokenRef}
                  onChange={(e) => setFormVerifyTokenRef(e.target.value)}
                  placeholder="مثال: FACEBOOK_WEBHOOK_VERIFY_TOKEN"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="app-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-border text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="app-is-active" className="cursor-pointer">
                  التطبيق مفعل وجاهز للاستقبال
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "save"}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  {actionLoading === "save" ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookAppsManagement;
