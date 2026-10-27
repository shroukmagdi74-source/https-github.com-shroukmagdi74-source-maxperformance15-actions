import React from "react";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { LandingSection, ProductLandingProduct } from "../types";
import { DeviceType, BundleTier } from "./types";
import { MockMediaSection } from "./sections/MockMediaSection";
import { MockFormSection } from "./sections/MockFormSection";
import {
  renderBannerSection,
  renderTextSection,
  renderFeaturesSection,
  renderCountdownSection,
  renderHeadingSection,
  renderBuyButtonSection,
  renderBeforeAfterSection,
  renderHtmlSection,
} from "./sections/MockContentSections";
import {
  renderReviewsSection,
  renderFaqSection,
  renderBreakdownSection,
  renderComparisonSection,
  renderLiveProofSection,
  renderWhatsAppChatSection,
} from "./sections/MockSocialProofSections";
import {
  renderImageOnlySection,
  renderCarouselSection,
  renderHowItWorksSection,
  renderFeaturedProductSection,
  renderYouTubeVideoSection,
} from "./sections/MockRichMediaSections";

interface PhoneMockupSyncCanvasProps {
  product: ProductLandingProduct | null;
  sections: LandingSection[];
  formConfig: {
    orderKicker: string;
    orderTitle: string;
    orderCopy: string;
    buttonLabel: string;
  };
  prodImg?: string;
  priceNum: number;
  device: DeviceType;
  bundleTiers: BundleTier[];
  selectedBundleQty: number;
  setSelectedBundleQty: (qty: number) => void;
  bundleTotal: number;
  mockColors: string[];
  mockSizes: string[];
  activeMockImageIndex: number;
  setActiveMockImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const PhoneMockupSyncCanvas: React.FC<PhoneMockupSyncCanvasProps> = ({
  product,
  sections,
  formConfig,
  prodImg,
  priceNum,
  device,
  bundleTiers,
  selectedBundleQty,
  setSelectedBundleQty,
  bundleTotal,
  mockColors,
  mockSizes,
  activeMockImageIndex,
  setActiveMockImageIndex,
}) => {
  return (
    <div className="eo-sync-store-canvas">
      {/* Micro Store Header */}
      <div className="eo-sync-store-bar">
        <span className="eo-sync-brand">{product?.name || "المتجر الرسمي"}</span>
        <span className="eo-sync-trust">
          <ShieldCheck size={13} /> تسوق آمن وتأكيد فوري
        </span>
      </div>

      {sections.length === 0 ? (
        <div className="eo-phone-empty">
          <ShoppingBag size={36} />
          <p>الصفحة فارغة. أضف عناصر من القائمة لبدء المعاينة.</p>
        </div>
      ) : (
        sections.map((section) => {
          const { type, enabled } = section;
          if (enabled === false) return null;

          switch (type) {
            case "BANNERS":
              return renderBannerSection(section);
            case "MEDIA":
              return (
                <MockMediaSection
                  key={section.id}
                  section={section}
                  product={product}
                  prodImg={prodImg}
                  activeMockImageIndex={activeMockImageIndex}
                  setActiveMockImageIndex={setActiveMockImageIndex}
                />
              );
            case "TEXT":
              return renderTextSection(section);
            case "FEATURES":
              return renderFeaturesSection(section);
            case "COUNTDOWN":
              return renderCountdownSection(section);
            case "FORM":
              return (
                <MockFormSection
                  key={section.id}
                  section={section}
                  product={product}
                  formConfig={formConfig}
                  bundleTiers={bundleTiers}
                  selectedBundleQty={selectedBundleQty}
                  setSelectedBundleQty={setSelectedBundleQty}
                  bundleTotal={bundleTotal}
                  priceNum={priceNum}
                  mockColors={mockColors}
                  mockSizes={mockSizes}
                />
              );
            case "REVIEWS":
              return renderReviewsSection(section);
            case "FAQ":
              return renderFaqSection(section);
            case "BREAKDOWN":
              return renderBreakdownSection(section);
            case "COMPARISON":
              return renderComparisonSection(section);
            case "LIVE_PROOF":
              return renderLiveProofSection(section);
            case "IMAGE_ONLY":
              return renderImageOnlySection(section, device, prodImg);
            case "CAROUSEL":
              return renderCarouselSection(section, prodImg);
            case "HOW_IT_WORKS":
              return renderHowItWorksSection(section);
            case "FEATURED_PRODUCT":
              return renderFeaturedProductSection(section, product, priceNum, prodImg);
            case "YOUTUBE_VIDEO":
              return renderYouTubeVideoSection(section);
            case "BUY_BUTTON":
              return renderBuyButtonSection(section);
            case "HEADING":
              return renderHeadingSection(section);
            case "BEFORE_AFTER":
              return renderBeforeAfterSection(section);
            case "HTML":
              return renderHtmlSection(section);
            case "WHATSAPP_CHAT":
              return renderWhatsAppChatSection(section);
            default:
              return null;
          }
        })
      )}
    </div>
  );
};
