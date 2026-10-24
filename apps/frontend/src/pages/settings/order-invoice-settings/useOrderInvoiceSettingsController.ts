import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuthSimple";
import { apiClient } from "../../../services/apiClient";
import {
  createBarcodeFlags,
  createDefaultSlip,
  createInvoiceFlags,
  createLabelForStatus,
  createOrientationLabelMap,
  createSlipFlags,
  defaultInvoice,
  normalizeInvoice,
  normalizeSlip,
  type InvoiceSettings,
  type SettingsMessageState,
  type SettingsTabValue,
  type SlipSettings,
} from "./types";

export function useOrderInvoiceSettingsController() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<SettingsTabValue>("invoice");
  const [message, setMessage] = useState<SettingsMessageState | null>(null);
  const [companyId, setCompanyId] = useState(user?.companyId || "");
  const [invoice, setInvoice] = useState<InvoiceSettings>(defaultInvoice);
  const [rawPreparation, setRawPreparation] = useState<Record<string, unknown>>(
    {}
  );
  const [slip, setSlip] = useState<SlipSettings>(() => createDefaultSlip(t));

  const invoiceFlags = useMemo(() => createInvoiceFlags(t), [t]);
  const barcodeFlags = useMemo(() => createBarcodeFlags(t), [t]);
  const slipFlags = useMemo(() => createSlipFlags(t), [t]);
  const labelForStatus = useMemo(() => createLabelForStatus(t), [t]);
  const orientationLabelMap = useMemo(() => createOrientationLabelMap(t), [t]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const [invoiceRes, companyRes] = await Promise.all([
        apiClient.get("/order-invoice-settings"),
        apiClient.get("/companies/current"),
      ]);

      if (invoiceRes.data?.success) {
        setInvoice(normalizeInvoice(invoiceRes.data.data));
      }

      const company = companyRes.data?.data;
      if (company?.id) {
        setCompanyId(String(company.id));
      }

      const orderPreparation =
        company?.settings?.orderPreparation &&
        typeof company.settings.orderPreparation === "object"
          ? company.settings.orderPreparation
          : {};

      setRawPreparation(orderPreparation);
      setSlip(normalizeSlip(orderPreparation?.slipDocument, t));
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: t("orderInvoiceSettings.k_81"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveAll = useCallback(async () => {
    if (!companyId) {
      setMessage({
        type: "error",
        text: t("orderInvoiceSettings.k_82"),
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      await Promise.all([
        apiClient.put("/order-invoice-settings", invoice),
        apiClient.put(`/companies/${companyId}`, {
          settings: {
            orderPreparation: { ...rawPreparation, slipDocument: slip },
          },
        }),
      ]);

      setRawPreparation((prev) => ({
        ...prev,
        slipDocument: slip,
      }));
      setMessage({
        type: "success",
        text: t("orderInvoiceSettings.k_83"),
      });
      window.setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: t("orderInvoiceSettings.k_84"),
      });
    } finally {
      setSaving(false);
    }
  }, [companyId, invoice, rawPreparation, slip, t]);

  const resetInvoice = useCallback(async () => {
    if (!window.confirm(t("orderInvoiceSettings.k_85"))) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await apiClient.post("/order-invoice-settings/reset", {});
      setInvoice(normalizeInvoice(response.data?.data));
      setMessage({
        type: "success",
        text: t("orderInvoiceSettings.k_86"),
      });
      window.setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: t("orderInvoiceSettings.k_87"),
      });
    } finally {
      setSaving(false);
    }
  }, [t]);

  const updateInvoice = useCallback((updates: Partial<InvoiceSettings>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSlip = useCallback((updates: Partial<SlipSettings>) => {
    setSlip((prev) => ({ ...prev, ...updates }));
  }, []);

  const invoiceSummary = `${invoice.pdfPageSize} / ${
    invoice.pdfOrientation === "portrait"
      ? t("orderInvoiceSettings.k_46")
      : t("orderInvoiceSettings.k_40")
  }`;

  const slipSummary = `${slip.pageSize} / ${
    slip.pageOrientation === "portrait"
      ? t("orderInvoiceSettings.k_46")
      : t("orderInvoiceSettings.k_40")
  }`;

  return {
    t,
    loading,
    saving,
    tab,
    setTab,
    message,
    invoice,
    slip,
    invoiceFlags,
    barcodeFlags,
    slipFlags,
    labelForStatus,
    orientationLabelMap,
    invoiceSummary,
    slipSummary,
    loadSettings,
    saveAll,
    resetInvoice,
    updateInvoice,
    updateSlip,
  };
}
