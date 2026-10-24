import React from "react";
import {
  FileOutput,
  FileSpreadsheet,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  SettingsLoadingState,
  SettingsPageHero,
  SettingsStatusAlert,
} from "./components/SettingsPagePrimitives";
import {
  InvoiceTabContent,
  OrderInvoiceActionBar,
  PrintTabContent,
  SlipTabContent,
  useOrderInvoiceSettingsController,
  type SettingsTabValue,
} from "./order-invoice-settings";

const OrderInvoiceSettings: React.FC<{ isEmbedded?: boolean }> = ({
  isEmbedded = false,
}) => {
  const {
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
  } = useOrderInvoiceSettingsController();

  if (loading) {
    if (isEmbedded) {
      return (
        <div className="p-4 text-center text-slate-500">
          {t("orderInvoiceSettings.k_33")}
        </div>
      );
    }
    return (
      <SettingsLoadingState
        title={t("orderInvoiceSettings.k_1")}
        description={t("orderInvoiceSettings.k_2")}
      />
    );
  }

  const content = (
    <>
      {!isEmbedded && (
        <SettingsPageHero
          badgeIcon={Sparkles}
          badgeLabel={t("orderInvoiceSettings.k_3")}
          title={t("orderInvoiceSettings.k_4")}
          description={t("orderInvoiceSettings.k_5")}
          summaryItems={[
            { label: t("orderInvoiceSettings.k_89"), value: invoiceSummary },
            { label: t("orderInvoiceSettings.k_49"), value: slipSummary },
            {
              label: t("orderInvoiceSettings.k_90"),
              value: invoice.autoEmailToCustomer
                ? t("orderInvoiceSettings.k_91")
                : t("orderInvoiceSettings.k_92"),
            },
            {
              label: t("orderInvoiceSettings.k_93"),
              value: invoice.autoGenerate
                ? t("orderInvoiceSettings.k_94")
                : t("orderInvoiceSettings.k_92"),
            },
          ]}
          gradientClassName="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_36%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.9))]"
        />
      )}

      <div className={isEmbedded ? "" : "space-y-6 px-6 py-6"}>
        <OrderInvoiceActionBar
          saving={saving}
          onRefresh={() => {
            void loadSettings();
          }}
          onResetInvoice={() => {
            void resetInvoice();
          }}
          onSaveAll={() => {
            void saveAll();
          }}
        />

        <SettingsStatusAlert message={message} />

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTabValue)}
        >
          <TabsList
            variant="line"
            className="h-auto w-full !grid grid-cols-1 gap-2 rounded-none border-b border-slate-200/70 bg-transparent p-0 pb-3 sm:grid-cols-2 xl:grid-cols-3 dark:border-slate-800"
          >
            {[
              {
                value: "invoice",
                label: t("orderInvoiceSettings.k_89"),
                description: t("orderInvoiceSettings.k_97"),
                icon: FileSpreadsheet,
              },
              {
                value: "print",
                label: t("orderInvoiceSettings.k_98"),
                description: t("orderInvoiceSettings.k_99"),
                icon: FileOutput,
              },
              {
                value: "slip",
                label: t("orderInvoiceSettings.k_49"),
                description: t("orderInvoiceSettings.k_100"),
                icon: PackageCheck,
              },
            ].map((entry) => {
              const Icon = entry.icon;
              const isActive = tab === entry.value;

              return (
                <TabsTrigger
                  key={entry.value}
                  value={entry.value}
                  className={cn(
                    "group min-h-[74px] w-full rounded-2xl border px-4 py-3 text-right text-sm font-semibold transition-colors",
                    isActive
                      ? "!border-slate-900 !bg-slate-900 !text-white shadow-sm dark:!border-slate-100 dark:!bg-slate-100 dark:!text-slate-900"
                      : "!border-transparent !bg-slate-50/65 !text-slate-500 hover:!border-slate-200 hover:!bg-slate-50 dark:!bg-slate-900/60 dark:!text-slate-400"
                  )}
                >
                  <div className="flex w-full items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-xl p-2 ring-1 transition",
                        isActive
                          ? "bg-white/10 text-white ring-white/15 dark:bg-slate-900/10 dark:text-slate-900"
                          : "bg-white/90 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                      )}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="font-bold">{entry.label}</div>
                      <div
                        className={cn(
                          "mt-1 text-xs font-medium leading-5",
                          isActive
                            ? "text-slate-200 dark:text-slate-700"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {entry.description}
                      </div>
                    </div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="invoice">
            <InvoiceTabContent
              invoice={invoice}
              invoiceFlags={invoiceFlags}
              barcodeFlags={barcodeFlags}
              labelForStatus={labelForStatus}
              onUpdateInvoice={updateInvoice}
            />
          </TabsContent>

          <TabsContent value="print">
            <PrintTabContent
              invoice={invoice}
              orientationLabelMap={orientationLabelMap}
              onUpdateInvoice={updateInvoice}
            />
          </TabsContent>

          <TabsContent value="slip">
            <SlipTabContent
              slip={slip}
              slipFlags={slipFlags}
              orientationLabelMap={orientationLabelMap}
              onUpdateSlip={updateSlip}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );

  return content;
};

export default OrderInvoiceSettings;
