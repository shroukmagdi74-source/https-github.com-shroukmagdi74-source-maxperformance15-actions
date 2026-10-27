import React from "react";
import {
  PhoneMockupPreviewProps,
  usePhoneMockupState,
  PhoneMockupHeader,
  PhoneMockupFrame,
  PhoneMockupSyncCanvas,
} from "./phone-mockup";

export const PhoneMockupPreview: React.FC<PhoneMockupPreviewProps> = ({
  title: _title,
  product,
  sections,
  formConfig,
  previewUrl,
  customerUrl,
  isMobileView = false,
}) => {
  const {
    viewMode,
    setViewMode,
    device,
    setDevice,
    iframeKey,
    selectedBundleQty,
    setSelectedBundleQty,
    activeMockImageIndex,
    setActiveMockImageIndex,
    iframeRef,
    prodImg,
    priceNum,
    bundleTiers,
    bundleTotal,
    mockColors,
    mockSizes,
    handleRefreshIframe,
  } = usePhoneMockupState({ previewUrl, product });

  return (
    <div
      className={`eo-phone-preview-wrapper ${isMobileView ? "is-mobile-view" : ""} ${
        device === "desktop" ? "is-desktop-mode" : ""
      }`}
      dir="rtl"
    >
      {/* Header Controls Bar */}
      <PhoneMockupHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        device={device}
        setDevice={setDevice}
        previewUrl={previewUrl}
        customerUrl={customerUrl}
        isMobileView={isMobileView}
        onRefreshIframe={handleRefreshIframe}
      />

      {/* Frame Container */}
      <PhoneMockupFrame
        device={device}
        isMobileView={isMobileView}
        viewMode={viewMode}
        previewUrl={previewUrl}
        customerUrl={customerUrl}
      >
        {/* MODE 1: REAL LIVE IFRAME */}
        {viewMode === "live" && previewUrl ? (
          <div className="eo-iframe-container">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={previewUrl}
              title="Live Store Landing Page Preview"
              className="eo-live-iframe"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        ) : (
          /* MODE 2: AUTHENTIC INSTANT SYNC PREVIEW */
          <PhoneMockupSyncCanvas
            product={product}
            sections={sections}
            formConfig={formConfig}
            prodImg={prodImg}
            priceNum={priceNum}
            device={device}
            bundleTiers={bundleTiers}
            selectedBundleQty={selectedBundleQty}
            setSelectedBundleQty={setSelectedBundleQty}
            bundleTotal={bundleTotal}
            mockColors={mockColors}
            mockSizes={mockSizes}
            activeMockImageIndex={activeMockImageIndex}
            setActiveMockImageIndex={setActiveMockImageIndex}
          />
        )}
      </PhoneMockupFrame>
    </div>
  );
};

export default PhoneMockupPreview;
