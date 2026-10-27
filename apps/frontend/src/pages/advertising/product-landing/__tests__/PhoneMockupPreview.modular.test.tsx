// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PhoneMockupPreview } from "../PhoneMockupPreview";
import {
  PhoneMockupHeader,
  PhoneMockupFrame,
  MockMediaSection,
  MockFormSection,
  renderBannerSection,
  renderTextSection,
  renderFeaturesSection,
  renderCountdownSection,
  renderHeadingSection,
  renderBuyButtonSection,
  renderBeforeAfterSection,
  renderHtmlSection,
  renderReviewsSection,
  renderFaqSection,
  renderBreakdownSection,
  renderComparisonSection,
  renderLiveProofSection,
  renderWhatsAppChatSection,
  renderImageOnlySection,
  renderCarouselSection,
  renderHowItWorksSection,
  renderFeaturedProductSection,
  renderYouTubeVideoSection,
} from "../phone-mockup";
import { LandingSection, ProductLandingProduct } from "../types";

afterEach(() => {
  cleanup();
});

const mockProduct: ProductLandingProduct = {
  id: "prod-1",
  name: "سنيكر كلاسيك رياضي",
  price: 500,
  images: ["https://example.com/shoe-1.jpg", "https://example.com/shoe-2.jpg"],
  variants: [
    { id: "v1", name: "أبيض في رمادي - 41", attributes: { color: "أبيض في رمادي", size: "41" } },
    { id: "v2", name: "أبيض في نبيتي - 42", attributes: { color: "أبيض في نبيتي", size: "42" } },
  ],
};

const mockFormConfig = {
  orderKicker: "خصم حصري",
  orderTitle: "اطلب الحذاء الآن",
  orderCopy: "الدفع عند الاستلام والشحن مجاناً",
  buttonLabel: "تأكيد الطلب السريع",
};

describe("PhoneMockupHeader", () => {
  it("renders live and instant mode buttons and toggles them", () => {
    const handleSetMode = vi.fn();
    const handleSetDevice = vi.fn();
    render(
      <PhoneMockupHeader
        viewMode="sync"
        setViewMode={handleSetMode}
        device="mobile"
        setDevice={handleSetDevice}
        previewUrl="https://store.test/lp/1"
        customerUrl="https://store.test/p/shoe"
        onRefreshIframe={vi.fn()}
      />
    );

    const liveBtn = screen.getByRole("button", { name: /المعاينة الحية/i });
    expect(liveBtn).toBeInTheDocument();
    fireEvent.click(liveBtn);
    expect(handleSetMode).toHaveBeenCalledWith("live");

    const tabletBtn = screen.getByTitle(/عرض التابلت/i);
    expect(tabletBtn).toBeInTheDocument();
    fireEvent.click(tabletBtn);
    expect(handleSetDevice).toHaveBeenCalledWith("tablet");
  });
});

describe("PhoneMockupFrame", () => {
  it("renders mobile notch when in mobile view and not full bleed", () => {
    const { container } = render(
      <PhoneMockupFrame
        device="mobile"
        isMobileView={false}
        viewMode="sync"
      >
        <div>Content</div>
      </PhoneMockupFrame>
    );
    expect(container.querySelector(".eo-phone-notch")).toBeInTheDocument();
    expect(screen.getByText("store.maxp.online/lp/live")).toBeInTheDocument();
  });

  it("omits mobile notch when isMobileView is true", () => {
    const { container } = render(
      <PhoneMockupFrame
        device="mobile"
        isMobileView={true}
        viewMode="sync"
      >
        <div>Content</div>
      </PhoneMockupFrame>
    );
    expect(container.querySelector(".eo-phone-notch")).not.toBeInTheDocument();
  });
});

describe("MockMediaSection", () => {
  it("renders media gallery and allows next/previous navigation", () => {
    const setMockIndex = vi.fn();
    const mediaSection: LandingSection = {
      id: "media-1",
      type: "MEDIA",
      content: { images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"] },
    };

    render(
      <MockMediaSection
        section={mediaSection}
        product={mockProduct}
        activeMockImageIndex={0}
        setActiveMockImageIndex={setMockIndex}
      />
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    const nextBtn = screen.getByLabelText("الصورة التالية");
    fireEvent.click(nextBtn);
    expect(setMockIndex).toHaveBeenCalled();
  });
});

describe("MockFormSection", () => {
  it("renders bundle tiers and handles quantity selection", () => {
    const handleSetQty = vi.fn();
    const formSection: LandingSection = {
      id: "form-1",
      type: "FORM",
      content: { orderTitle: "اطلب الآن" },
    };

    const bundleTiers = [
      { qty: 1, label: "قطعة واحدة", discount: 0, badge: "" },
      { qty: 2, label: "قطعتين (وفر 15%)", discount: 15, badge: "الأكثر طلباً 🔥" },
    ];

    render(
      <MockFormSection
        section={formSection}
        product={mockProduct}
        formConfig={mockFormConfig}
        bundleTiers={bundleTiers}
        selectedBundleQty={1}
        setSelectedBundleQty={handleSetQty}
        bundleTotal={500}
        priceNum={500}
        mockColors={["أبيض", "أسود"]}
        mockSizes={["41", "42"]}
      />
    );

    expect(screen.getByText("اطلب الآن")).toBeInTheDocument();
    const bundleTwo = screen.getByText(/قطعتين/);
    fireEvent.click(bundleTwo);
    expect(handleSetQty).toHaveBeenCalledWith(2);
    expect(screen.getByText(/تأكيد الطلب السريع/)).toBeInTheDocument();
  });
});

describe("MockContentSections renderers", () => {
  it("renders banners, text, features, countdown and buy button", () => {
    const bannerSec: LandingSection = {
      id: "b1",
      type: "BANNERS",
      content: { bannerText: "عرض اليوم فقط" },
    };
    const { getByText: getBannerText } = render(renderBannerSection(bannerSec));
    expect(getBannerText("عرض اليوم فقط")).toBeInTheDocument();

    const textSec: LandingSection = {
      id: "t1",
      type: "TEXT",
      content: { heading: "عنوان تجريبي", subheading: "نص فرعي" },
    };
    const { getByText: getTextContent } = render(renderTextSection(textSec));
    expect(getTextContent("عنوان تجريبي")).toBeInTheDocument();
    expect(getTextContent("نص فرعي")).toBeInTheDocument();

    const featSec: LandingSection = {
      id: "f1",
      type: "FEATURES",
      content: { features: [{ icon: "⭐", title: "مريح جداً", desc: "نعل طبي مرن" }] },
    };
    const { getByText: getFeatContent } = render(renderFeaturesSection(featSec));
    expect(getFeatContent("مريح جداً")).toBeInTheDocument();

    const countSec: LandingSection = {
      id: "c1",
      type: "COUNTDOWN",
      content: { lowStockCount: 5 },
    };
    const { getByText: getCountContent } = render(renderCountdownSection(countSec));
    expect(getCountContent(/باقي 5 قطعة فقط/)).toBeInTheDocument();

    const headSec: LandingSection = {
      id: "h1",
      type: "HEADING",
      content: { title: "مقدمة المنتج", badge: "جديد" },
    };
    const { getByText: getHeadContent } = render(renderHeadingSection(headSec));
    expect(getHeadContent("مقدمة المنتج")).toBeInTheDocument();
    expect(getHeadContent("جديد")).toBeInTheDocument();

    const btnSec: LandingSection = {
      id: "bb1",
      type: "BUY_BUTTON",
      content: { text: "اشتري الحين" },
    };
    const { getByText: getBtnContent } = render(renderBuyButtonSection(btnSec));
    expect(getBtnContent("اشتري الحين")).toBeInTheDocument();

    const baSec: LandingSection = {
      id: "ba1",
      type: "BEFORE_AFTER",
      content: { beforeLabel: "قبل الشراء", afterLabel: "بعد الشراء" },
    };
    const { getByText: getBaContent } = render(renderBeforeAfterSection(baSec));
    expect(getBaContent("قبل الشراء")).toBeInTheDocument();
    expect(getBaContent("بعد الشراء")).toBeInTheDocument();

    const htmlSec: LandingSection = {
      id: "ht1",
      type: "HTML",
      content: { htmlContent: "<div class='custom-html'>كود مخصص</div>" },
    };
    const { getByText: getHtmlContent } = render(renderHtmlSection(htmlSec));
    expect(getHtmlContent("كود مخصص")).toBeInTheDocument();
  });
});

describe("MockSocialProofSections & MockRichMediaSections", () => {
  it("renders reviews in standard and whatsapp variants", () => {
    const revSec: LandingSection = {
      id: "r1",
      type: "REVIEWS",
      content: { reviews: [{ name: "أحمد كمال", rating: 5, text: "ممتاز جداً" }] },
    };
    const { getByText } = render(renderReviewsSection(revSec));
    expect(getByText("أحمد كمال")).toBeInTheDocument();
    expect(getByText("ممتاز جداً")).toBeInTheDocument();

    const waRevSec: LandingSection = {
      id: "r2",
      type: "REVIEWS",
      variant: "WHATSAPP",
      content: { reviews: [{ name: "سارة محمود", text: "وصل في يومين" }] },
    };
    const { getByText: getWaText } = render(renderReviewsSection(waRevSec));
    expect(getWaText("سارة محمود")).toBeInTheDocument();
    expect(getWaText("وصل في يومين")).toBeInTheDocument();
  });

  it("renders FAQ, Breakdown, and Comparison sections", () => {
    const faqSec: LandingSection = {
      id: "faq1",
      type: "FAQ",
      content: { faqs: [{ question: "هل المقاس مضبوط؟", answer: "نعم مقاسات قياسية" }] },
    };
    const { getByText: getFaqText } = render(renderFaqSection(faqSec));
    expect(getFaqText("س: هل المقاس مضبوط؟")).toBeInTheDocument();

    const compSec: LandingSection = {
      id: "comp1",
      type: "COMPARISON",
      content: {
        comparisonTitle: "مقارنة الجودة",
        comparisonItems: [{ feature: "الجلد", us: "طبيعي", them: "صناعي" }],
      },
    };
    const { getByText: getCompText } = render(renderComparisonSection(compSec));
    expect(getCompText("مقارنة الجودة")).toBeInTheDocument();
    expect(getCompText("✓ طبيعي")).toBeInTheDocument();
  });

  it("renders How It Works, Featured Product, and YouTube Video", () => {
    const hiwSec: LandingSection = {
      id: "hiw1",
      type: "HOW_IT_WORKS",
      content: { steps: [{ title: "الطلب", desc: "املأ البيانات" }] },
    };
    const { getByText: getHiwText } = render(renderHowItWorksSection(hiwSec));
    expect(getHiwText("الطلب")).toBeInTheDocument();

    const featProdSec: LandingSection = {
      id: "fp1",
      type: "FEATURED_PRODUCT",
      content: { productName: "الحذاء الماسي", price: 650 },
    };
    const { getByText: getFpText } = render(
      renderFeaturedProductSection(featProdSec, mockProduct, 650)
    );
    expect(getFpText("الحذاء الماسي")).toBeInTheDocument();

    const ytSec: LandingSection = {
      id: "yt1",
      type: "YOUTUBE_VIDEO",
      content: { videoId: "dQw4w9WgXcQ" },
    };
    const { container: ytContainer } = render(renderYouTubeVideoSection(ytSec));
    expect(ytContainer.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });
});

describe("PhoneMockupPreview Coordinator", () => {
  it("renders live iframe when in live mode with previewUrl", () => {
    const { container } = render(
      <PhoneMockupPreview
        title="معاينة"
        product={mockProduct}
        sections={[]}
        formConfig={mockFormConfig}
        previewUrl="https://store.maxp.online/lp/preview-1"
      />
    );
    const iframe = container.querySelector("iframe.eo-live-iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://store.maxp.online/lp/preview-1");
  });

  it("renders empty state canvas when in sync mode with no sections", () => {
    render(
      <PhoneMockupPreview
        title="معاينة"
        product={mockProduct}
        sections={[]}
        formConfig={mockFormConfig}
      />
    );
    expect(screen.getByText(/الصفحة فارغة\. أضف عناصر من القائمة/i)).toBeInTheDocument();
  });
});
