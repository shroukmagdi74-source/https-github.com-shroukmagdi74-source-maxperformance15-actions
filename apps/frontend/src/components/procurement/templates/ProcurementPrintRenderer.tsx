import React from "react";
import { ProcurementPrintStyles } from "./ProcurementPrintStyles";
import { OfficialTaxTemplate } from "./OfficialTaxTemplate";
import { ModernMinimalTemplate } from "./ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "./GoodsReceiptTemplate";
import { NormalizedProcurementData, ProcurementTemplateId } from "./types";

interface ProcurementPrintRendererProps {
  templateId: ProcurementTemplateId;
  data: NormalizedProcurementData;
  isRtl?: boolean;
}

export const ProcurementPrintRenderer: React.FC<ProcurementPrintRendererProps> = ({
  templateId,
  data,
  isRtl = true,
}) => {
  const renderTemplateContent = () => {
    switch (templateId) {
      case "modern_minimal":
        return <ModernMinimalTemplate data={data} isRtl={isRtl} />;
      case "goods_receipt":
        return <GoodsReceiptTemplate data={data} isRtl={isRtl} />;
      case "official_tax":
      default:
        return <OfficialTaxTemplate data={data} isRtl={isRtl} />;
    }
  };

  return (
    <div className="procurement-print-root">
      <ProcurementPrintStyles />
      <div className="hidden print:block">{renderTemplateContent()}</div>
    </div>
  );
};
