import React from "react";
import {
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

interface MetaTosWarningBannerProps {
  tosErrorUrl: string | null;
  onDismiss: () => void;
}

export const MetaTosWarningBanner: React.FC<MetaTosWarningBannerProps> = ({
  tosErrorUrl,
  onDismiss,
}) => {
  if (!tosErrorUrl) return null;

  return (
    <div className="rounded-xl border border-amber-300/80 bg-amber-50/90 p-4 text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <h3 className="font-semibold text-amber-950">
            مطلوب قبول شروط الجماهير المخصصة (Meta TOS) لهذا الحساب
          </h3>
          <p className="mt-1 text-amber-800 leading-relaxed">
            تفرض سياسة Meta على مدير الحساب الإعلاني قبول اتفاقية شروط خدمة الجماهير المخصصة
            (Custom Audiences Terms of Service) مرة واحدة قبل السماح بإنشاء أو رفع قوائم العملاء عبر واجهة البرمجة (API).
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={tosErrorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors"
            >
              <span>قبول الشروط في مدير إعلانات Meta</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-amber-700 hover:text-amber-900 underline"
            >
              إخفاء التنبيه
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
