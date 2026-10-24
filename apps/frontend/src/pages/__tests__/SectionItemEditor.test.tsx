/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SectionItemEditor } from "../advertising/product-landing/SectionItemEditor";
import { LandingSection } from "../advertising/product-landing/types";

// Mock the imageGalleryService
vi.mock("../../../services/imageGalleryService", () => ({
  imageGalleryService: {
    uploadImage: vi.fn().mockResolvedValue({ url: "https://example.com/uploaded.png" }),
    listImages: vi.fn().mockResolvedValue([]),
  },
}));

describe("SectionItemEditor Component", () => {
  it("renders TEXT section editor and handles updates", () => {
    const section: LandingSection = {
      id: "sec-1",
      type: "TEXT",
      content: {
        heading: "عنوان تجريبي",
        subheading: "عنوان فرعي",
        bodyText: "وصف المنتج التجريبي",
      },
    };
    const onUpdateContent = vi.fn();

    render(
      <SectionItemEditor
        section={section}
        onUpdateContent={onUpdateContent}
      />
    );

    const headingInput = screen.getByDisplayValue("عنوان تجريبي");
    expect(headingInput).toBeTruthy();

    fireEvent.change(headingInput, { target: { value: "عنوان جديد" } });
    expect(onUpdateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        heading: "عنوان جديد",
      })
    );
  });

  it("renders HEADING section editor with level and styling controls", () => {
    const section: LandingSection = {
      id: "sec-2",
      type: "HEADING",
      content: {
        title: "عنوان رئيسي كبير",
        headingLevel: "h2",
        alignment: "center",
      },
    };
    const onUpdateContent = vi.fn();

    render(
      <SectionItemEditor
        section={section}
        onUpdateContent={onUpdateContent}
      />
    );

    expect(screen.getByDisplayValue("عنوان رئيسي كبير")).toBeTruthy();
    const select = screen.getByDisplayValue("كبير رئيسي (H2)");
    expect(select).toBeTruthy();

    fireEvent.change(select, { target: { value: "h1" } });
    expect(onUpdateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        headingLevel: "h1",
      })
    );
  });

  it("renders COUNTDOWN section editor with tabular numbers", () => {
    const section: LandingSection = {
      id: "sec-3",
      type: "COUNTDOWN",
      content: {
        text: "عرض خاص لفترة محدودة",
        timerEndsMinutes: 30,
        lowStockCount: 5,
      },
    };
    const onUpdateContent = vi.fn();

    render(
      <SectionItemEditor
        section={section}
        onUpdateContent={onUpdateContent}
      />
    );

    expect(screen.getByDisplayValue("عرض خاص لفترة محدودة")).toBeTruthy();
    const timerInput = screen.getByDisplayValue("30");
    expect(timerInput).toBeTruthy();

    fireEvent.change(timerInput, { target: { value: "60" } });
    expect(onUpdateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        timerEndsMinutes: 60,
      })
    );
  });

  it("renders BUY_BUTTON section editor with action controls", () => {
    const section: LandingSection = {
      id: "sec-4",
      type: "BUY_BUTTON",
      content: {
        text: "اطلب الآن",
        targetAction: "scroll_to_form",
        btnColor: "#16a34a",
      },
    };
    const onUpdateContent = vi.fn();

    render(
      <SectionItemEditor
        section={section}
        onUpdateContent={onUpdateContent}
      />
    );

    expect(screen.getByDisplayValue("اطلب الآن")).toBeTruthy();
    expect(screen.getByDisplayValue("الانتقال السلس لنموذج الطلب (Scroll to Form)")).toBeTruthy();
  });

  it("renders FORM section editor with custom bundle tiers", () => {
    const section: LandingSection = {
      id: "sec-5",
      type: "FORM",
      content: {
        orderTitle: "نموذج الشراء السريع",
        bundles: [
          { qty: 1, label: "قطعة واحدة", discountPercent: 0, badge: "", freeGift: "" },
          { qty: 2, label: "قطعتين", discountPercent: 10, badge: "خصم", freeGift: "" },
        ],
      },
    };
    const onUpdateContent = vi.fn();

    render(
      <SectionItemEditor
        section={section}
        onUpdateContent={onUpdateContent}
      />
    );

    expect(screen.getByDisplayValue("نموذج الشراء السريع")).toBeTruthy();
    expect(screen.getByDisplayValue("قطعتين")).toBeTruthy();
  });

  it("returns null for unsupported section type safely", () => {
    const section = {
      id: "sec-unknown",
      type: "NON_EXISTENT_TYPE" as any,
      content: {},
    };
    const { container } = render(
      <SectionItemEditor
        section={section}
        onUpdateContent={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
