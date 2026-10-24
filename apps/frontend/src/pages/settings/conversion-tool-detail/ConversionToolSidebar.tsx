import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, Info, Sparkles } from "lucide-react";
import { STORE_CONVERSION_APP_LABELS } from "../storeConversionSettingsConfig";
import type {
  ConversionToolDefinition,
  ConversionToolMeta,
} from "../conversionToolMeta";
import { getDeepValue, ToggleSwitch } from "../useConversionTools";

interface ConversionToolSidebarProps {
  tool: ConversionToolDefinition;
  meta: ConversionToolMeta;
  toolLabel: string;
  toolBenefit: string;
  enabled: boolean;
  availability: { available: boolean; note?: string };
  saving: boolean;
  loading: boolean;
  savingToolKey: string | null;
  settings: Record<string, unknown>;
  onToggle: () => void;
  onFieldSave: (field: any, value: unknown) => void;
}

export const ConversionToolSidebar: React.FC<ConversionToolSidebarProps> = ({
  tool,
  meta,
  toolLabel,
  toolBenefit,
  enabled,
  availability,
  saving,
  loading,
  savingToolKey,
  settings,
  onToggle,
  onFieldSave,
}) => {
  const { t } = useTranslation();
  const Icon = meta.icon;

  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      {/* Tool Identity Card */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            {toolLabel}
          </h1>
          <p className="text-xs leading-6 text-gray-600 dark:text-gray-300">
            {toolBenefit}
          </p>
        </div>
        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black text-gray-600 dark:bg-gray-900 dark:text-gray-300">
          {STORE_CONVERSION_APP_LABELS[tool.appSlug]}
        </span>
      </div>

      {/* Tool State & Toggle */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              {t("storeConversionSettings.toolState")}
            </p>
            <p
              className={`text-[11px] font-black ${
                !availability.available
                  ? "text-amber-700 dark:text-amber-300"
                  : enabled
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {availability.available
                ? enabled
                  ? t("storeConversionSettings.enabled")
                  : t("storeConversionSettings.disabledLabel")
                : availability.note}
            </p>
          </div>
          <ToggleSwitch
            label={toolLabel}
            checked={enabled}
            disabled={!availability.available || saving || loading}
            onToggle={onToggle}
          />
        </div>

        {!enabled && availability.available ? (
          <p className="flex items-start gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-5 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t("storeConversionSettings.generalEnabledNote", {
              app: STORE_CONVERSION_APP_LABELS[tool.appSlug],
            })}
          </p>
        ) : null}

        {tool.key === "freeShippingBar" ? (
          <div className="rounded-lg bg-emerald-50/70 p-3 text-[11px] leading-5 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="font-bold">ملاحظة التزامن: </span>
            الحد المالي وحالة التفعيل هنا متزامنة تلقائيًا مع صفحة{" "}
            <Link
              to="/settings/store?tab=promotion"
              className="font-black underline underline-offset-2 hover:text-emerald-800"
            >
              إعدادات الترويج والشحن
            </Link>
            . أي تعديل في أي من المكانين يُطبَّق فورًا على المتجر.
          </div>
        ) : null}
      </div>

      {/* Bought Together Special Upsell Helper */}
      {tool.key === "boughtTogether" ? (
        <div className="space-y-3 rounded-xl border border-amber-200/90 bg-amber-50/80 p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-100">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>كيف يتم ربط وتحديد منتجات الباقة (Bought Together)؟</span>
          </div>
          <p className="text-[11px] leading-5 text-amber-800/90 dark:text-amber-300/90">
            تعرض هذه الأداة في المتجر باقة ترويجية جاهزة للمنتج مع خيارات تحديد القطع وزر إضافة الباقة دفعة واحدة. المنتجات المعروضة داخل الباقة يتم تحديدها من خلال <strong>ربط المنتجات التكميلية (Cross-sell / Related)</strong> لكل صنف في الكتالوج.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              to="/settings/upsell"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-amber-700 active:scale-95"
            >
              <span>إدارة وربط منتجات الباقات (Upsell Hub)</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 shadow-xs transition hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-900 dark:text-amber-200"
            >
              <span>كتالوج المنتجات</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Tool Actions */}
      {tool.actions?.length ? (
        <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          {tool.actions.map((action) => (
            <div key={action.to} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                    {action.label}
                  </h4>
                  {action.description ? (
                    <p className="text-[11px] leading-5 text-indigo-800/80 dark:text-indigo-300/80">
                      {action.description}
                    </p>
                  ) : null}
                </div>
                <Link
                  to={action.to}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-black text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
                >
                  <span>فتح</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Configuration Fields */}
      {tool.fields?.length ? (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {t("storeConversionSettings.fieldsTitle")}
          </p>
          {tool.fields.map((field) => {
            const fieldValue = getDeepValue(settings, field.path.split("."));
            const fieldSaving = savingToolKey === `${tool.key}:${field.key}`;

            return (
              <label key={field.key} className="block space-y-1.5">
                <span className="block text-xs font-black text-gray-800 dark:text-gray-100">
                  {t(`storeConversionSettings.field.${field.key}.label`, {
                    defaultValue: field.label,
                  })}
                </span>
                {field.description ? (
                  <span className="block text-[11px] leading-5 text-gray-500 dark:text-gray-400">
                    {t(`storeConversionSettings.field.${field.key}.description`, {
                      defaultValue: field.description,
                    })}
                  </span>
                ) : null}
                <span className="mt-1 flex items-center gap-2">
                  {field.type === "select" ? (
                    <select
                      defaultValue={String(fieldValue || field.options?.[0]?.value || "")}
                      disabled={!availability.available || loading || saving || fieldSaving}
                      onChange={(event) =>
                        onFieldSave(field, event.currentTarget.value)
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "text" ? (
                    <input
                      type="text"
                      defaultValue={String(fieldValue ?? "")}
                      placeholder={field.placeholder}
                      disabled={!availability.available || loading || saving || fieldSaving}
                      onBlur={(event) =>
                        onFieldSave(field, event.currentTarget.value)
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                  ) : (
                    <input
                      type="number"
                      min={field.min}
                      defaultValue={Number(fieldValue || 0)}
                      disabled={!availability.available || loading || saving || fieldSaving}
                      onBlur={(event) =>
                        onFieldSave(field, event.currentTarget.value)
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white tabular-nums font-mono"
                    />
                  )}
                  {field.suffix ? (
                    <span className="text-xs font-black text-gray-500 dark:text-gray-400">
                      {field.suffix}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
};
