import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, Check } from "lucide-react";

export interface CampaignQuickViewFooterProps {
  isEn: boolean;
  fullDetailsUrl: string;
  saving: boolean;
  onClose: () => void;
  onSaveChanges: () => void;
}

export const CampaignQuickViewFooter: React.FC<CampaignQuickViewFooterProps> = ({
  isEn,
  fullDetailsUrl,
  saving,
  onClose,
  onSaveChanges,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/90 bg-slate-50/70 px-4 py-3 sm:px-6 dark:border-slate-800/90 dark:bg-slate-900/50">
      <Link
        to={fullDetailsUrl}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <span>
          {isEn ? "Open Full Campaign Studio Page" : "الانتقال لصفحة استوديو الحملة الكاملة"}
        </span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {isEn ? "Close" : "إغلاق"}
        </button>

        <button
          type="button"
          onClick={onSaveChanges}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 active:scale-[0.97] disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{isEn ? "Saving..." : "جاري الحفظ..."}</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{isEn ? "Save Changes" : "حفظ التعديلات"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
