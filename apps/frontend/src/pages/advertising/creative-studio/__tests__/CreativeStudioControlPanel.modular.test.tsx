// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CreativeStudioControlPanel } from "../CreativeStudioControlPanel";
import type {
  MarketingProduct,
  CanvasOverlaySettings,
  BrandKitSettings,
} from "../types";

vi.mock("../CreativeAiChatCoPilot", () => ({
  CreativeAiChatCoPilot: () => <div data-testid="mock-copilot">مساعد الإيجنت الإبداعي</div>,
}));

vi.mock("../CreativeDirectorSuggestions", () => ({
  CreativeDirectorSuggestions: () => (
    <div data-testid="mock-director">اقتراحات المخرج الإبداعي</div>
  ),
}));

vi.mock("../CreativeSceneLibraryTab", () => ({
  CreativeSceneLibraryTab: () => (
    <div data-testid="mock-scene-library">مكتبة المشاهد الجاهزة</div>
  ),
}));

const mockProduct: MarketingProduct = {
  id: "prod-1",
  name: "حذاء رياضي أنيق",
  description: "حذاء جري عالي الجودة ومريح",
  imageUrl: "https://example.com/shoe.jpg",
  price: 1200,
  category: "أحذية",
};

const defaultOverlay: CanvasOverlaySettings = {
  headline: "عرض نهاية الأسبوع",
  subheadline: "توصيل سريع مجاني",
  discountBadge: "خصم 30%",
  callToAction: "اشتري الآن",
  primaryColor: "#4f46e5",
  accentColor: "#f59e0b",
  productTransform: {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    shadowType: "contact",
  },
  logo: {
    url: null,
    position: "top-right",
    size: "md",
    opacity: 1,
    show: false,
  },
};

const defaultBrandKit: BrandKitSettings = {
  isLocked: false,
  primaryColor: "#4f46e5",
  accentColor: "#f59e0b",
  aestheticMood: "minimalist-luxury",
};

describe("CreativeStudioControlPanel Modular Component", () => {
  const onGenerate = vi.fn();
  const onChangeBatchCount = vi.fn();
  const onSelectPreset = vi.fn();
  const onSelectModel = vi.fn();
  const onChangeAspectRatio = vi.fn();
  const onUpdateOverlay = vi.fn();
  const onChangeCustomPrompt = vi.fn();
  const onSetReferenceImageUrl = vi.fn();
  const onUpdateBrandKit = vi.fn();
  const onOpenModelModal = vi.fn();
  const onTriggerGenerateWithPrompt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderPanel = (propsOverrides = {}) => {
    const props = {
      selectedProduct: mockProduct,
      selectedPresetId: "minimalist-podium",
      onSelectPreset,
      selectedModel: "imagen-3.0-generate-002",
      onSelectModel,
      aspectRatio: "1:1" as const,
      onChangeAspectRatio,
      overlay: defaultOverlay,
      onUpdateOverlay,
      customPrompt: "",
      onChangeCustomPrompt,
      isGenerating: false,
      onGenerate,
      dailyUsage: 5,
      dailyLimit: 50,
      referenceImageUrl: null,
      onSetReferenceImageUrl,
      brandKit: defaultBrandKit,
      onUpdateBrandKit,
      batchCount: 1 as const,
      onChangeBatchCount,
      onOpenModelModal,
      onTriggerGenerateWithPrompt,
      ...propsOverrides,
    };

    return render(<CreativeStudioControlPanel {...props} />);
  };

  it("renders the top action bar with generate button and quota", () => {
    renderPanel();

    expect(
      screen.getByRole("button", { name: /توليد المشهد بالذكاء الاصطناعي/ })
    ).toBeInTheDocument();
    expect(screen.getByText("الرصيد المتبقي:")).toBeInTheDocument();
    expect(screen.getByText("45/50")).toBeInTheDocument();
  });

  it("handles batch count change when batch buttons are clicked", () => {
    renderPanel();

    const batch2xButton = screen.getByRole("button", { name: "2x" });
    fireEvent.click(batch2xButton);

    expect(onChangeBatchCount).toHaveBeenCalledWith(2);
  });

  it("renders all 7 navigation tabs", () => {
    renderPanel();

    expect(screen.getByRole("button", { name: /محادثة الإيجنت/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /المخرج الإبداعي/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /مكتبة المشاهد والتبديل/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /البيئات الأربعة/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /الظلال والحجم/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /نصوص العرض/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /الموديل/ })).toBeInTheDocument();
  });

  it("switches to PRESETS tab and displays modality filters and style reference uploader", () => {
    renderPanel();

    const presetsTab = screen.getByRole("button", { name: /البيئات الأربعة/ });
    fireEvent.click(presetsTab);

    expect(
      screen.getByText("صورة مرجعية للأسلوب (Style Reference)")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /الكل/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /سياق الحياة/ })).toBeInTheDocument();
  });

  it("switches to PHYSICS tab and triggers overlay transform updates", () => {
    renderPanel();

    const physicsTab = screen.getByRole("button", { name: /الظلال والحجم/ });
    fireEvent.click(physicsTab);

    expect(screen.getByText("فيزياء الظل (Shadow Physics)")).toBeInTheDocument();
    expect(screen.getByText("حجم المنتج (Scale)")).toBeInTheDocument();

    const directionalShadowBtn = screen.getByRole("button", {
      name: /ظل استوديو مائل/,
    });
    fireEvent.click(directionalShadowBtn);

    expect(onUpdateOverlay).toHaveBeenCalledWith(
      expect.objectContaining({
        productTransform: expect.objectContaining({
          shadowType: "directional",
        }),
      })
    );
  });

  it("switches to TYPOGRAPHY tab and edits headline and brand kit lock", () => {
    renderPanel();

    const typoTab = screen.getByRole("button", { name: /نصوص العرض/ });
    fireEvent.click(typoTab);

    const headlineInput = screen.getByDisplayValue("عرض نهاية الأسبوع");
    fireEvent.change(headlineInput, { target: { value: "تخفيضات الربيع الكبرى" } });

    expect(onUpdateOverlay).toHaveBeenCalledWith({
      headline: "تخفيضات الربيع الكبرى",
    });

    const lockButton = screen.getByRole("button", { name: /غير مثبت/ });
    fireEvent.click(lockButton);

    expect(onUpdateBrandKit).toHaveBeenCalledWith({ isLocked: true });
  });

  it("switches to ADVANCED tab and selects AI model", () => {
    renderPanel();

    const advancedTab = screen.getByRole("button", { name: /الموديل/ });
    fireEvent.click(advancedTab);

    expect(screen.getByText("محرك الذكاء الاصطناعي الحالي")).toBeInTheDocument();
    expect(screen.getByText("برومبت مخصص إضافي (Prompt)")).toBeInTheDocument();

    const modalBtn = screen.getByRole("button", { name: /معرض النماذج/ });
    fireEvent.click(modalBtn);

    expect(onOpenModelModal).toHaveBeenCalled();
  });
});
