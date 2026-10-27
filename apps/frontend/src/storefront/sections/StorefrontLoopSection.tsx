import React from "react";
import { expandLoopSection } from "../studio/utils/expandLoopSection";
import { useStorefrontDynamicContext } from "../studio/utils/dynamicValues";

export interface StorefrontLoopSectionProps {
  section?: any;
  settings?: any;
}

export const StorefrontLoopSection: React.FC<StorefrontLoopSectionProps> = ({
  section,
  settings,
}) => {
  const dynamicCtx = useStorefrontDynamicContext();
  const effectiveSection = {
    type: "loop",
    ...(section || {}),
    settings: {
      ...(section?.settings || {}),
      ...(settings || {}),
    },
  };

  const rawColumns = Number(
    effectiveSection.columns ?? effectiveSection.settings?.columns ?? 1
  );
  const columns = Math.max(1, Math.min(6, rawColumns || 1));
  const expandedSections = expandLoopSection(effectiveSection, dynamicCtx);

  if (expandedSections.length === 0) {
    const emptyMsg =
      expandedSections.emptyMessage ||
      effectiveSection.settings?.emptyMessage ||
      effectiveSection.emptyMessage ||
      "لا توجد عناصر لعرضها في هذا التكرار";

    return (
      <div
        data-storefront-loop-empty="true"
        className="w-full py-8 px-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/10 my-2"
      >
        <span>{emptyMsg}</span>
      </div>
    );
  }

  const gridStyle: React.CSSProperties =
    columns > 1
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: "16px",
          width: "100%",
        }
      : {
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
        };

  return (
    <div
      data-storefront-loop="true"
      data-source={effectiveSection.source ?? effectiveSection.settings?.source ?? "products"}
      data-columns={columns}
      className="storefront-loop-section w-full"
      style={gridStyle}
    >
      {/* Loop items are rendered by PageComposer when integrated */}
    </div>
  );
};

export default StorefrontLoopSection;
