import React from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import {
  useLoyaltySystemMapController,
  LoyaltyMapHeader,
  LoyaltyMapKpiCards,
  LoyaltyMapCanvas,
  LoyaltyAutoDiscountSection,
  LoyaltyRoutingSection,
  LoyaltyReEngagementSection,
  LoyaltyModals,
} from "./loyalty-system-map";

const LoyaltySystemMap: React.FC = () => {
  const ctrl = useLoyaltySystemMapController();

  if (ctrl.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm">جاري تحميل خريطة نظام الولاء...</p>
        </div>
      </div>
    );
  }

  if (ctrl.loadFailed || !ctrl.data) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          تعذر تحميل بيانات النظام
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          حدث خطأ أثناء جلب بيانات الخريطة. أعد المحاولة.
        </p>
        <button
          onClick={ctrl.load}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoyaltyMapHeader
        lastUpdated={ctrl.lastUpdated}
        hasTemporalData={ctrl.hasTemporalData}
        dateRange={ctrl.dateRange}
        setDateRange={ctrl.setDateRange}
        exportCsv={ctrl.exportCsv}
        exportSvg={ctrl.exportSvg}
        svgBusy={ctrl.svgBusy}
        setSvgBusy={ctrl.setSvgBusy}
        load={ctrl.load}
        loading={ctrl.loading}
      />

      <LoyaltyMapKpiCards
        kpiCards={ctrl.kpiCards}
        cashbackConflict={ctrl.cashbackConflict}
        totalCashback={ctrl.totalCashback}
      />

      <LoyaltyMapCanvas
        mapRef={ctrl.mapRef}
        nodeRefs={ctrl.nodeRefs}
        edges={ctrl.edges}
        nodeById={ctrl.nodeById}
        timelineStages={ctrl.timelineStages}
        setSelectedNode={ctrl.setSelectedNode}
        setTimelineLog={ctrl.setTimelineLog}
      />

      {ctrl.isAutoDiscount && (
        <LoyaltyAutoDiscountSection
          systemAnalytics={ctrl.systemAnalytics}
          navigate={ctrl.navigate}
          setBackfillConfirm={ctrl.setBackfillConfirm}
          backfillBusy={ctrl.backfillBusy}
        />
      )}

      <LoyaltyRoutingSection
        routing={ctrl.routing}
        routingTools={ctrl.routingTools}
        openChannelDialog={ctrl.openChannelDialog}
      />

      <LoyaltyReEngagementSection
        reEngagementLines={ctrl.reEngagementLines}
        savingToggle={ctrl.savingToggle}
        handleToggle={ctrl.handleToggle}
        thresholdDraft={ctrl.thresholdDraft}
        setThresholdDraft={ctrl.setThresholdDraft}
        saveThreshold={ctrl.saveThreshold}
        viewCustomers={ctrl.viewCustomers}
      />

      <LoyaltyModals
        pendingToggle={ctrl.pendingToggle}
        setPendingToggle={ctrl.setPendingToggle}
        savingToggle={ctrl.savingToggle}
        saveLoopToggle={ctrl.saveLoopToggle}
        customerList={ctrl.customerList}
        setCustomerList={ctrl.setCustomerList}
        backfillConfirm={ctrl.backfillConfirm}
        setBackfillConfirm={ctrl.setBackfillConfirm}
        backfillBusy={ctrl.backfillBusy}
        runBackfill={ctrl.runBackfill}
        systemAnalytics={ctrl.systemAnalytics}
        channelDialog={ctrl.channelDialog}
        setChannelDialog={ctrl.setChannelDialog}
        channelDraft={ctrl.channelDraft}
        setChannelDraft={ctrl.setChannelDraft}
        saveChannel={ctrl.saveChannel}
        selectedNode={ctrl.selectedNode}
        setSelectedNode={ctrl.setSelectedNode}
        nodeDetails={ctrl.nodeDetails}
        navigate={ctrl.navigate}
        timelineLog={ctrl.timelineLog}
        setTimelineLog={ctrl.setTimelineLog}
      />
    </div>
  );
};

export default LoyaltySystemMap;
