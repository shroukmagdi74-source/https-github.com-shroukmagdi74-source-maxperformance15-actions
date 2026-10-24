import React from "react";
import { AlertCircle, Award, Star, TrendingUp, Users } from "lucide-react";
import { RatingSettings } from "./types";

interface RatingThresholdsCardProps {
  settings: RatingSettings;
  validationError: string | null;
  onChange: (key: keyof RatingSettings, value: number) => void;
}

export const RatingThresholdsCard: React.FC<RatingThresholdsCardProps> = ({
  settings,
  validationError,
  onChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-slate-400" />
          حدود التقييم الآلي للعملاء
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          تحديد نسب نجاح التسليم المطلوبة والحد الأدنى للطلبات لاحتساب مستوى العميل آلياً.
        </p>
      </div>

      {validationError && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Excellent */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" />
            ممتاز (Excellent)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">&ge;</span>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={settings.excellentThreshold}
              onChange={(e) =>
                onChange("excellentThreshold", parseFloat(e.target.value) || 0)
              }
              className="w-20 p-1 border dark:border-slate-600 rounded text-center font-bold text-emerald-900 dark:text-white dark:bg-slate-700 tabular-nums"
            />
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">%</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-700/80 dark:text-emerald-400">
            عدد الطلبات &ge; 10 ونسبة استلام &ge; {settings.excellentThreshold}%
          </p>
        </div>

        {/* Good */}
        <div className="bg-sky-50/70 dark:bg-sky-950/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800/50">
          <div className="flex items-center gap-2 mb-2 text-sky-800 dark:text-sky-300 font-bold text-sm">
            <Star className="h-4 w-4 text-sky-600" />
            جيد (Good)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">&ge;</span>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={settings.goodThreshold}
              onChange={(e) =>
                onChange("goodThreshold", parseFloat(e.target.value) || 0)
              }
              className="w-20 p-1 border dark:border-slate-600 rounded text-center font-bold text-sky-900 dark:text-white dark:bg-slate-700 tabular-nums"
            />
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">%</span>
          </div>
          <p className="mt-2 text-[11px] text-sky-700/80 dark:text-sky-400">
            عدد الطلبات &ge; 5 ونسبة استلام &ge; {settings.goodThreshold}%
          </p>
        </div>

        {/* Average */}
        <div className="bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/50">
          <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <Star className="h-4 w-4 text-amber-600" />
            متوسط (Average)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">&ge;</span>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={settings.averageThreshold}
              onChange={(e) =>
                onChange("averageThreshold", parseFloat(e.target.value) || 0)
              }
              className="w-20 p-1 border dark:border-slate-600 rounded text-center font-bold text-amber-900 dark:text-white dark:bg-slate-700 tabular-nums"
            />
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">%</span>
          </div>
          <p className="mt-2 text-[11px] text-amber-700/80 dark:text-amber-400">
            عدد الطلبات &ge; {settings.minOrdersForRating} ونسبة استلام &ge; {settings.averageThreshold}%
          </p>
        </div>

        {/* Min Orders */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            الحد الأدنى للطلبات
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">&ge;</span>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.minOrdersForRating}
              onChange={(e) =>
                onChange("minOrdersForRating", parseInt(e.target.value, 10) || 1)
              }
              className="w-20 p-1 border dark:border-slate-600 rounded text-center font-bold text-slate-900 dark:text-white dark:bg-slate-700 tabular-nums"
            />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              طلبات
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            أقل من هذا العدد يصنف كـ "جديد / غير مصنف"
          </p>
        </div>
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 rounded-b-xl">
        <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>قواعد الاحتساب الآلي في المنصة:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 ps-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <li>التقييم <strong>تلقائي 100%</strong> ومبني مباشرةً على تطابق شرطي (عدد المحاولات + نسبة الاستلام معاً).</li>
          <li>الطلبات الجزئية (تسليم جزئي أو استرجاع جزئي) تُوزن نسبياً بمقدار 50% تسليم و50% محاولة.</li>
          <li>حالات الضياع في الشحن (LOST) واسترجاع المتجر (REFUNDED) لا تُخصم من نسبة استلام العميل افتراضياً.</li>
          <li>يتم تحديث التقييم آلياً وفورياً عند تسليم الطلبات أو استرجاعها وبواسطة Webhooks شركات الشحن.</li>
          <li>عند حفظ الإعدادات، يتم تحديث تصنيف كافة العملاء تلقائياً في الخلفية بدون الحاجة لأي تدخل يدوي.</li>
        </ul>
      </div>
    </div>
  );
};
