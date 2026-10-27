import React from "react";
import { useNavigate } from "react-router-dom";
import { LinkIcon } from "@heroicons/react/24/outline";
import { FacebookAdDetailResponse } from "../../../services/facebookAdsService";
import { InfoLine, QualityLine } from "./helpers";

interface AdCreativeQualityPanelProps {
  details: FacebookAdDetailResponse;
  creativePayload: Record<string, unknown>;
  bestSibling: FacebookAdDetailResponse["siblingAds"][number] | undefined;
  isEn: boolean;
  formatCurrency: (value?: number) => string;
  formatNumber: (value?: number) => string;
  formatDecimal: (value?: number, suffix?: string) => string;
}

export const AdCreativeQualityPanel: React.FC<AdCreativeQualityPanelProps> = ({
  details,
  creativePayload,
  bestSibling,
  isEn,
  formatCurrency,
  formatNumber,
  formatDecimal,
}) => {
  const navigate = useNavigate();
  const qualityMetrics = details.quality.metrics || {};

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Creative & Message */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">
          {isEn ? "Creative & Message" : "الكريتيف والرسالة"}
        </h2>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs font-bold text-slate-500">
              {isEn ? "Primary Text" : "النص الأساسي"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">
              {details.ad.primaryText || (isEn ? "Not available" : "غير متاح")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoLine
              label={isEn ? "Headline" : "العنوان"}
              value={details.ad.headline}
              notAvailableText={isEn ? "Not available" : "غير متاح"}
            />
            <InfoLine
              label="CTA"
              value={details.ad.callToAction}
              notAvailableText={isEn ? "Not available" : "غير متاح"}
            />
            <InfoLine
              label={isEn ? "Creative Type" : "النوع"}
              value={details.ad.creativeType}
              notAvailableText={isEn ? "Not available" : "غير متاح"}
            />
            <InfoLine
              label="Creative ID"
              value={String(
                creativePayload["creativeId"] ||
                  (isEn ? "Not available" : "غير متاح"),
              )}
              notAvailableText={isEn ? "Not available" : "غير متاح"}
            />
          </div>
          {details.ad.linkUrl && (
            <a
              href={details.ad.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
            >
              <LinkIcon className="h-4 w-4" />
              {isEn ? "Open Ad Link" : "فتح رابط الإعلان"}
            </a>
          )}
        </div>
      </div>

      {/* Ad Quality from Meta */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">
          {isEn ? "Ad Quality from Meta" : "جودة الإعلان من Meta"}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <QualityLine
            label="Quality Ranking"
            value={qualityMetrics.qualityRanking}
            notAvailableText={isEn ? "Not available" : "غير متاح"}
          />
          <QualityLine
            label="Engagement Ranking"
            value={qualityMetrics.engagementRateRanking}
            notAvailableText={isEn ? "Not available" : "غير متاح"}
          />
          <QualityLine
            label="Conversion Ranking"
            value={qualityMetrics.conversionRateRanking}
            notAvailableText={isEn ? "Not available" : "غير متاح"}
          />
        </div>
        {!details.quality.available && (
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            {details.quality.error ||
              (isEn
                ? "Quality ranking metrics not currently available from Meta for this ad."
                : "مؤشرات الجودة غير متاحة من Meta لهذا الإعلان حالياً.")}
          </div>
        )}
      </div>

      {/* In-Group Comparison */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black text-slate-950">
          {isEn ? "In-Group Comparison" : "مقارنة داخل المجموعة"}
        </h2>
        <div className="mt-3 space-y-2">
          {bestSibling && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-black">
                {isEn ? "Best ROAS:" : "أفضل ROAS:"} {bestSibling.name}
              </p>
              <p className="mt-1 text-xs tabular-nums">
                ROAS {formatDecimal(bestSibling.metrics.roas)}x · CPA{" "}
                {formatCurrency(bestSibling.metrics.cpa)}
              </p>
            </div>
          )}
          {details.siblingAds.slice(0, 5).map((sibling) => (
            <button
              key={sibling.id}
              onClick={() =>
                navigate(`/advertising/facebook-ads/ads/${sibling.id}`)
              }
              className={`w-full rounded-lg border p-3 ${
                isEn ? "text-left" : "text-right"
              } text-sm hover:bg-slate-50 transition-colors ${
                sibling.id === details.ad.id
                  ? "border-indigo-200 bg-indigo-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-bold text-slate-950">
                  {sibling.name}
                </span>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  {formatDecimal(sibling.metrics.roas)}x
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                {formatCurrency(sibling.metrics.spend)} ·{" "}
                {formatNumber(sibling.metrics.purchases)}{" "}
                {isEn ? "purchases" : "شراء"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
