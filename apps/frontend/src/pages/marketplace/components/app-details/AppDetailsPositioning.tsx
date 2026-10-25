import React from "react";
import type { MarketplaceApp as MPA } from "@/types/marketplace";
import { getMarketplacePositioning } from "../../featureCatalog";

interface AppDetailsPositioningProps {
  app: MPA;
}

/**
 * «لمين / بيحل إيه / النتيجة» — the three answers a buyer needs before the
 * feature list. Renders nothing when the row carries no positioning copy.
 */
export const AppDetailsPositioning: React.FC<AppDetailsPositioningProps> = ({ app }) => {
  const positioning = getMarketplacePositioning(app);
  if (!positioning) return null;

  const items = [
    { label: "لمين", value: positioning.audience },
    { label: "بيحل إيه", value: positioning.surface },
    { label: "النتيجة", value: positioning.outcome },
  ].filter((item) => Boolean(item.value && item.value.trim()));

  if (items.length === 0) return null;

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border/60 bg-card sm:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={
            "p-5 text-right " +
            (index < items.length - 1 ? "border-b border-border/60 sm:border-b-0 sm:border-l" : "")
          }
        >
          <span className="mb-2 block text-[11.5px] font-bold text-primary">{item.label}</span>
          <p className="m-0 text-[13.5px] leading-7 text-muted-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
};
