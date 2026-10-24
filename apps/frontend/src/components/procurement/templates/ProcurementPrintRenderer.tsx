import React from "react";
import { ProcurementPrintStyles } from "./ProcurementPrintStyles";
import { CommercialFactoryTemplate } from "./CommercialFactoryTemplate";
import { CompactEcoHalfPageTemplate } from "./CompactEcoHalfPageTemplate";
import { OfficialTaxTemplate } from "./OfficialTaxTemplate";
import { ModernMinimalTemplate } from "./ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "./GoodsReceiptTemplate";
import {
  NormalizedProcurementData,
  ProcurementTemplateId,
  AVAILABLE_PROCUREMENT_TEMPLATES,
} from "./types";

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
  const currentOption = AVAILABLE_PROCUREMENT_TEMPLATES.find((t) => t.id === templateId);
  const paperSize = currentOption?.paperSize || "A4";

  const renderTemplateContent = () => {
    switch (templateId) {
      case "commercial_factory":
        return <CommercialFactoryTemplate data={data} isRtl={isRtl} />;
      case "compact_eco":
        return <CompactEcoHalfPageTemplate data={data} isRtl={isRtl} />;
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
      <ProcurementPrintStyles paperSize={paperSize} />
      <div className="hidden print:block">{renderTemplateContent()}</div>
    </div>
  );
};
