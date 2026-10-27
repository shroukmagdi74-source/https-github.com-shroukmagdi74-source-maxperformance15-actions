import React from "react";
import {
  ExternalLink,
  Globe,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Zap,
} from "lucide-react";
import { DeviceType, ViewModeType } from "./types";

interface PhoneMockupHeaderProps {
  viewMode: ViewModeType;
  setViewMode: (mode: ViewModeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  previewUrl?: string;
  customerUrl?: string;
  isMobileView?: boolean;
  onRefreshIframe: () => void;
}

export const PhoneMockupHeader: React.FC<PhoneMockupHeaderProps> = ({
  viewMode,
  setViewMode,
  device,
  setDevice,
  previewUrl,
  customerUrl,
  isMobileView,
  onRefreshIframe,
}) => {
  return (
    <div className="eo-phone-preview-header">
      <div className="eo-preview-mode-tabs">
        {previewUrl && (
          <button
            type="button"
            className={`eo-mode-tab ${viewMode === "live" ? "is-active" : ""}`}
            onClick={() => setViewMode("live")}
            title="معاينة الصفحة الحقيقية الفعلية في المتجر"
          >
            <Globe size={14} />
            <span>المعاينة الحية (Live)</span>
          </button>
        )}

        <button
          type="button"
          className={`eo-mode-tab ${viewMode === "sync" ? "is-active" : ""}`}
          onClick={() => setViewMode("sync")}
          title="معاينة التعديلات اللحظية السريعة"
        >
          <Zap size={14} />
          <span>المعاينة الفورية (Instant)</span>
        </button>
      </div>

      <div className="eo-preview-device-tools">
        {!isMobileView && (
          <>
            <button
              type="button"
              className={`eo-device-btn ${device === "mobile" ? "is-active" : ""}`}
              onClick={() => setDevice("mobile")}
              title="عرض الموبايل (380px)"
            >
              <Smartphone size={15} />
            </button>
            <button
              type="button"
              className={`eo-device-btn ${device === "tablet" ? "is-active" : ""}`}
              onClick={() => setDevice("tablet")}
              title="عرض التابلت (680px)"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              className={`eo-device-btn ${device === "desktop" ? "is-active" : ""}`}
              onClick={() => setDevice("desktop")}
              title="عرض الشاشة الكاملة (حاسوب)"
            >
              <Monitor size={15} />
            </button>
          </>
        )}

        {viewMode === "live" && previewUrl && (
          <>
            <button
              type="button"
              className="eo-device-btn"
              onClick={onRefreshIframe}
              title="إعادة تحميل المعاينة"
            >
              <RefreshCw size={14} />
            </button>

            <a
              href={customerUrl || previewUrl}
              target="_blank"
              rel="noreferrer"
              className="eo-device-btn"
              title="فتح الرابط في تبويب خارجي"
            >
              <ExternalLink size={14} />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
