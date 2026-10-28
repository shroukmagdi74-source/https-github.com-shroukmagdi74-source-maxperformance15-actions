import React from "react";
import { EyeIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";

export interface StudioViewerBannerProps {
  reason?: string;
  onRequestPermission?: () => void;
}

export const StudioViewerBanner: React.FC<StudioViewerBannerProps> = ({
  reason,
  onRequestPermission,
}) => {
  return (
    <div
      data-testid="studio-viewer-banner"
      role="alert"
      className="sticky top-[50px] sm:top-[52px] z-40 flex items-center justify-between border-b border-amber-500/40 bg-[#1c1811] px-3 py-1.5 text-xs text-amber-200 shadow-xs"
    >
      <div className="flex items-center gap-2 overflow-hidden truncate">
        <EyeIcon className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="font-bold text-amber-300">أنت في وضع المشاهدة</span>
        <span className="hidden sm:inline text-[11.5px] text-amber-200/80">
          — أدوات التحرير والحفظ معطّلة. يمكنك معاينة الأقسام وتصفح الصفحات فقط.
        </span>
        {reason && (
          <span className="hidden md:inline rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] text-amber-400 border border-amber-800/40">
            {reason}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-testid="studio-request-permission-btn"
          onClick={onRequestPermission}
          className="flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30 active:scale-95 transition-all"
          title="طلب صلاحية تحرير المتجر من الإدارة"
        >
          <ShieldExclamationIcon className="h-3.5 w-3.5 text-amber-400" />
          <span>طلب صلاحية</span>
        </button>
      </div>
    </div>
  );
};
