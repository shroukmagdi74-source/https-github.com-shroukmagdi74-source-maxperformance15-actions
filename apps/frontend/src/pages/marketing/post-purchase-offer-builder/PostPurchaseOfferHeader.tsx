import React from "react";
import { Loader2, Save, Settings2, BarChart3 } from "lucide-react";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";

interface PostPurchaseOfferHeaderProps {
  offer: PostPurchaseOfferConfig;
  saving: boolean;
  lastSavedAt: Date | null;
  activeTab: "builder" | "analytics";
  setActiveTab: (tab: "builder" | "analytics") => void;
  onSave: () => void;
}

export const PostPurchaseOfferHeader: React.FC<PostPurchaseOfferHeaderProps> = ({
  offer,
  saving,
  lastSavedAt,
  activeTab,
  setActiveTab,
  onSave,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              One-Click Upsell Engine
            </span>
            {offer.enabled ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                العرض نشط في المتجر
              </span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                العرض متوقف حالياً
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            أداة العرض الخاص بعد الطلب (Post-Purchase Offer)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl text-pretty">
            صمم صفحة عرض خاص لمرة واحدة تظهر للمشتري مباشرة بعد الضغط على تأكيد الطلب وقبل صفحة الشكر، لزيادة متوسط قيمة الطلب (AOV) بدون أي مخاطرة على الطلب الأصلي.
          </p>
        </div>

        {activeTab === "builder" && (
          <div className="flex items-center gap-3">
            {lastSavedAt && (
              <span className="text-xs text-muted-foreground hidden lg:inline tabular-nums">
                آخر حفظ: {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Switcher: Builder vs Analytics */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("builder")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 ${
            activeTab === "builder"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>الإعدادات وتصميم العرض</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 ${
            activeTab === "analytics"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>التحليلات والأداء</span>
        </button>
      </div>
    </div>
  );
};
