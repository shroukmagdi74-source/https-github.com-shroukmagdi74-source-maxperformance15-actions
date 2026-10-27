import React from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

interface PolicyFormState {
  minPayout: string;
  canCreateOrdersForOthers: boolean;
  canViewCustomerData: boolean;
}

interface AffiliateSettingsCardProps {
  commissionRate: string;
  setCommissionRate: (value: string) => void;
  saveCommission: () => Promise<void>;
  commissionType?: string | null;
  policyForm: PolicyFormState;
  setPolicyForm: React.Dispatch<React.SetStateAction<PolicyFormState>>;
  savePolicy: () => Promise<void>;
  saving: boolean;
}

export const AffiliateSettingsCard: React.FC<AffiliateSettingsCardProps> = ({
  commissionRate,
  setCommissionRate,
  saveCommission,
  commissionType,
  policyForm,
  setPolicyForm,
  savePolicy,
  saving,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <AdjustmentsHorizontalIcon className="h-5 w-5" />
        إعدادات المسوق
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            العمولة
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={commissionRate}
              onChange={(event) => setCommissionRate(event.target.value)}
              className="min-h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={() => void saveCommission()}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              حفظ
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            النوع: {commissionType === "MARKUP" ? "هامش ربح" : "نسبة"}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            الحد الأدنى للسحب
          </label>
          <input
            type="number"
            value={policyForm.minPayout}
            onChange={(event) =>
              setPolicyForm((current) => ({
                ...current,
                minPayout: event.target.value,
              }))
            }
            className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          إنشاء طلبات للعملاء
          <input
            type="checkbox"
            checked={policyForm.canCreateOrdersForOthers}
            onChange={(event) =>
              setPolicyForm((current) => ({
                ...current,
                canCreateOrdersForOthers: event.target.checked,
              }))
            }
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          عرض بيانات العملاء
          <input
            type="checkbox"
            checked={policyForm.canViewCustomerData}
            onChange={(event) =>
              setPolicyForm((current) => ({
                ...current,
                canViewCustomerData: event.target.checked,
              }))
            }
          />
        </label>

        <button
          onClick={() => void savePolicy()}
          disabled={saving}
          className="min-h-10 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          حفظ الضوابط
        </button>
      </div>
    </section>
  );
};
