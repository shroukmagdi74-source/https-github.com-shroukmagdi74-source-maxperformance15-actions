import React from "react";
import { CubeIcon, ShieldCheckIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OrderPreparationHeader,
  OrderPreparationPipelineTab,
  OrderPreparationQualityTab,
  OrderPreparationSlipTab,
  OrderPreparationSaveBar,
  useOrderPreparationSettingsController,
} from "./order-preparation";

const OrderPreparationSettings: React.FC = () => {
  const {
    settings,
    warehouses,
    preparationStatuses,
    handoffStatuses,
    loading,
    saving,
    activeTab,
    setActiveTab,
    defaultWarehouseName,
    updateSetting,
    updateQcCheck,
    updateSlip,
    handleSave,
    handleReset,
  } = useOrderPreparationSettingsController();

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            جاري تحميل إعدادات تجهيز الطلبات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <OrderPreparationHeader
        enabled={settings.enabled}
        defaultWarehouseName={defaultWarehouseName}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start gap-0 rounded-2xl border border-slate-200/80 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/90">
          <TabsTrigger
            value="pipeline"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800"
          >
            <CubeIcon className="ml-2 h-4 w-4" />
            <span>مسار التجهيز</span>
          </TabsTrigger>
          <TabsTrigger
            value="quality"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800"
          >
            <ShieldCheckIcon className="ml-2 h-4 w-4" />
            <span>المخزون والجودة</span>
          </TabsTrigger>
          <TabsTrigger
            value="document"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-slate-800"
          >
            <DocumentTextIcon className="ml-2 h-4 w-4" />
            <span>ورقة التجهيز</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pipeline */}
        <TabsContent value="pipeline">
          <OrderPreparationPipelineTab
            startingStatus={settings.startingStatus}
            handoffStatus={settings.handoffStatus}
            defaultWarehouseId={settings.defaultWarehouseId}
            preparationStatuses={preparationStatuses}
            handoffStatuses={handoffStatuses}
            warehouses={warehouses}
            onUpdateSetting={updateSetting}
          />
        </TabsContent>

        {/* Tab 2: Quality & Stock */}
        <TabsContent value="quality">
          <OrderPreparationQualityTab
            settings={settings}
            onUpdateSetting={updateSetting}
            onUpdateQcCheck={updateQcCheck}
          />
        </TabsContent>

        {/* Tab 3: Document */}
        <TabsContent value="document">
          <OrderPreparationSlipTab
            slipDocument={settings.slipDocument}
            onUpdateSlip={updateSlip}
          />
        </TabsContent>
      </Tabs>

      {/* Save / Reset Bar */}
      <OrderPreparationSaveBar
        saving={saving}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};

export default OrderPreparationSettings;
