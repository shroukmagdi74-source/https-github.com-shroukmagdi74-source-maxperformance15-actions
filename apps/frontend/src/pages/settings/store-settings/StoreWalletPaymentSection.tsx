import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  StorefrontSettings,
  storefrontSettingsService,
} from "../../../services/storefrontSettingsService";

const PAYMENT_CARD_CLS =
  "bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5 shadow-sm";
const PAYMENT_LABEL_CLS =
  "block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5";
const PAYMENT_INPUT_CLS =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-gray-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30";
const PAYMENT_PRIMARY_BTN_CLS =
  "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-600/20";

interface StoreWalletPaymentSectionProps {
  settings: StorefrontSettings;
  onChange: (settings: Partial<StorefrontSettings>) => void;
  loading: boolean;
}

export const StoreWalletPaymentSection: React.FC<StoreWalletPaymentSectionProps> = ({
  settings,
  onChange,
  loading,
}) => {
  const parseWalletSettings = (): {
    enabled: boolean;
    walletNumber: string;
    recipientName: string;
    instructions: string;
    discountEnabled: boolean;
    discountPercent: number;
    showDiscountBadge: boolean;
  } => {
    const raw = settings.walletPaymentSettings as
      | string
      | Record<string, unknown>
      | null
      | undefined;
    if (!raw) {
      return {
        enabled: false,
        walletNumber: "",
        recipientName: "",
        instructions: "",
        discountEnabled: false,
        discountPercent: 0,
        showDiscountBadge: true,
      };
    }
    const parsed =
      typeof raw === "string"
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return {};
            }
          })()
        : raw;
    return {
      enabled: parsed?.enabled === true,
      walletNumber: String(parsed?.walletNumber || ""),
      recipientName: String(parsed?.recipientName || ""),
      instructions: String(parsed?.instructions || ""),
      discountEnabled: parsed?.discountEnabled === true,
      discountPercent: Number(parsed?.discountPercent || 0),
      showDiscountBadge: parsed?.showDiscountBadge !== false,
    };
  };

  const parseEnabledMethods = (raw: unknown): string[] => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed.map(String) : ["cod"];
    } catch {
      return ["cod"];
    }
  };

  const computeIsWalletActive = (
    walletRaw: unknown,
    methodsRaw: unknown,
  ): boolean => {
    const parsedWallet =
      typeof walletRaw === "string"
        ? (() => {
            try {
              return JSON.parse(walletRaw);
            } catch {
              return {};
            }
          })()
        : (walletRaw as Record<string, unknown> | null | undefined);

    const methods = parseEnabledMethods(methodsRaw);

    if (parsedWallet?.enabled === false) {
      return false;
    }
    if (parsedWallet?.enabled === true) {
      return true;
    }
    return methods.includes("wallet");
  };

  const [form, setForm] = useState(parseWalletSettings);
  const [saving, setSaving] = useState(false);
  const [isWalletActive, setIsWalletActive] = useState<boolean>(() =>
    computeIsWalletActive(
      settings.walletPaymentSettings,
      settings.enabledPaymentMethods,
    ),
  );

  const [enabledMethods, setEnabledMethods] = useState<string[]>(
    parseEnabledMethods(settings.enabledPaymentMethods),
  );

  useEffect(() => {
    setForm(parseWalletSettings());
    const active = computeIsWalletActive(
      settings.walletPaymentSettings,
      settings.enabledPaymentMethods,
    );
    setIsWalletActive(active);
    const methods = parseEnabledMethods(settings.enabledPaymentMethods);
    setEnabledMethods(
      active
        ? Array.from(new Set([...methods, "wallet"]))
        : methods.filter((m) => m !== "wallet"),
    );
  }, [settings.walletPaymentSettings, settings.enabledPaymentMethods]);

  const update = (
    key: keyof typeof form,
    value: string | boolean | number,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleWallet = async () => {
    const nextActive = !isWalletActive;
    setIsWalletActive(nextActive);
    setForm((prev) => ({ ...prev, enabled: nextActive }));

    const nextMethods = nextActive
      ? Array.from(new Set([...enabledMethods, "wallet"]))
      : enabledMethods.filter((m) => m !== "wallet");
    setEnabledMethods(nextMethods);

    setSaving(true);
    try {
      const result = await storefrontSettingsService.updateSettings({
        walletPaymentSettings: { ...form, enabled: nextActive },
        enabledPaymentMethods: JSON.stringify(nextMethods),
      });
      if (result?.data) {
        onChange(result.data);
      }
      toast.success(
        nextActive
          ? "تم تفعيل طريقة الدفع بالمحفظة"
          : "تم إيقاف طريقة الدفع بالمحفظة",
      );
    } catch (error: any) {
      setIsWalletActive(!nextActive);
      setForm((prev) => ({ ...prev, enabled: !nextActive }));
      console.error("[WALLET-SETTINGS] Failed to toggle:", error);
      toast.error(
        "حدث خطأ أثناء تعديل حالة التفعيل: " +
          (error?.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextMethods = isWalletActive
        ? Array.from(new Set([...enabledMethods, "wallet"]))
        : enabledMethods.filter((m) => m !== "wallet");

      const result = await storefrontSettingsService.updateSettings({
        walletPaymentSettings: { ...form, enabled: isWalletActive },
        enabledPaymentMethods: JSON.stringify(nextMethods),
      });
      if (result?.data) {
        onChange(result.data);
      }
      toast.success("تم حفظ إعدادات الدفع بالمحفظة بنجاح");
    } catch (error: any) {
      console.error("[WALLET-SETTINGS] Failed to save:", error);
      toast.error(
        "حدث خطأ أثناء الحفظ: " + (error?.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={PAYMENT_CARD_CLS}>
      <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            تفعيل طريقة الدفع بالمحفظة
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            اظهر خيار «محفظة إلكترونية» للعملاء أثناء إتمام الطلب.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleWallet}
          disabled={saving || loading}
          aria-pressed={isWalletActive}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all select-none ${
            isWalletActive
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-600/10"
              : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:border-gray-500 dark:hover:bg-gray-700/40"
          }`}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isWalletActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isWalletActive ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <span>محفظة إلكترونية</span>
          <span
            className={`text-xs font-bold ${
              isWalletActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-400"
            }`}
          >
            {isWalletActive ? "مفعّل" : "غير مفعّل"}
          </span>
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          الدفع بالمحفظة (تحويل + رفع إيصال)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
          يظهر للعميل في صفحة الشيك أوت خيار تحويل المبلغ على رقم محفظة ثم رفع
          صورة الإيصال. فعّل خيار «محفظة إلكترونية» من الزرار بالأعلى، واكتب رقم
          المحفظة واسم المستلم.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={PAYMENT_LABEL_CLS}>
            رقم المحفظة (مثال: فودافون كاش)
          </label>
          <input
            type="text"
            value={form.walletNumber}
            onChange={(e) => update("walletNumber", e.target.value)}
            className={`${PAYMENT_INPUT_CLS} font-mono`}
            dir="ltr"
            placeholder="01xxxxxxxxx"
          />
        </div>
        <div>
          <label className={PAYMENT_LABEL_CLS}>اسم المستلم</label>
          <input
            type="text"
            value={form.recipientName}
            onChange={(e) => update("recipientName", e.target.value)}
            className={PAYMENT_INPUT_CLS}
            placeholder="مثال: سوان ستور"
          />
        </div>
      </div>

      <div>
        <label className={PAYMENT_LABEL_CLS}>
          تعليمات إضافية للعميل (اختياري)
        </label>
        <textarea
          value={form.instructions}
          onChange={(e) => update("instructions", e.target.value)}
          className={`${PAYMENT_INPUT_CLS} resize-none`}
          rows={3}
          placeholder="مثال: برجاء كتابة اسمك في خانة البيان عند التحويل"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className={PAYMENT_PRIMARY_BTN_CLS}
        >
          {saving ? "جارٍ الحفظ..." : "حفظ إعدادات المحفظة"}
        </button>
      </div>
    </div>
  );
};
