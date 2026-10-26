import React from "react";
import type { MarketplaceApp as MPA } from "@/types/marketplace";
import { getMarketplaceLimitations } from "../../featureCatalog";

interface AppDetailsFitFenceProps {
  app: MPA;
}

/**
 * The honest exclusion: «مش ليك لو…». One line telling a merchant this app is
 * the wrong buy — it is the cheapest trust signal on the page.
 */
export const AppDetailsFitFence: React.FC<AppDetailsFitFenceProps> = ({ app }) => {
  const note = getMarketplaceLimitations(app);
  if (!note) return null;

  return (
    <section className="rounded-2xl border border-amber-300/50 bg-amber-50/80 p-5 text-right dark:border-amber-500/25 dark:bg-amber-500/10">
      <b className="mb-1.5 block text-[13.5px] font-bold text-amber-800 dark:text-amber-300">مش ليك لو…</b>
      <p className="m-0 text-[13.5px] leading-7 text-amber-900/90 dark:text-amber-100/85">{note}</p>
    </section>
  );
};
