import { useTranslation } from "react-i18next";
import { Check, ChevronDown, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getNumericValue } from "../components/settingsPageUtils";
import { PromoSection } from "./PromoSection";
import { StatusPill } from "./StatusPill";
import { MAX_FEE, type FlatShippingSettings } from "./types";

export interface FlatShippingSectionProps {
  flatShippingSettings: FlatShippingSettings;
  feeError: boolean;
  onUpdateFlat: (patch: Partial<FlatShippingSettings>) => void;
  setFeeError: (hasError: boolean) => void;
}

export function FlatShippingSection({
  flatShippingSettings,
  feeError,
  onUpdateFlat,
  setFeeError,
}: FlatShippingSectionProps) {
  const { t } = useTranslation();
  const { flatShippingEnabled, flatShippingFee } = flatShippingSettings;
  const lockedFieldsClass = "bg-slate-50/50 cursor-not-allowed";

  return (
    <PromoSection
      icon={PackageCheck}
      title={t("promotionSettings.flatShippingTitle")}
      description={t("promotionSettings.flatShippingDesc")}
      isOn={flatShippingEnabled}
      accentClassName={{
        sectionBorder: "border-sky-200/80",
        iconActive: "bg-sky-50 text-sky-700 ring-sky-200/70",
      }}
      pill={
        <StatusPill
          active={flatShippingEnabled}
          activeLabel={t("promotionSettings.pillActive")}
          inactiveLabel={t("promotionSettings.pillInactive")}
        />
      }
      switchChecked={flatShippingEnabled}
      onSwitchChange={(checked) => onUpdateFlat({ flatShippingEnabled: checked })}
      switchLabel={t("promotionSettings.flatShippingEnabledLabel")}
    >
      <fieldset
        disabled={!flatShippingEnabled}
        className={cn("grid gap-4 lg:grid-cols-[minmax(0,264px)_minmax(0,1fr)]")}
      >
        <div className="space-y-2">
          <Label
            htmlFor="flatShippingFee"
            className="text-sm font-semibold text-slate-900 dark:text-slate-200"
          >
            {t("promotionSettings.flatShippingFee")}
          </Label>
          <div className="relative">
            <Input
              id="flatShippingFee"
              type="number"
              min={0}
              max={MAX_FEE}
              inputMode="numeric"
              value={flatShippingFee}
              onChange={(event) => {
                const next = getNumericValue(event.target.value);
                setFeeError(next > MAX_FEE);
                onUpdateFlat({ flatShippingFee: next });
              }}
              onBlur={() => {
                if (flatShippingFee > MAX_FEE) {
                  setFeeError(false);
                  onUpdateFlat({ flatShippingFee: MAX_FEE });
                }
              }}
              aria-invalid={feeError}
              aria-describedby="flatShippingFeeHint flatShippingFeeError"
              className={cn(
                "h-11 rounded-xl bg-white/90 font-semibold tabular-nums ltr:pr-14 rtl:pl-14 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
                !flatShippingEnabled && lockedFieldsClass,
                feeError && "border-rose-300 focus-visible:ring-rose-200",
              )}
            />
            <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 ltr:right-3 rtl:left-3 dark:bg-slate-800 dark:text-slate-300">
              {t("promotionSettings.currency")}
            </span>
          </div>
          <p
            id="flatShippingFeeHint"
            className="text-xs leading-5 text-slate-500 dark:text-slate-400"
          >
            {t("promotionSettings.flatShippingFeeDesc")}
          </p>
          {feeError ? (
            <p
              id="flatShippingFeeError"
              className="text-xs font-bold text-rose-700 dark:text-rose-400"
            >
              {t("promotionSettings.feeMaxError")}
            </p>
          ) : null}
        </div>

        <details className="group rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-slate-950 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
            <ChevronDown className="size-4 text-slate-500 transition-transform group-open:rotate-180 dark:text-slate-400" />
            {t("promotionSettings.flatShippingWhenToUse")}
          </summary>
          <ul className="mt-2 space-y-1.5">
            <li className="flex gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <Check className="mt-1 size-4 shrink-0 text-sky-700 dark:text-sky-400" />
              {t("promotionSettings.flatShippingUseCase1")}
            </li>
            <li className="flex gap-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <Check className="mt-1 size-4 shrink-0 text-sky-700 dark:text-sky-400" />
              {t("promotionSettings.flatShippingUseCase2")}
            </li>
          </ul>
        </details>
      </fieldset>
    </PromoSection>
  );
}
