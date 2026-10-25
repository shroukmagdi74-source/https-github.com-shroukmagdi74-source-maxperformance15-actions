// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { StudioInspectorAiTab } from "../studio/inspector/StudioInspectorAiTab";
import {
  AI_CAPABILITIES,
  COMING_SOON_NOTICE,
  isCapabilityAvailable,
} from "../studio/inspector/aiCapabilities";

describe("Ticket AI-1: Honest Storefront Studio AI Tab (P0 #57)", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    sectionType: "hero-banner",
    settings: {
      title: "عنوان افتراضي",
      subtitle: "وصف افتراضي",
      responsive: {},
    },
    deviceMode: "desktop" as const,
    onUpdateField: vi.fn(),
    onBatchUpdateFields: vi.fn(),
    onResetDeviceOverrides: vi.fn(),
    onSwitchDevice: vi.fn(),
  };

  // Test 1: All elements of AI_CAPABILITIES appear in the tab
  it("1. renders all elements from AI_CAPABILITIES in the tab", () => {
    render(<StudioInspectorAiTab {...defaultProps} />);

    expect(screen.getByTestId("ai-capabilities-panel")).toBeTruthy();
    expect(screen.getByTestId("ai-capabilities-list")).toBeTruthy();

    AI_CAPABILITIES.forEach((cap) => {
      // Label text is visible in the panel
      expect(screen.getAllByText(cap.label).length).toBeGreaterThanOrEqual(1);
      // Testid element is present
      expect(screen.getByTestId(`capability-card-${cap.id}`)).toBeTruthy();
      expect(screen.getByTestId(`btn-${cap.id}`)).toBeTruthy();
    });

    expect(AI_CAPABILITIES.length).toBe(5);
  });

  // Test 2: coming_soon elements have disabled buttons and «قريبًا» badge
  it("2. disables coming_soon capability buttons, renders «قريبًا» badge and honest notice", () => {
    render(<StudioInspectorAiTab {...defaultProps} />);

    const comingSoonCaps = AI_CAPABILITIES.filter(
      (c) => c.status === "coming_soon"
    );
    expect(comingSoonCaps.length).toBe(3);

    comingSoonCaps.forEach((cap) => {
      const button = screen.getByTestId(`btn-${cap.id}`) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(button.getAttribute("aria-disabled")).toBe("true");

      const badge = screen.getByTestId(`badge-${cap.id}`);
      expect(badge.textContent?.trim()).toBe("قريبًا");
    });

    const notices = screen.getAllByText(COMING_SOON_NOTICE);
    expect(notices.length).toBe(comingSoonCaps.length);
  });

  // Test 3: available elements have enabled buttons and «متاح» badge
  it("3. enables available capability buttons and renders «متاح» badge", () => {
    render(<StudioInspectorAiTab {...defaultProps} />);

    const availableCaps = AI_CAPABILITIES.filter(
      (c) => c.status === "available"
    );
    expect(availableCaps.length).toBe(2);

    availableCaps.forEach((cap) => {
      const button = screen.getByTestId(`btn-${cap.id}`) as HTMLButtonElement;
      expect(button.disabled).toBe(false);
      expect(button.getAttribute("aria-disabled")).toBeNull();

      const badge = screen.getByTestId(`badge-${cap.id}`);
      expect(badge.textContent?.trim()).toBe("متاح");
    });
  });

  // Test 4: Clicking available elements invokes the correct handler (spy)
  it("4. invokes corresponding handlers (spies) when clicking available capabilities", () => {
    const onCapabilityAction = vi.fn();
    const onSuggestSections = vi.fn();
    const onApplyCopyTemplate = vi.fn();
    const onBatchUpdateFields = vi.fn();

    render(
      <StudioInspectorAiTab
        {...defaultProps}
        onCapabilityAction={onCapabilityAction}
        onSuggestSections={onSuggestSections}
        onApplyCopyTemplate={onApplyCopyTemplate}
        onBatchUpdateFields={onBatchUpdateFields}
      />
    );

    // 1. Click section suggestions
    const sectionBtn = screen.getByTestId("btn-section-suggestions");
    fireEvent.click(sectionBtn);

    expect(onSuggestSections).toHaveBeenCalledTimes(1);
    expect(onCapabilityAction).toHaveBeenCalledWith("section-suggestions");
    expect(screen.getByTestId("panel-section-suggestions")).toBeTruthy();

    // 2. Click copy templates
    const copyBtn = screen.getByTestId("btn-copy-templates");
    fireEvent.click(copyBtn);

    expect(onApplyCopyTemplate).toHaveBeenCalledWith("default");
    expect(onCapabilityAction).toHaveBeenCalledWith("copy-templates");
    expect(onBatchUpdateFields).toHaveBeenCalled();
    expect(screen.getByTestId("panel-copy-templates")).toBeTruthy();
  });

  // Test 5: Clicking coming_soon elements does NOT invoke any handler
  it("5. does NOT invoke any handler when clicking or attempting to trigger coming_soon capabilities", () => {
    const onCapabilityAction = vi.fn();
    const onSuggestSections = vi.fn();
    const onApplyCopyTemplate = vi.fn();

    render(
      <StudioInspectorAiTab
        {...defaultProps}
        onCapabilityAction={onCapabilityAction}
        onSuggestSections={onSuggestSections}
        onApplyCopyTemplate={onApplyCopyTemplate}
      />
    );

    const comingSoonIds = ["image-generation", "auto-layout", "content-rewrite"] as const;

    comingSoonIds.forEach((id) => {
      const btn = screen.getByTestId(`btn-${id}`);
      fireEvent.click(btn);
    });

    expect(onCapabilityAction).not.toHaveBeenCalled();
    expect(onSuggestSections).not.toHaveBeenCalled();
    expect(onApplyCopyTemplate).not.toHaveBeenCalled();
  });

  // Test 6: Zero false promises or exaggerated claims
  it("6. guarantees zero false promises or hype claims (no 'تلقائيًا هيولّد' or 'في ثانية')", () => {
    const { container } = render(<StudioInspectorAiTab {...defaultProps} />);
    const fullText = container.textContent || "";

    // Strictly forbidden hype words
    expect(fullText.includes("تلقائيًا هيولّد")).toBe(false);
    expect(fullText.includes("في ثانية")).toBe(false);
    expect(fullText.includes("ذكاء خارق")).toBe(false);
    expect(fullText.includes("صفحة كاملة في ثانية")).toBe(false);

    // AI_CAPABILITIES labels check
    AI_CAPABILITIES.forEach((cap) => {
      expect(cap.label.includes("تلقائيًا هيولّد")).toBe(false);
      expect(cap.label.includes("في ثانية")).toBe(false);
    });
  });

  // Test 7: aiCapabilities single source of truth validation
  it("7. verifies aiCapabilities.ts contract and helper functions", () => {
    expect(AI_CAPABILITIES).toHaveLength(5);

    const available = AI_CAPABILITIES.filter((c) => c.status === "available");
    const comingSoon = AI_CAPABILITIES.filter((c) => c.status === "coming_soon");

    expect(available).toHaveLength(2);
    expect(comingSoon).toHaveLength(3);

    expect(isCapabilityAvailable("available")).toBe(true);
    expect(isCapabilityAvailable("coming_soon")).toBe(false);
    expect(COMING_SOON_NOTICE).toBe("مش متاحة دلوقتي — بنشتغل عليها");
  });

  // Test 8: Selecting a copy template applies updates to section settings
  it("8. applies selected copy template directly to section fields", () => {
    const onBatchUpdateFields = vi.fn();

    render(
      <StudioInspectorAiTab
        {...defaultProps}
        onBatchUpdateFields={onBatchUpdateFields}
      />
    );

    // Open copy templates
    const copyBtn = screen.getByTestId("btn-copy-templates");
    fireEvent.click(copyBtn);

    // Click template 1
    const tmplBtn = screen.getByTestId("template-btn-1");
    fireEvent.click(tmplBtn);

    expect(onBatchUpdateFields).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "تشكيلة جديدة مميزة بتصاميم عصرية",
        subtitle: "أفضل الخامات المختارة بعناية لتناسب ذوقك واحتياجاتك اليومية",
      })
    );
  });

  // Test 9: Zero regression on device switcher & mobile overrides
  it("9. maintains full backward-compatibility with device switcher and responsive overrides", () => {
    const onSwitchDevice = vi.fn();
    const onResetDeviceOverrides = vi.fn();

    render(
      <StudioInspectorAiTab
        {...defaultProps}
        deviceMode="mobile"
        settings={{
          responsive: {
            mobile: {
              paddingTop: 16,
            },
          },
        }}
        onSwitchDevice={onSwitchDevice}
        onResetDeviceOverrides={onResetDeviceOverrides}
      />
    );

    // Switcher buttons
    const desktopBtn = screen.getByText("كمبيوتر").closest("button");
    fireEvent.click(desktopBtn!);
    expect(onSwitchDevice).toHaveBeenCalledWith("desktop");

    // Reset button
    const resetBtn = screen.getByText("تصفير قيم الجوال والعودة للوراثة");
    fireEvent.click(resetBtn);
    expect(onResetDeviceOverrides).toHaveBeenCalledWith("mobile");
  });
});
