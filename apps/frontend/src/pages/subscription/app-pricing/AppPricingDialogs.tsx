import React from "react";
import { AppPricingFormDialog } from "./AppPricingFormDialog";
import { AppPricingDetailDialog } from "./AppPricingDetailDialog";
import type { AppPricingController } from "./useAppPricingSheetController";

export const AppPricingDialogs: React.FC<{ c: AppPricingController }> = ({ c }) => {
  return (
    <>
      <AppPricingFormDialog c={c} />
      <AppPricingDetailDialog c={c} />
    </>
  );
};
