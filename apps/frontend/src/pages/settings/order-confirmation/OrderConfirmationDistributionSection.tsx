import { ROLE_OPTIONS } from "./types";

export interface OrderConfirmationDistributionSectionProps {
  distributionEnabled: boolean;
  distributionStrategy: string;
  eligibleRoles: string[];
  onToggleDistributionEnabled: () => void;
  onChangeStrategy: (strategy: string) => void;
  onToggleRole: (role: string) => void;
}

export function OrderConfirmationDistributionSection({
  distributionEnabled,
  distributionStrategy,
  eligibleRoles,
  onToggleDistributionEnabled,
  onChangeStrategy,
  onToggleRole,
}: OrderConfirmationDistributionSectionProps) {
  return (
    <div className="space-y-4">
      {/* Distribution Toggle Switch */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            تفعيل التوزيع التلقائي
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            عند التفعيل سيتم توزيع الطلبات المؤكدة تلقائياً على أعضاء الفريق المؤهلين.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={distributionEnabled}
          aria-label="تفعيل التوزيع التلقائي"
          onClick={onToggleDistributionEnabled}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 ${
            distributionEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
              distributionEnabled
                ? "translate-x-6 rtl:-translate-x-6"
                : "translate-x-1 rtl:-translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Strategy and Roles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200">
            طريقة التوزيع
          </label>
          <select
            value={distributionStrategy}
            onChange={(e) => onChangeStrategy(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="round_robin">توزيع متساوي (Round Robin)</option>
            <option value="by_region">حسب المنطقة</option>
            <option value="by_specialty">حسب المنتج</option>
            <option value="by_order_value">حسب قيمة الأوردر</option>
            <option value="by_workload">حسب العبء الحالي</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200">
            الأدوار المسموحة بالتوزيع
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role.value}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={eligibleRoles.includes(role.value)}
                  onChange={() => onToggleRole(role.value)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
