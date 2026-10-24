import React from "react";
import { Navigate } from "react-router-dom";
import { getDirection } from "../../i18n";
import {
  ConversionToolHeader,
  ConversionToolPreviewSection,
  ConversionToolSidebar,
  useConversionToolPageController,
} from "./conversion-tool-detail";

export default function ConversionToolPage() {
  const {
    navigate,
    entry,
    tool,
    meta,
    loading,
    saving,
    savingToolKey,
    enabled,
    availability,
    settings,
    toolLabel,
    toolBenefit,
    storePreviewUrl,
    saveIndicator,
    canvasView,
    setCanvasView,
    merchantTheme,
    handleToolToggle,
    handleToolFieldSave,
  } = useConversionToolPageController();

  if (!entry || !tool || !meta) {
    return <Navigate to="/settings/store/tools" replace />;
  }

  return (
    <div className="conversion-admin-scope mx-auto max-w-7xl space-y-6" dir={getDirection()}>
      <ConversionToolHeader
        toolLabel={toolLabel}
        storePreviewUrl={storePreviewUrl}
        onBack={() => navigate("/settings/store/tools")}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <ConversionToolSidebar
          tool={tool}
          meta={meta}
          toolLabel={toolLabel}
          toolBenefit={toolBenefit}
          enabled={enabled}
          availability={availability}
          saving={saving}
          loading={loading}
          savingToolKey={savingToolKey}
          settings={settings}
          onToggle={() => void handleToolToggle(tool, !enabled)}
          onFieldSave={(field, val) => void handleToolFieldSave(tool, field, val)}
        />

        <ConversionToolPreviewSection
          tool={tool}
          meta={meta}
          settings={settings}
          loading={loading}
          enabled={enabled}
          availability={availability}
          saveIndicator={saveIndicator}
          canvasView={canvasView}
          merchantTheme={merchantTheme}
          onChangeCanvasView={setCanvasView}
        />
      </div>
    </div>
  );
}
