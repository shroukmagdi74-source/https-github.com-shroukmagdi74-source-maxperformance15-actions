import React from "react";
import { DeviceType, ViewModeType } from "./types";

interface PhoneMockupFrameProps {
  device: DeviceType;
  isMobileView?: boolean;
  viewMode: ViewModeType;
  previewUrl?: string;
  customerUrl?: string;
  children: React.ReactNode;
}

export const PhoneMockupFrame: React.FC<PhoneMockupFrameProps> = ({
  device,
  isMobileView,
  viewMode,
  previewUrl,
  customerUrl,
  children,
}) => {
  return (
    <div
      className={`eo-phone-frame ${
        isMobileView ? "is-mobile-full-bleed" : ""
      } ${
        device === "desktop"
          ? "is-desktop-chassis"
          : device === "tablet"
            ? "is-tablet-chassis"
            : ""
      }`}
    >
      {device === "mobile" && !isMobileView && (
        <div className="eo-phone-notch">
          <div className="eo-phone-speaker" />
          <div className="eo-phone-camera" />
        </div>
      )}

      {/* Browser URL bar simulator */}
      <div className="eo-frame-browser-bar" dir="ltr">
        <span className="eo-browser-dot dot-red" />
        <span className="eo-browser-dot dot-yellow" />
        <span className="eo-browser-dot dot-green" />
        <span className="eo-browser-address truncate">
          {customerUrl || (previewUrl ? previewUrl.split("?")[0] : "store.maxp.online/lp/live")}
        </span>
        {viewMode === "live" && <span className="eo-live-chip">LIVE</span>}
      </div>

      <div className="eo-phone-screen">{children}</div>
    </div>
  );
};
