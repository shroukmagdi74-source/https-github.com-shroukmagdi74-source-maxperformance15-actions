import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import {
  StorefrontSettings,
  storefrontSettingsService,
} from "../../../services/storefrontSettingsService";
import {
  KashierGatewayConfig,
  StoreKashierCredentialsCard,
} from "./StoreKashierCredentialsCard";

const PAYMENT_CARD_CLS =
  "bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5 shadow-sm";
const PAYMENT_PRIMARY_BTN_CLS =
  "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-600/20";

interface StorePaymentGatewaySectionProps {
  settings: StorefrontSettings;
  onChange: (settings: Partial<StorefrontSettings>) => void;
  loading: boolean;
}

export const StorePaymentGatewaySection: React.FC<StorePaymentGatewaySectionProps> = ({
  settings,
  onChange,
  loading,
}) => {
  const [gatewayConfig, setGatewayConfig] = useState<KashierGatewayConfig>({
    merchantId: "",
    apiKey: "",
    secretKey: "",
    mode: "test",
  });

  const [isEditing, setIsEditing] = useState(false);

  const parseEnabledMethods = (raw: unknown): string[] => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed.map(String) : ["cod"];
    } catch {
      return ["cod"];
    }
  };

  const [enabledMethods, setEnabledMethods] = useState<string[]>(
    parseEnabledMethods(settings.enabledPaymentMethods),
  );

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "testing"
  >("disconnected");
  const [testMessage, setTestMessage] = useState("");
  const [togglingMethod, setTogglingMethod] = useState<string | null>(null);

  const isConfigured = Boolean(
    gatewayConfig.merchantId &&
      gatewayConfig.apiKey &&
      gatewayConfig.secretKey,
  );

  useEffect(() => {
    if (settings.paymentGatewayConfig) {
      const config =
        typeof settings.paymentGatewayConfig === "string"
          ? JSON.parse(settings.paymentGatewayConfig)
          : settings.paymentGatewayConfig;
      setGatewayConfig({
        merchantId: config.merchantId || "",
        apiKey: config.apiKey || "",
        secretKey: config.secretKey || "",
        mode: config.mode || "test",
      });
    }
    if (settings.enabledPaymentMethods) {
      setEnabledMethods(parseEnabledMethods(settings.enabledPaymentMethods));
    }
    const config = settings.paymentGatewayConfig
      ? typeof settings.paymentGatewayConfig === "string"
        ? JSON.parse(settings.paymentGatewayConfig)
        : settings.paymentGatewayConfig
      : null;
    const hasConfigLoaded = Boolean(
      config && config.merchantId && config.apiKey && config.secretKey,
    );
    setConnectionStatus(hasConfigLoaded ? "connected" : "disconnected");
    setIsEditing(!hasConfigLoaded);
  }, [settings]);

  const handleConfigChange = (key: string, value: string) => {
    setGatewayConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleMethodToggle = async (method: string) => {
    const isCurrentlyOn = enabledMethods.includes(method);
    const nextMethods = isCurrentlyOn
      ? enabledMethods.filter((m) => m !== method)
      : Array.from(new Set([...enabledMethods, method]));

    setEnabledMethods(nextMethods);
    setTogglingMethod(method);

    try {
      const result = await storefrontSettingsService.updateSettings({
        enabledPaymentMethods: JSON.stringify(nextMethods),
      });
      if (result?.data) {
        onChange(result.data);
      }
      const isNowActive = nextMethods.includes(method);
      const methodLabel =
        method === "cod"
          ? "الدفع عند الاستلام"
          : method === "card"
          ? "بطاقة ائتمان / خصم"
          : method;
      toast.success(
        isNowActive
          ? `تم تفعيل ${methodLabel} بنجاح`
          : `تم إيقاف ${methodLabel} بنجاح`,
      );
    } catch (error: any) {
      setEnabledMethods(enabledMethods);
      console.error("[PAYMENT-SETTINGS] Failed to toggle method:", error);
      toast.error(
        "حدث خطأ أثناء تعديل طريقة الدفع: " +
          (error?.message || error?.response?.data?.message || "خطأ غير معروف"),
      );
    } finally {
      setTogglingMethod(null);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من رغبتك في إزالة إعدادات بوابة الدفع؟ سيؤدي ذلك إلى تعطيل الدفع الإلكتروني.",
      )
    ) {
      return;
    }

    const remainingMethods = enabledMethods.filter((m) => m !== "card");
    const updatedSettings = {
      paymentGatewayConfig: null,
      enabledPaymentMethods: JSON.stringify(remainingMethods),
    };

    try {
      const result =
        await storefrontSettingsService.updateSettings(updatedSettings);
      if (result?.data) {
        onChange(result.data);
        setGatewayConfig({
          merchantId: "",
          apiKey: "",
          secretKey: "",
          mode: "test",
        });
        setEnabledMethods(remainingMethods);
        setIsEditing(true);
      }
      tToast.success("StoreSettings.msg_126b");
    } catch (error: any) {
      console.error("[DELETE] Failed to delete settings:", error);
      toast.error("حدث خطأ أثناء الحذف: " + (error?.message || "Unknown error"));
    }
  };

  const handleSave = async () => {
    const merchantId = gatewayConfig.merchantId.trim();
    const apiKey = gatewayConfig.apiKey.trim();
    const secretKey = gatewayConfig.secretKey.trim();
    const hasAnyCred = Boolean(merchantId || apiKey || secretKey);

    if (hasAnyCred) {
      if (merchantId.includes("@")) {
        toast.error(
          "Merchant ID غير صحيح (يبدو أنك أدخلت بريداً إلكترونياً، الـ Merchant ID الخاص بكاشير يكون مثل MID-XXXX-XXX).",
        );
        return;
      }
      if (!merchantId || !apiKey || !secretKey) {
        toast.error(
          "يرجى إدخال جميع بيانات الاعتماد (Merchant ID و API Key و Secret Key) من لوحة تحكم Kashier، أو مسحها جميعاً للاعتماد على البوابة المركزية.",
        );
        return;
      }
    }

    const updatedSettings: Record<string, unknown> = {
      enabledPaymentMethods: JSON.stringify(enabledMethods),
      paymentGatewayConfig: hasAnyCred
        ? {
            merchantId,
            apiKey,
            secretKey,
            mode: gatewayConfig.mode,
          }
        : null,
    };

    try {
      const result =
        await storefrontSettingsService.updateSettings(updatedSettings);
      if (result?.data) {
        onChange({
          ...result.data,
          paymentGatewayConfig:
            (updatedSettings.paymentGatewayConfig as any) ||
            result.data.paymentGatewayConfig,
        });
        setIsEditing(false);
      }
      toast.success("تم حفظ إعدادات بوابة الدفع بنجاح");
    } catch (error: any) {
      console.error("[SAVE] Failed to save payment gateway settings:", error);
      toast.error(
        "حدث خطأ أثناء الحفظ: " +
          (error?.message ||
            error?.response?.data?.message ||
            "Unknown error"),
      );
    }
  };

  const testConnection = async () => {
    if (!isConfigured) {
      setTestMessage("أكمل البيانات أولاً");
      return;
    }

    setConnectionStatus("testing");
    setTestMessage("جاري الاختبار...");

    try {
      const response = await fetch("/api/v1/payment/kashier/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(gatewayConfig),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { error: "Invalid JSON response" };
      }

      if (response.ok && data.success) {
        setConnectionStatus("connected");
        setTestMessage("تم الاتصال بنجاح!");
      } else {
        setConnectionStatus("disconnected");
        setTestMessage(data.error || data.message || responseText || "فشل الاتصال");
      }
    } catch (error: any) {
      console.error("[TEST] Error:", error);
      setConnectionStatus("disconnected");
      setTestMessage(`خطأ: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              إعدادات بوابة الدفع - Kashier
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                connectionStatus === "connected"
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  : connectionStatus === "testing"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              }`}
            >
              {connectionStatus === "connected" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  متصل
                </>
              )}
              {connectionStatus === "testing" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  جاري الاختبار...
                </>
              )}
              {connectionStatus === "disconnected" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  غير متصل
                </>
              )}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            أدخل مفاتيح Kashier لتفعيل الدفع بالبطاقات في متجرك.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {isConfigured && connectionStatus !== "testing" && (
            <button
              onClick={testConnection}
              disabled={connectionStatus === "testing" || loading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-700 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {connectionStatus === "testing"
                ? "جاري الاختبار..."
                : "اختبار الاتصال"}
            </button>
          )}
        </div>
      </div>

      {/* COD Toggle Card */}
      <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            تفعيل الدفع عند الاستلام (كاش)
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            إظهار خيار «الدفع نقدًا عند الاستلام» للعملاء أثناء إتمام الطلب في المتجر.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleMethodToggle("cod")}
          disabled={loading || togglingMethod === "cod"}
          aria-pressed={enabledMethods.includes("cod")}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all select-none disabled:opacity-60 ${
            enabledMethods.includes("cod")
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-600/10"
              : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:border-gray-500 dark:hover:bg-gray-700/40"
          }`}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enabledMethods.includes("cod")
                ? "bg-emerald-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabledMethods.includes("cod")
                  ? "translate-x-4"
                  : "translate-x-0.5"
              }`}
            />
          </span>
          <span>الدفع عند الاستلام</span>
          <span
            className={`text-xs font-bold ${
              enabledMethods.includes("cod")
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-400"
            }`}
          >
            {togglingMethod === "cod"
              ? "جارٍ التحديث..."
              : enabledMethods.includes("cod")
              ? "مفعّل"
              : "غير مفعّل"}
          </span>
        </button>
      </div>

      {testMessage && (
        <div
          className={`flex items-center gap-2 text-sm ${
            connectionStatus === "connected"
              ? "text-green-600 dark:text-green-400"
              : connectionStatus === "disconnected"
              ? "text-red-600 dark:text-red-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {connectionStatus === "connected" ? (
            <CheckCircleIcon className="h-4 w-4 shrink-0" />
          ) : connectionStatus === "disconnected" ? (
            <XCircleIcon className="h-4 w-4 shrink-0" />
          ) : null}
          <span>{testMessage}</span>
        </div>
      )}

      {/* Credentials Card (Edit / View) */}
      <StoreKashierCredentialsCard
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isConfigured={isConfigured}
        gatewayConfig={gatewayConfig}
        handleConfigChange={handleConfigChange}
        handleDelete={handleDelete}
      />

      {/* Enabled Card Payment Method */}
      <div className={PAYMENT_CARD_CLS}>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            طرق الدفع المفعّلة
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            حدد الطرق التي ستظهر للعملاء أثناء إتمام الطلب.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {["card"].map((method) => {
            const isOn = enabledMethods.includes(method);
            const methodLabel = "بطاقة ائتمان / خصم";
            return (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodToggle(method)}
                disabled={loading || togglingMethod === method}
                aria-pressed={isOn}
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all select-none disabled:opacity-60 ${
                  isOn
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-600/10"
                    : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:border-gray-500 dark:hover:bg-gray-700/40"
                }`}
              >
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isOn ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOn ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
                <span>{methodLabel}</span>
                <span
                  className={`text-xs font-bold ${
                    isOn
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400"
                  }`}
                >
                  {togglingMethod === method
                    ? "جارٍ التحديث..."
                    : isOn
                    ? "مفعّل"
                    : "غير مفعّل"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          اختر طرق الدفع التي تريد إظهارها للعملاء.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        {isEditing && isConfigured && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={PAYMENT_PRIMARY_BTN_CLS}
        >
          {loading ? "جاري الحفظ..." : "حفظ إعدادات البوابة"}
        </button>
      </div>
    </div>
  );
};
