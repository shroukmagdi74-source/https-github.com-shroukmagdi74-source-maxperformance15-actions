import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreativePageSelector } from "../step5-creative/CreativePageSelector";
import { CreativeSourceSelector } from "../step5-creative/CreativeSourceSelector";
import { CreativeFormatSelector } from "../step5-creative/CreativeFormatSelector";
import { CreativeCarouselCardsSection } from "../step5-creative/CreativeCarouselCardsSection";
import { CreativeCallToActionSection } from "../step5-creative/CreativeCallToActionSection";
import { CreativeAdvantageEnhancementsSection } from "../step5-creative/CreativeAdvantageEnhancementsSection";
import { CreativePreviewSidebar } from "../step5-creative/CreativePreviewSidebar";
import type { FormData } from "../../types";

const mockFormData: FormData = {
  campaignName: "Test Campaign",
  adSetName: "Test AdSet",
  adName: "Test Ad",
  objective: "OUTCOME_SALES",
  specialAdCategories: [],
  pageId: "page-123",
  instagramActorId: "",
  creativeType: "SINGLE_IMAGE",
  headline: "Ad Headline",
  primaryText: "Ad Primary Text",
  description: "Ad Description",
  callToAction: "SHOP_NOW",
  linkUrl: "https://example.com/shop",
  productId: "",
  displayLink: "",
  urlParameters: "",
  imageUrl: "",
  videoUrl: "",
  carouselCards: [
    {
      id: "card-1",
      imageUrl: "https://example.com/card1.jpg",
      headline: "Card 1 Headline",
      description: "Card 1 Desc",
      linkUrl: "https://example.com/1",
    },
    {
      id: "card-2",
      imageUrl: "https://example.com/card2.jpg",
      headline: "Card 2 Headline",
      description: "Card 2 Desc",
      linkUrl: "https://example.com/2",
    },
  ],
  flexibleAssets: [],
  textVariations: [],
  headlineVariations: [],
  useLeadForm: false,
  advantageCreative: true,
  textGeneration: true,
  imageEnhancement: true,
  performanceGoal: "MAXIMIZE_CONVERSIONS",
  conversionEvent: "PURCHASE",
  conversionLocation: "WEBSITE",
  attributionWindow: "7d_click_1d_view",
  dynamicCreative: false,
  budgetOptimization: true,
  budgetType: "DAILY",
  budgetAmount: 100,
  bidStrategy: "LOWEST_COST",
  locations: ["EG"],
  locationTypes: ["home"],
  ageMin: 18,
  ageMax: 65,
  genders: [1, 2],
  interests: [],
  behaviors: [],
  demographics: [],
  languages: [],
  customAudiences: [],
  excludedCustomAudiences: [],
  advantageAudience: true,
  placementType: "AUTOMATIC",
  publisherPlatforms: ["facebook", "instagram"],
  facebookPositions: ["feed"],
  instagramPositions: ["stream"],
  messengerPositions: [],
  audienceNetworkPositions: [],
  devicePlatforms: ["mobile", "desktop"],
};

describe("Step5Creative Modular Subcomponents", () => {
  it("renders CreativePageSelector with ready company pages and triggers change", () => {
    const handleChange = jest.fn();
    const mockPages: any[] = [
      { id: "page-1", name: "MaxP Store", category: "Retail", status: "READY" },
      { id: "page-2", name: "Fashion Hub", category: "Apparel", status: "READY" },
    ];
    const mockMeta: any = {
      counts: { ready: 2, accessibleButNotConnected: 0, connectedButNotAccessible: 0 },
    };

    render(
      <CreativePageSelector
        formData={mockFormData}
        handleChange={handleChange}
        getError={() => ""}
        facebookPages={mockPages}
        facebookPagesMeta={mockMeta}
        loadingPages={false}
        selectedFacebookPage={mockPages[0]}
        isEn={true}
      />,
    );

    expect(screen.getByText(/Facebook Page/)).toBeInTheDocument();
    expect(screen.getByText(/Ready Pages:/)).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "page-2" } });
    expect(handleChange).toHaveBeenCalledWith("pageId", "page-2");
  });

  it("renders CreativeSourceSelector and toggles source type", () => {
    const setCreativeSource = jest.fn();
    const handleChange = jest.fn();

    render(
      <CreativeSourceSelector
        creativeSource="NEW_AD"
        setCreativeSource={setCreativeSource}
        formData={mockFormData}
        handleChange={handleChange}
        isEn={true}
      />,
    );

    const existingPostBtn = screen.getByText("Use Existing Post");
    fireEvent.click(existingPostBtn);
    expect(setCreativeSource).toHaveBeenCalledWith("EXISTING_POST");
    expect(handleChange).toHaveBeenCalledWith("creativeType", "EXISTING_POST");
  });

  it("renders CreativeFormatSelector and switches format", () => {
    const handleChange = jest.fn();

    render(
      <CreativeFormatSelector
        formData={mockFormData}
        handleChange={handleChange}
        getError={() => ""}
        isEn={true}
      />,
    );

    const videoBtn = screen.getByText("Video");
    fireEvent.click(videoBtn);
    expect(handleChange).toHaveBeenCalledWith("creativeType", "SINGLE_VIDEO");

    const carouselBtn = screen.getByText("Carousel");
    fireEvent.click(carouselBtn);
    expect(handleChange).toHaveBeenCalledWith("creativeType", "CAROUSEL");
  });

  it("renders CreativeCarouselCardsSection and manages cards", () => {
    const handleChange = jest.fn();
    const handleAddCard = jest.fn();
    const handleRemoveCard = jest.fn();
    const handleUpdateCard = jest.fn();

    render(
      <CreativeCarouselCardsSection
        formData={mockFormData}
        handleChange={handleChange}
        getError={() => ""}
        isEn={true}
        uploadingCardId={null}
        handleCardImageUpload={jest.fn()}
        handleAddCard={handleAddCard}
        handleRemoveCard={handleRemoveCard}
        handleUpdateCard={handleUpdateCard}
      />,
    );

    expect(screen.getByText(/Carousel Cards \(2\/10\)/)).toBeInTheDocument();
    const addCardBtn = screen.getByText("+ Add Card");
    fireEvent.click(addCardBtn);
    expect(handleAddCard).toHaveBeenCalled();
  });

  it("renders CreativeCallToActionSection and triggers selection", () => {
    const handleChange = jest.fn();
    const ctas = [
      { label: "Shop Now", value: "SHOP_NOW" },
      { label: "Order Now", value: "ORDER_NOW" },
    ];

    render(
      <CreativeCallToActionSection
        formData={mockFormData}
        handleChange={handleChange}
        callToActions={ctas}
        isEn={true}
      />,
    );

    const orderNowBtn = screen.getByText("Order Now");
    fireEvent.click(orderNowBtn);
    expect(handleChange).toHaveBeenCalledWith("callToAction", "ORDER_NOW");
  });

  it("renders CreativeAdvantageEnhancementsSection and toggles switch", () => {
    const handleChange = jest.fn();

    render(
      <CreativeAdvantageEnhancementsSection
        formData={mockFormData}
        handleChange={handleChange}
        isEn={true}
      />,
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith("advantageCreative", false);
  });

  it("renders CreativePreviewSidebar with Advantage+ options", () => {
    const handleChange = jest.fn();

    render(
      <CreativePreviewSidebar
        formData={mockFormData}
        handleChange={handleChange}
        pageName="Test Store"
        creativeSource="NEW_AD"
        isEn={true}
      />,
    );

    expect(screen.getByText("Advantage+ Creative")).toBeInTheDocument();
    expect(screen.getByText("Text Optimization")).toBeInTheDocument();
    expect(screen.getByText("Image & Contrast Enhancement")).toBeInTheDocument();
  });
});
