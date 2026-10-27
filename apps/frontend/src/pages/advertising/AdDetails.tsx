/**
 * Ad Details Page
 *
 * صفحة تشخيص أداء إعلان فردي - Modular Architecture
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useAdDetails,
  AdDetailsHeader,
  AdDecisionBanner,
  AdMetricsGrid,
  AdFunnelRecommendations,
  AdBreakdownsGrid,
  AdCreativeQualityPanel,
  AdPreviewTrackingPanel,
} from "./ad-details";

const AdDetails: React.FC = () => {
  const navigate = useNavigate();
  const {
    isEn,
    dateRange,
    setDateRange,
    details,
    breakdowns,
    loading,
    refreshing,
    syncing,
    previewLoading,
    handleRefresh,
    handleSync,
    handlePreview,
    creativePayload,
    previewHtml,
    dashboardUrl,
    performanceSourceLabel,
    performanceSourceClass,
    bestSibling,
    metricCards,
    formatCurrency,
    formatNumber,
    formatDecimal,
    formatPercent,
  } = useAdDetails();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">
          {isEn ? "Ad not found" : "الإعلان غير موجود"}
        </p>
        <button
          onClick={() => navigate("/advertising/facebook-ads")}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-bold"
        >
          {isEn ? "Back to Ads Dashboard" : "العودة للوحة الإعلانات"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir={isEn ? "ltr" : "rtl"}>
      <AdDetailsHeader
        details={details}
        dateRange={dateRange}
        setDateRange={setDateRange}
        isEn={isEn}
        refreshing={refreshing}
        syncing={syncing}
        previewLoading={previewLoading}
        performanceSourceLabel={performanceSourceLabel}
        performanceSourceClass={performanceSourceClass}
        dashboardUrl={dashboardUrl}
        onRefresh={handleRefresh}
        onSync={handleSync}
        onPreview={handlePreview}
      />

      <AdDecisionBanner
        decision={details.decision}
        isEn={isEn}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        formatDecimal={formatDecimal}
      />

      <AdMetricsGrid
        metricCards={metricCards}
        isEn={isEn}
        formatPercent={formatPercent}
      />

      <AdFunnelRecommendations
        details={details}
        isEn={isEn}
        formatNumber={formatNumber}
        formatPercent={formatPercent}
      />

      <AdBreakdownsGrid
        breakdowns={breakdowns}
        isEn={isEn}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        formatDecimal={formatDecimal}
      />

      <AdCreativeQualityPanel
        details={details}
        creativePayload={creativePayload}
        bestSibling={bestSibling}
        isEn={isEn}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        formatDecimal={formatDecimal}
      />

      <AdPreviewTrackingPanel
        details={details}
        previewHtml={previewHtml}
        previewLoading={previewLoading}
        isEn={isEn}
        onPreview={handlePreview}
        formatNumber={formatNumber}
      />
    </div>
  );
};

export default AdDetails;
