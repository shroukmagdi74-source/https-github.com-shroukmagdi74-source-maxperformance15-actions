import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "../../../services/apiClient";
import { storefrontSettingsService } from "../../../services/storefrontSettingsService";
import type { SettingsStatusMessage } from "../components/SettingsPagePrimitives";
import {
  getApiErrorMessage,
  getNumericValue,
} from "../components/settingsPageUtils";
import {
  AMOUNT_TOKEN,
  formatAmount,
  type FlatShippingSettings,
  type FreeShippingSettings,
  type SaveState,
} from "./types";

export function usePromotionSettingsController() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<SettingsStatusMessage | null>(null);

  const [freeShippingSettings, setFreeShippingSettings] =
    useState<FreeShippingSettings>({
      freeShippingEnabled: false,
      freeShippingThreshold: 0,
      freeShippingMessage: t("promotionSettings.defaultFreeMessage"),
    });
  const [flatShippingSettings, setFlatShippingSettings] =
    useState<FlatShippingSettings>({
      flatShippingEnabled: false,
      flatShippingFee: 0,
    });
  const [hideUtilityBar, setHideUtilityBar] = useState(false);

  const [thresholdError, setThresholdError] = useState(false);
  const [feeError, setFeeError] = useState(false);

  const loadedRef = useRef(false);
  const saveTimersRef = useRef<{ save?: number; idle?: number }>({});
  const stateRef = useRef({ freeShippingSettings, flatShippingSettings });
  stateRef.current = { freeShippingSettings, flatShippingSettings };

  const scheduleIdle = useCallback(() => {
    clearTimeout(saveTimersRef.current.idle);
    saveTimersRef.current.idle = window.setTimeout(
      () => setSaveState("idle"),
      2600,
    );
  }, []);

  const flushSettings = useCallback(async () => {
    try {
      const { freeShippingSettings: free, flatShippingSettings: flat } =
        stateRef.current;
      await apiClient.post("/promotion-settings", { ...free, ...flat });
      setSaveState("saved");
      scheduleIdle();
    } catch (error) {
      setSaveState("idle");
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, t("promotionSettings.settingsSaveFailed")),
      });
    }
  }, [scheduleIdle, t]);

  const queueSave = useCallback(() => {
    if (!loadedRef.current) return;
    setSaveState("saving");
    clearTimeout(saveTimersRef.current.save);
    saveTimersRef.current.save = window.setTimeout(() => {
      void flushSettings();
    }, 650);
  }, [flushSettings]);

  useEffect(
    () => () => {
      clearTimeout(saveTimersRef.current.save);
      clearTimeout(saveTimersRef.current.idle);
    },
    [],
  );

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsResult, sfResult] = await Promise.allSettled([
        apiClient.get("/promotion-settings"),
        storefrontSettingsService.getSettings(undefined, { allowFallback: false }),
      ]);

      if (settingsResult.status === "rejected") {
        throw settingsResult.reason;
      }

      const envelope = settingsResult.value.data as {
        success?: boolean;
        data?: {
          freeShippingEnabled?: boolean;
          freeShippingThreshold?: number | string;
          freeShippingMessage?: string;
          flatShippingEnabled?: boolean;
          flatShippingFee?: number | string;
        };
      };
      if (envelope.success) {
        const data = envelope.data || {};
        const storedMessage =
          typeof data.freeShippingMessage === "string" &&
          data.freeShippingMessage.trim()
            ? data.freeShippingMessage
            : t("promotionSettings.defaultFreeMessage");
        setFreeShippingSettings({
          freeShippingEnabled: Boolean(data.freeShippingEnabled),
          freeShippingThreshold: getNumericValue(data.freeShippingThreshold),
          freeShippingMessage: storedMessage,
        });
        setFlatShippingSettings({
          flatShippingEnabled: Boolean(data.flatShippingEnabled),
          flatShippingFee: getNumericValue(data.flatShippingFee),
        });
      }

      if (sfResult.status === "fulfilled") {
        const sfData = sfResult.value.data as { hideUtilityBar?: boolean };
        setHideUtilityBar(sfData?.hideUtilityBar === true);
      }
      loadedRef.current = true;
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, t("promotionSettings.loadFailed")),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateFree = useCallback(
    (patch: Partial<FreeShippingSettings>) => {
      setFreeShippingSettings((current) => ({ ...current, ...patch }));
      queueSave();
    },
    [queueSave],
  );

  const updateFlat = useCallback(
    (patch: Partial<FlatShippingSettings>) => {
      setFlatShippingSettings((current) => ({ ...current, ...patch }));
      queueSave();
    },
    [queueSave],
  );

  const handleToggleUtilityBar = useCallback(
    async (value: boolean) => {
      setHideUtilityBar(value);
      setSaveState("saving");
      try {
        await storefrontSettingsService.updateSettings({ hideUtilityBar: value });
        setSaveState("saved");
        scheduleIdle();
      } catch {
        setHideUtilityBar(!value);
        setSaveState("idle");
        setMessage({
          type: "error",
          text: t("promotionSettings.settingsSaveFailed"),
        });
      }
    },
    [scheduleIdle, t],
  );

  const insertAmountToken = useCallback(() => {
    const el = document.getElementById(
      "freeShippingMessage",
    ) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const next = el.value.slice(0, start) + AMOUNT_TOKEN + el.value.slice(end);
    updateFree({ freeShippingMessage: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + AMOUNT_TOKEN.length, start + AMOUNT_TOKEN.length);
    });
  }, [updateFree]);

  const handleReset = useCallback(async () => {
    try {
      const response = await apiClient.post("/promotion-settings/reset", {});
      const envelope = response.data as { success?: boolean };
      if (envelope.success) {
        await loadSettings();
        setSaveState("saved");
        scheduleIdle();
        setMessage({
          type: "success",
          text: t("promotionSettings.settingsReset"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, t("promotionSettings.settingsResetFailed")),
      });
    }
  }, [loadSettings, scheduleIdle, t]);

  const { freeShippingMessage, freeShippingThreshold, freeShippingEnabled } =
    freeShippingSettings;

  const preview = useMemo(() => {
    if (!freeShippingEnabled) {
      return { live: false, text: t("promotionSettings.previewOff") };
    }
    if (!(freeShippingThreshold > 0)) {
      return { live: false, text: t("promotionSettings.previewZero") };
    }
    const formatted = formatAmount(freeShippingThreshold);
    return {
      live: true,
      text: freeShippingMessage.split(AMOUNT_TOKEN).join(formatted),
    };
  }, [freeShippingEnabled, freeShippingMessage, freeShippingThreshold, t]);

  const summaryItems = useMemo(
    () => [
      {
        label: t("promotionSettings.freeShipping"),
        value: freeShippingEnabled
          ? t("promotionSettings.pillActive")
          : t("promotionSettings.pillInactive"),
      },
      {
        label: t("promotionSettings.flatShippingTitle"),
        value: flatShippingSettings.flatShippingEnabled
          ? `${formatAmount(flatShippingSettings.flatShippingFee)} ${t("promotionSettings.currency")}`
          : t("promotionSettings.pillInactive"),
        valueDir: "ltr" as const,
      },
    ],
    [freeShippingEnabled, flatShippingSettings, t],
  );

  return {
    t,
    loading,
    saveState,
    message,
    setMessage,
    freeShippingSettings,
    flatShippingSettings,
    hideUtilityBar,
    thresholdError,
    setThresholdError,
    feeError,
    setFeeError,
    preview,
    summaryItems,
    updateFree,
    updateFlat,
    handleToggleUtilityBar,
    insertAmountToken,
    handleReset,
  };
}
