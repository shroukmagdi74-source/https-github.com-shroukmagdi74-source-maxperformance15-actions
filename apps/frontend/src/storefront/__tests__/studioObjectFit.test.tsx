/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, afterEach, vi } from "vitest";

import {
  buildBackgroundMediaStyle,
  buildMediaObjectStyle,
  buildSectionStyle,
  generateResponsiveCss,
  isPropertyOverridden,
  normalizeObjectFit,
  normalizeObjectPosition,
  styleObjectToCssDeclarations,
} from "../studio/utils/studioStyleUtils";
import { StudioInspectorLayoutTab } from "../studio/inspector/StudioInspectorLayoutTab";
import ImageElement from "../sections/elements/ImageElement";
import VideoElement from "../sections/elements/VideoElement";
import StoryParallax from "../sections/StoryParallax";

const SELECTOR = '[data-section-key="media-sec"]';

describe("FIT-1: Object Fit & Object Position (images / video / background media)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ── 1 ─────────────────────────────────────────────────────────────
  it("1. normalizeObjectFit accepts the 5 CSS values and rejects junk/empty input", () => {
    expect(normalizeObjectFit("cover")).toBe("cover");
    expect(normalizeObjectFit("contain")).toBe("contain");
    expect(normalizeObjectFit("fill")).toBe("fill");
    expect(normalizeObjectFit("none")).toBe("none");
    expect(normalizeObjectFit("scale-down")).toBe("scale-down");
    expect(normalizeObjectFit("SCALE_DOWN")).toBe("scale-down");

    expect(normalizeObjectFit("")).toBeUndefined();
    expect(normalizeObjectFit(undefined)).toBeUndefined();
    expect(normalizeObjectFit(null)).toBeUndefined();
    expect(normalizeObjectFit("auto")).toBeUndefined();
    expect(normalizeObjectFit("stretch")).toBeUndefined();
    expect(normalizeObjectFit(42)).toBeUndefined();
  });

  // ── 2 ─────────────────────────────────────────────────────────────
  it('2. objectFit="contain" produces CSS `object-fit: contain` (declarations + section style)', () => {
    const decls = styleObjectToCssDeclarations({ objectFit: "contain" });
    expect(decls).toContain("object-fit: contain;");

    const style = buildSectionStyle({ objectFit: "contain" });
    expect(style.objectFit).toBe("contain");

    const mediaStyle = buildMediaObjectStyle({ objectFit: "contain" });
    expect(mediaStyle).toEqual({ objectFit: "contain" });
  });

  // ── 3 ─────────────────────────────────────────────────────────────
  it('3. objectPosition custom "30% 70%" produces `object-position: 30% 70%` and presets map correctly', () => {
    // "custom 30% 70%" is the raw form the inspector can persist.
    expect(normalizeObjectPosition("custom 30% 70%")).toBe("30% 70%");
    expect(normalizeObjectPosition("30% 70%")).toBe("30% 70%");
    expect(normalizeObjectPosition("top-left")).toBe("0% 0%");
    expect(normalizeObjectPosition("center")).toBe("50% 50%");
    expect(normalizeObjectPosition("bottom-right")).toBe("100% 100%");
    expect(normalizeObjectPosition("nonsense-value")).toBeUndefined();

    const decls = styleObjectToCssDeclarations({ objectPosition: "30% 70%" });
    expect(decls).toContain("object-position: 30% 70%;");

    const style = buildSectionStyle({ objectPosition: "30% 70%" });
    expect(style.objectPosition).toBe("30% 70%");
  });

  // ── 4 ─────────────────────────────────────────────────────────────
  it("4. breakpoint override: different object-fit on mobile/tablet lands in the media query, base stays desktop", () => {
    const settings = {
      objectFit: "contain",
      objectPosition: "50% 50%",
      responsive: {
        tablet: { objectFit: "none" },
        mobile: { objectFit: "cover", objectPosition: "30% 70%" },
      },
    };

    const css = generateResponsiveCss(settings, SELECTOR);
    expect(css).toBeTruthy();

    // Base (desktop) rule uses the desktop value on descendant media.
    expect(css).toContain(`${SELECTOR} img, ${SELECTOR} video {`);
    expect(css).toContain("object-fit: contain;");

    // Tablet media query carries its own value.
    const tabletStart = css!.indexOf("@media (min-width: 768px) and (max-width: 1023.98px)");
    const mobileStart = css!.indexOf("@media (max-width: 767.98px)");
    expect(tabletStart).toBeGreaterThan(-1);
    expect(mobileStart).toBeGreaterThan(-1);
    const tabletBlock = css!.slice(tabletStart, mobileStart);
    expect(tabletBlock).toContain("object-fit: none !important;");

    // Mobile media query carries the second value.
    const mobileBlock = css!.slice(mobileStart);
    expect(mobileBlock).toContain("object-fit: cover !important;");
    expect(mobileBlock).toContain("object-position: 30% 70% !important;");

    // Effective per-device inline styles follow the cascade.
    expect(buildSectionStyle(settings, undefined, "desktop").objectFit).toBe("contain");
    expect(buildSectionStyle(settings, undefined, "tablet").objectFit).toBe("none");
    expect(buildSectionStyle(settings, undefined, "mobile").objectFit).toBe("cover");
  });

  // ── 5 ─────────────────────────────────────────────────────────────
  it("5. no configuration => zero object-fit output (default rendering unchanged)", () => {
    // Style helpers return nothing.
    expect(buildMediaObjectStyle({})).toEqual({});
    expect(buildMediaObjectStyle(undefined)).toEqual({});
    expect(buildBackgroundMediaStyle({})).toEqual({});

    const style = buildSectionStyle({ paddingTop: 24, aspectRatio: "16:9", overflow: "hidden" });
    expect(style.objectFit).toBeUndefined();
    expect(style.objectPosition).toBeUndefined();
    expect((style as any).aspectRatio).toBe("16/9");
    expect(style.overflow).toBe("hidden");

    // CSS emitters add no object-fit declaration.
    const decls = styleObjectToCssDeclarations({ paddingTop: 24, overflow: "hidden" });
    expect(decls.join(" ")).not.toContain("object-fit");
    expect(decls.join(" ")).not.toContain("object-position");

    // No responsive CSS emitted for a media-free section.
    expect(generateResponsiveCss({ paddingTop: 24 }, SELECTOR)).toBeNull();

    // Rendered image keeps its default output (no inline object-fit).
    const { container } = render(
      <ImageElement settings={{ src: "https://cdn.example.com/plain.jpg", alt: "بدون إعداد" }} />
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("style") || "").not.toContain("object-fit");
    expect(img?.getAttribute("data-object-fit")).toBeNull();
  });

  // ── 6 ─────────────────────────────────────────────────────────────
  it("6. ImageElement applies object-fit/object-position inline and keeps the default cover class otherwise", () => {
    const { container } = render(
      <ImageElement
        settings={{
          src: "https://cdn.example.com/hero.jpg",
          alt: "منتج",
          objectFit: "contain",
          objectPosition: "30% 70%",
        }}
      />
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    const styleAttr = img?.getAttribute("style") || "";
    expect(styleAttr).toContain("object-fit: contain");
    expect(styleAttr).toContain("object-position: 30% 70%");
    expect(img?.getAttribute("data-object-fit")).toBe("contain");
    expect(img?.getAttribute("data-object-position")).toBe("30% 70%");
    expect(img?.className).not.toContain("object-cover");
  });

  // ── 7 ─────────────────────────────────────────────────────────────
  it("7. VideoElement applies object-fit/object-position to the <video> media element", () => {
    const { container } = render(
      <VideoElement
        settings={{
          url: "https://cdn.example.com/clip.mp4",
          objectFit: "scale-down",
          objectPosition: "top-left",
        }}
      />
    );
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    const styleAttr = video?.getAttribute("style") || "";
    expect(styleAttr).toContain("object-fit: scale-down");
    expect(styleAttr).toContain("object-position: 0% 0%");
    expect(video?.getAttribute("data-object-fit")).toBe("scale-down");

    // Default (unconfigured) video keeps the cover class and no inline fit.
    cleanup();
    const plain = render(<VideoElement settings={{ url: "https://cdn.example.com/clip2.mp4" }} />);
    const plainVideo = plain.container.querySelector("video");
    expect(plainVideo?.className).toContain("object-cover");
    expect(plainVideo?.getAttribute("style") || "").not.toContain("object-fit");
  });

  // ── 8 ─────────────────────────────────────────────────────────────
  it("8. section with image background (StoryParallax) maps object-fit to background-size/position", () => {
    const { container } = render(
      <MemoryRouter>
        <StoryParallax
          settings={{
            title: "قصتنا",
            image: "https://cdn.example.com/story.jpg",
            objectFit: "contain",
            objectPosition: "30% 70%",
          }}
        />
      </MemoryRouter>
    );

    const bg = container.querySelector("[data-storefront-story-background]");
    expect(bg).toBeTruthy();
    const styleAttr = bg?.getAttribute("style") || "";
    expect(styleAttr).toContain("background-size: contain");
    expect(styleAttr).toContain("background-position: 30% 70%");

    // Without configuration the background keeps its classes / no overrides.
    cleanup();
    const plain = render(
      <MemoryRouter>
        <StoryParallax settings={{ title: "قصتنا", image: "https://cdn.example.com/story2.jpg" }} />
      </MemoryRouter>
    );
    const plainBg = plain.container.querySelector("[data-storefront-story-background]");
    const plainStyle = plainBg?.getAttribute("style") || "";
    expect(plainStyle).not.toContain("background-size");
    expect(plainStyle).not.toContain("background-position");
  });

  // ── 9 ─────────────────────────────────────────────────────────────
  it("9. layout tab exposes the 5 fit modes + 9 anchors and fires updates for fit and custom position", () => {
    const onUpdateField = vi.fn();

    render(
      <StudioInspectorLayoutTab
        settings={{ objectFit: "cover", objectPosition: "50% 70%" }}
        sectionType="image"
        onUpdateField={onUpdateField}
      />
    );

    expect(screen.getByTestId("studio-object-fit-controls")).toBeDefined();

    ["cover", "contain", "fill", "none", "scale-down"].forEach((mode) => {
      expect(screen.getByTestId(`btn-object-fit-${mode}`)).toBeDefined();
    });
    [
      "top-left",
      "top",
      "top-right",
      "left",
      "center",
      "right",
      "bottom-left",
      "bottom",
      "bottom-right",
    ].forEach((anchor) => {
      expect(screen.getByTestId(`btn-object-position-${anchor}`)).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("btn-object-fit-contain"));
    expect(onUpdateField).toHaveBeenCalledWith("objectFit", "contain");

    fireEvent.click(screen.getByTestId("btn-object-position-top-left"));
    expect(onUpdateField).toHaveBeenCalledWith("objectPosition", "top-left");

    // Custom axis: 30% + existing 70% => "30% 70%".
    const xInput = screen.getByTestId("input-object-position-x");
    fireEvent.change(xInput, { target: { value: "30" } });
    expect(onUpdateField).toHaveBeenCalledWith("objectPosition", "30% 70%");

    const yInput = screen.getByTestId("input-object-position-y");
    fireEvent.change(yInput, { target: { value: "20" } });
    expect(onUpdateField).toHaveBeenCalledWith("objectPosition", "30% 20%");

    fireEvent.click(screen.getByTestId("btn-object-position-reset"));
    expect(onUpdateField).toHaveBeenCalledWith("objectPosition", null);
  });

  // ── 10 ────────────────────────────────────────────────────────────
  it("10. media controls stay hidden for text-only sections but appear for media-bearing ones", () => {
    const textRender = render(
      <StudioInspectorLayoutTab
        settings={{ content: "نص فقط" }}
        sectionType="text"
        onUpdateField={vi.fn()}
      />
    );
    expect(screen.queryByTestId("studio-object-fit-controls")).toBeNull();
    textRender.unmount();

    // A media-bearing section shows them even with an unlisted type.
    render(
      <StudioInspectorLayoutTab
        settings={{ image: "https://cdn.example.com/x.jpg" }}
        sectionType="custom-collection"
        onUpdateField={vi.fn()}
      />
    );
    expect(screen.getByTestId("studio-object-fit-controls")).toBeDefined();
  });

  // ── 11 ────────────────────────────────────────────────────────────
  it("11. per-breakpoint badge appears on mobile override and reset clears objectFit", () => {
    const onResetField = vi.fn();
    const rawSettings = {
      objectFit: "cover",
      responsive: { mobile: { objectFit: "contain" } },
    };

    render(
      <StudioInspectorLayoutTab
        settings={{ objectFit: "contain" }}
        rawSettings={rawSettings}
        deviceMode="mobile"
        sectionType="image"
        onUpdateField={vi.fn()}
        onResetField={onResetField}
      />
    );

    expect(isPropertyOverridden(rawSettings, "objectFit", "mobile")).toBe(true);
    expect(screen.getByTestId("badge-customized-objectFit")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "إرجاع للأساسي" }));
    expect(onResetField).toHaveBeenCalledWith("objectFit");

    // Active state is reflected in the UI for the effective mobile value.
    expect(screen.getByTestId("btn-object-fit-contain").getAttribute("data-active")).toBe("true");
  });

  // ── 12 ────────────────────────────────────────────────────────────
  it("12. LAYOUT-1 regression: aspectRatio + overflow still emitted alongside object-fit", () => {
    const settings = {
      aspectRatio: "16:9",
      overflow: "hidden",
      objectFit: "cover",
      objectPosition: "center",
      responsive: { mobile: { aspectRatio: "1:1", objectFit: "contain" } },
    };

    const decls = styleObjectToCssDeclarations(settings);
    const joined = decls.join(" ");
    expect(joined).toContain("aspect-ratio: 16/9;");
    expect(joined).toContain("overflow: hidden;");
    expect(joined).toContain("object-fit: cover;");
    expect(joined).toContain("object-position: 50% 50%;");

    const style = buildSectionStyle(settings);
    expect((style as any).aspectRatio).toBe("16/9");
    expect(style.overflow).toBe("hidden");
    expect(style.objectFit).toBe("cover");

    const css = generateResponsiveCss(settings, SELECTOR);
    expect(css).toBeTruthy();
    const mobileBlock = css!.slice(css!.indexOf("@media (max-width: 767.98px)"));
    expect(mobileBlock).toContain("aspect-ratio: 1/1 !important;");
    expect(mobileBlock).toContain("object-fit: contain !important;");
  });
});
