import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, Gift, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getNumericValue } from "../components/settingsPageUtils";
import { PromoSection } from "./PromoSection";
import { StatusPill } from "./StatusPill";
import { AMOUNT_TOKEN, MAX_THRESHOLD, type FreeShippingSettings } from "./types";

export interface FreeShippingSectionProps {
  freeShippingSettings: FreeShippingSettings;
  thresholdError: boolean;
  preview: { live: boolean; text: string };
  onUpdateFree: (patch: Partial<FreeShippingSettings>) => void;
  setThresholdError: (hasError: boolean) => void;
  insertAmountToken: () => void;
}

export function FreeShippingSection({
  freeShippingSettings,
  thresholdError,
  preview,
  onUpdateFree,
  setThresholdError,
  insertAmountToken,
}: FreeShippingSectionProps) {
  const { t } = useTranslation();
  const { freeShippingEnabled, freeShippingThreshold, freeShippingMessage } =
    freeShippingSettings;

  const msgHelpParts = t("promotionSettings.freeShippingMessageDesc").split(
    AMOUNT_TOKEN,
  );
  const lockedFieldsClass = "bg-slate-50/50 cursor-not-allowed";

  return (
    <PromoSection
      icon={Gift}
      title={t("promotionSettings.freeShipping")}
      description={t("promotionSettings.freeShippingDesc")}
      isOn={freeShippingEnabled}
      accentClassName={{
        sectionBorder: "border-emerald-200/80",
        iconActive: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      }}
      pill={
        <StatusPill
          active={freeShippingEnabled}
          activeLabel={t("promotionSettings.pillActive")}
          inactiveLabel={t("promotionSettings.pillInactive")}
        />
      }
      switchChecked={freeShippingEnabled}
      onSwitchChange={(checked) => onUpdateFree({ freeShippingEnabled: checked })}
      switchLabel={t("promotionSettings.freeShippingTitle")}
    >
      <fieldset
        disabled={!freeShippingEnabled}
        className={cn("grid gap-4 lg:grid-cols-[minmax(0,264px)_minmax(0,1fr)]")}
      >
        <div className="space-y-2">
          <Label
            htmlFor="freeShippingThreshold"
            className="text-sm font-semibold text-slate-900 dark:text-slate-200"
          >
            {t("promotionSettings.freeShippingThreshold")}
          </Label>
          <div className="relative">
            <Input
              id="freeShippingThreshold"
              type="number"
              min={0}
              max={MAX_THRESHOLD}
              inputMode="numeric"
              value={freeShippingThreshold}
              onChange={(event) => {
                const next = getNumericValue(event.target.value);
                setThresholdError(next > MAX_THRESHOLD);
                onUpdateFree({ freeShippingThreshold: next });
              }}
              onBlur={() => {
                if (freeShippingThreshold > MAX_THRESHOLD) {
                  setThresholdError(false);
                  onUpdateFree({ freeShippingThreshold: MAX_THRESHOLD });
                }
              }}
              aria-invalid={thresholdError}
              aria-describedby="freeShippingThresholdHint freeShippingThresholdError"
              className={cn(
                "h-11 rounded-xl bg-white/90 font-semibold tabular-nums ltr:pr-14 rtl:pl-14 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
                !freeShippingEnabled && lockedFieldsClass,
                thresholdError && "border-rose-300 focus-visible:ring-rose-200",
              )}
            />
            <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 ltr:right-3 rtl:left-3 dark:bg-slate-800 dark:text-slate-300">
              {t("promotionSettings.currency")}
            </span>
          </div>
          <p
            id="freeShippingThresholdHint"
            className="text-xs leading-5 text-slate-500 dark:text-slate-400"
          >
            {t("promotionSettings.freeShippingThresholdDesc")}
          </p>
          {thresholdError ? (
            <p
              id="freeShippingThresholdError"
              className="text-xs font-bold text-rose-700 dark:text-rose-400"
            >
              {t("promotionSettings.thresholdMaxError")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="freeShippingMessage"
            className="text-sm font-semibold text-slate-900 dark:text-slate-200"
          >
            {t("promotionSettings.freeShippingMessage")}
          </Label>
          <Textarea
            id="freeShippingMessage"
            rows={3}
            value={freeShippingMessage}
            onChange={(event) =>
              onUpdateFree({ freeShippingMessage: event.target.value })
            }
            className={cn(
              "min-h-[104px] rounded-xl border-slate-200 bg-white/90 text-sm font-semibold leading-7 text-slate-950 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
              !freeShippingEnabled && lockedFieldsClass,
            )}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={insertAmountToken}
              className="rounded-lg border-dashed text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Plus className="size-3.5" />
              {t("promotionSettings.insertToken")}
            </Button>
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              {msgHelpParts[0]}
              <code
                className="mx-1 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                dir="ltr"
              >
                {AMOUNT_TOKEN}
              </code>
              {msgHelpParts[1]}
            </p>
          </div>
        </div>
      </fieldset>

      {/* Live Storefront Bar Preview */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t("promotionSettings.previewTitle")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("promotionSettings.previewNote")}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-colors",
            preview.live
              ? "border-slate-950 bg-slate-950 text-white dark:border-slate-800 dark:bg-slate-900"
              : "border-dashed border-slate-300 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400",
          )}
        >
          <Truck className="size-4 shrink-0" />
          <p className="flex-1 text-sm font-semibold leading-6" dir="auto">
            {preview.text}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
              preview.live
                ? "bg-white/15 text-slate-200"
                : "bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
            )}
          >
            {t("promotionSettings.storeBadge")}
          </span>
        </div>
      </div>

      {/* Sync with Free Shipping Bar Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-200">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-2 rounded-full",
              freeShippingEnabled ? "bg-emerald-600 animate-pulse" : "bg-slate-400",
            )}
          />
          <span className="font-semibold leading-5">
            {freeShippingEnabled
              ? "شريط الشحن المجاني مفعّل ومتزامن تلقائيًا على المتجر (الرئيسية، صفحة المنتج، السلة، وإتمام الطلب) بنفس الحد."
              : "تفعيل الشحن المجاني هنا يُشغّل شريط الشحن المجاني تلقائيًا على المتجر ويزامن الحد المالي في كل الصفحات."}
          </span>
        </div>
        <Link
          to="/settings/store/tools/freeShippingBar"
          className="inline-flex items-center gap-1.5 font-bold text-emerald-800 underline underline-offset-4 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          <span>تخصيص أداة شريط الشحن المجاني</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </PromoSection>
  );
}
