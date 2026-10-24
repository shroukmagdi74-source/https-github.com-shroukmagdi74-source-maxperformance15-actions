import React from "react";
import TrustedBadgePanel from "../../../storefront/components/TrustedBadgePanel";
import BackInStockSignupCard from "../../../storefront/components/BackInStockSignupCard";

export const TrustedBadgesPreview = () => (
  <TrustedBadgePanel
    title="اشترِ وانت مطمّن"
    subtitle="ضمان واسترجاع ودفع آمن"
    variant="grid"
    items={["دفع آمن 100%", "استرجاع خلال 14 يوم", "توصيل لكل المحافظات"]}
  />
);

export const BackInStockPreview = () => (
  <BackInStockSignupCard
    productId="preview-product"
    productName="منتج تجريبي للمعاينة"
    title="نوّهني لما يرجع متاح"
    description="سيب رقم موبايلك ونبلغك أول ما مقاسك يتوفر"
    buttonLabel="نوّهني أول ما يتوفر"
    variant="panel"
  />
);
