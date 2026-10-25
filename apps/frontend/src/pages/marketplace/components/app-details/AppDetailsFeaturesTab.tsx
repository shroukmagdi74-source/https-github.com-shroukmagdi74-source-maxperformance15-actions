import React from "react";
import { Check, Sparkles } from "lucide-react";
import type { MarketplaceApp as MPA } from "@/types/marketplace";
import { getMarketplaceFeatureItems } from "../../featureCatalog";

interface AppDetailsFeaturesTabProps {
  app: MPA;
}

/**
 * Features as a quiet two-column list (no per-feature card): the page keeps one
 * surface and the density goes up, which is what makes the section scannable.
 */
export const AppDetailsFeaturesTab: React.FC<AppDetailsFeaturesTabProps> = ({ app }) => {
  const featureItems = getMarketplaceFeatureItems(app);

  if (featureItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
        <Sparkles size={30} className="mx-auto mb-3 text-muted-foreground/40" />
        الميزات التفصيلية لهذا التطبيق لسه بتتكتب — الشرح بالفيديو فوق بيغطي الشاشة الأساسية.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
      {featureItems.map((feature) => (
        <div key={feature.key} className="flex gap-3.5 border-b border-border/50 py-4 text-right last:border-b-0">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Check size={15} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <b className="mb-1 block text-[14.5px] font-bold text-foreground">{feature.name}</b>
            <p className="m-0 text-[13px] leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
