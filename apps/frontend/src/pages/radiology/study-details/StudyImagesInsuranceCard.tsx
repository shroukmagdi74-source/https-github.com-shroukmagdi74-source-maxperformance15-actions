import React from "react";
import { Eye, Image as ImageIcon, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RadiologyPaymentStatusMap, RadiologyStudyImage } from "../shared";
import { Card, Row } from "./CardRow";
import { fmtMoney, renderBadge } from "./helpers";
import { StudyDetailsInsuranceInvoice } from "./types";

interface StudyImagesInsuranceCardProps {
  images: RadiologyStudyImage[];
  onOpenViewer: () => void;
  insuranceInvoice?: StudyDetailsInsuranceInvoice | null;
}

export const StudyImagesInsuranceCard: React.FC<StudyImagesInsuranceCardProps> = ({
  images,
  onOpenViewer,
  insuranceInvoice,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Card
        title={`${t("radiology.details.images")} (${images.length})`}
        icon={<ImageIcon className="w-5 h-5" />}
        action={
          images.length > 0 ? (
            <button
              onClick={onOpenViewer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              {t("radiology.reports.viewImages")}
            </button>
          ) : undefined
        }
      >
        {images.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("radiology.details.noImages")}
          </p>
        ) : (
          <div className="space-y-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex items-center justify-between gap-3 text-sm border dark:border-gray-700 rounded-lg px-3 py-2"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {img.fileName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 tabular-nums">
                  {img.seriesDescription ? `${img.seriesDescription} ` : ""}
                  {img.fileSize ? `— ${(Number(img.fileSize) / 1024).toFixed(0)} KB` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {insuranceInvoice ? (
        <Card
          title={t("radiology.details.insurance")}
          icon={<Shield className="w-5 h-5" />}
          action={renderBadge(RadiologyPaymentStatusMap, insuranceInvoice.paymentStatus, t)}
        >
          <Row label={t("radiology.insuranceInvoices.invoiceNumber")}>
            <span dir="ltr">{insuranceInvoice.invoiceNumber || insuranceInvoice.id}</span>
          </Row>
          <Row label={t("radiology.insuranceInvoices.entity")}>
            {insuranceInvoice.insuranceCompanyName || "—"}
          </Row>
          <Row label={t("radiology.details.total")}>
            <span className="tabular-nums">{fmtMoney(insuranceInvoice.total, t("radiology.currency"))}</span>
          </Row>
          <Row label={t("radiology.details.paid")}>
            <span className="tabular-nums">{fmtMoney(insuranceInvoice.paidAmount, t("radiology.currency"))}</span>
          </Row>
          <Row label={t("radiology.details.remaining")}>
            <span className="tabular-nums">{fmtMoney(insuranceInvoice.remaining, t("radiology.currency"))}</span>
          </Row>
        </Card>
      ) : null}
    </>
  );
};
