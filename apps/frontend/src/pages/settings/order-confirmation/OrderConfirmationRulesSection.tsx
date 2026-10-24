import {
  CONFIRM_TARGET_STATUS_OPTIONS,
  MATCH_MODE_OPTIONS,
  REQUIRE_STATUS_OPTIONS,
  SOURCE_OPTIONS,
} from "./types";

export interface OrderConfirmationRulesSectionProps {
  enabled: boolean;
  requireSourceTypes: string[];
  requireStatuses: string[];
  requireMatchMode: string;
  confirmStatus: string;
  onToggleEnabled: () => void;
  onToggleArrayValue: (key: "requireSourceTypes" | "requireStatuses", value: string) => void;
  onChangeMatchMode: (mode: string) => void;
  onChangeConfirmStatus: (status: string) => void;
}

export function OrderConfirmationRulesSection({
  enabled,
  requireSourceTypes,
  requireStatuses,
  requireMatchMode,
  confirmStatus,
  onToggleEnabled,
  onToggleArrayValue,
  onChangeMatchMode,
  onChangeConfirmStatus,
}: OrderConfirmationRulesSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 space-y-5">
      {/* Switch Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            تفعيل التأكيد
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            عند التفعيل سيتم إظهار الطلبات التي تطابق القواعد أدناه في طابور التأكيد.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="تفعيل التأكيد"
          onClick={onToggleEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 ${
            enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
              enabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Sources Checkboxes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
          مصادر تحتاج تأكيد
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {SOURCE_OPTIONS.map((source) => (
            <label
              key={source.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                checked={requireSourceTypes.includes(source.value)}
                onChange={() => onToggleArrayValue("requireSourceTypes", source.value)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{source.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Require Statuses Checkboxes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
          حالات تحتاج تأكيد (طابور التأكيد)
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {REQUIRE_STATUS_OPTIONS.map((status) => (
            <label
              key={status.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <input
                type="checkbox"
                checked={requireStatuses.includes(status.value)}
                onChange={() => onToggleArrayValue("requireStatuses", status.value)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{status.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          الطلبات التي ما زالت في مرحلة التأكيد فقط (يُستبعد تلقائياً أي طلب تم شحنه أو تسليمه أو إلغاؤه).
        </p>
      </div>

      {/* Match Mode Radio Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
          طريقة المطابقة
        </h4>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {MATCH_MODE_OPTIONS.map((mode) => {
            const isSelected = (requireMatchMode || "any") === mode.value;
            return (
              <label
                key={mode.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-950/20"
                    : "border-slate-200/80 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                }`}
              >
                <input
                  type="radio"
                  name="matchMode"
                  checked={isSelected}
                  onChange={() => onChangeMatchMode(mode.value)}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {mode.label}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {mode.description}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          اختر &quot;مطابقة أي شرط&quot; لعرض الطلبات التي تطابق المصدر أو الحالة، أو &quot;مطابقة كل الشروط&quot; لفرض تطابق الاثنين معاً.
        </p>
      </div>

      {/* Target Status Select */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200">
            الحالة بعد التأكيد
          </label>
          <select
            value={confirmStatus}
            onChange={(e) => onChangeConfirmStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {CONFIRM_TARGET_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
            {!CONFIRM_TARGET_STATUS_OPTIONS.some(
              (status) => status.value === confirmStatus,
            ) && <option value={confirmStatus}>{confirmStatus}</option>}
          </select>
        </div>
      </div>
    </div>
  );
}
