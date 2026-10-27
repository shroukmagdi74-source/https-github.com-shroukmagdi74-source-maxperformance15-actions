// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  expandLoopSection,
  resolveLoopResult,
  LOOP_MAX_LIMIT,
} from "../studio/utils/expandLoopSection";
import { StudioLoopControls } from "../studio/inspector/StudioLoopControls";
import type { StudioLoopSection } from "../studio/StudioTypes";

describe("LOOP-1: Studio Loop Section Resolver & Inspector Tests", () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  // Acceptance Criterion 1 & 2: Realistic fixture + 3 products limit=3 -> 3 distinct sections with different values
  it("Case 1: Realistic Fixture - expands 3 products into 3 distinct sections with different titles and prices", () => {
    const fixtureProducts = [
      {
        id: "prod-101",
        title: "قميص كتان بيج",
        price: 450,
        compareAtPrice: 600,
        stock: 12,
        image: "https://swan.com/images/shirt.jpg",
      },
      {
        id: "prod-102",
        title: "بنطال صوف رمادي",
        price: 780,
        compareAtPrice: 950,
        stock: 5,
        image: "https://swan.com/images/pants.jpg",
      },
      {
        id: "prod-103",
        title: "حذاء جلد بني",
        price: 1350,
        compareAtPrice: 1600,
        stock: 2,
        image: "https://swan.com/images/shoes.jpg",
      },
    ];

    const loopSection: StudioLoopSection = {
      type: "loop",
      key: "loop-products-main",
      source: "products",
      limit: 3,
      columns: 3,
      template: [
        {
          type: "heading",
          settings: {
            text: "{{product.title}}",
            price: "{{product.price}}",
            comparePrice: "{{product.compareAtPrice}}",
          },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, {
      products: fixtureProducts,
      currency: "EGP",
      locale: "ar-EG",
    });

    // 1. Assert exactly 3 sections resulted
    expect(expanded).toHaveLength(3);
    expect(expanded.isEmpty).toBe(false);

    // 2. Assert values are DIFFERENT and match corresponding product fixtures
    expect(expanded[0].settings.text).toBe("قميص كتان بيج");
    expect(expanded[0].settings.price).toBe("450");
    expect(expanded[0].settings.comparePrice).toBe("600");

    expect(expanded[1].settings.text).toBe("بنطال صوف رمادي");
    expect(expanded[1].settings.price).toBe("780");
    expect(expanded[1].settings.comparePrice).toBe("950");

    expect(expanded[2].settings.text).toBe("حذاء جلد بني");
    expect(expanded[2].settings.price).toBe("1350");
    expect(expanded[2].settings.comparePrice).toBe("1600");

    // Mutual inequality assert
    expect(expanded[0].settings.text).not.toBe(expanded[1].settings.text);
    expect(expanded[1].settings.text).not.toBe(expanded[2].settings.text);
    expect(expanded[0].settings.price).not.toBe(expanded[1].settings.price);
  });

  // Acceptance Criterion 3: limit=100 with 50 cap -> 50 elements + warning asserted
  it("Case 2: Performance Protection - enforces hard cap of 50 items and issues warning when limit exceeds cap", () => {
    // Generate 80 mock products
    const eightyProducts = Array.from({ length: 80 }, (_, i) => ({
      id: `p-${i + 1}`,
      title: `منتج رقم ${i + 1}`,
      price: (i + 1) * 10,
    }));

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      limit: 100, // Explicitly requesting 100
      columns: 4,
      template: [
        {
          type: "heading",
          settings: { text: "{{product.title}}" },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, { products: eightyProducts });

    // Assert strictly capped at 50
    expect(expanded).toHaveLength(LOOP_MAX_LIMIT);
    expect(expanded.length).toBe(50);
    expect(expanded.appliedLimit).toBe(50);
    expect(expanded.totalAvailable).toBe(80);

    // Assert warning presence on returned object and in console.warn
    expect(expanded.warning).toBeDefined();
    expect(expanded.warning).toContain("50");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[StudioLoop]")
    );
  });

  // Acceptance Criterion 4: Empty source -> 0 sections + isEmpty: true without throwing
  it("Case 3: Empty Source - returns 0 sections and isEmpty state safely without throwing", () => {
    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      limit: 10,
      emptyMessage: "المتجر قيد التحديث، لا توجد منتجات حالياً",
      template: [
        {
          type: "heading",
          settings: { text: "{{product.title}}" },
        },
      ],
    };

    // Safe execution with empty products array
    expect(() => {
      const res = expandLoopSection(loopSection, { products: [] });
      expect(res).toHaveLength(0);
      expect(res.isEmpty).toBe(true);
      expect(res.emptyMessage).toBe("المتجر قيد التحديث، لا توجد منتجات حالياً");
    }).not.toThrow();

    // Safe execution with null/undefined data
    expect(() => {
      const res = expandLoopSection(loopSection, null);
      expect(res).toHaveLength(0);
      expect(res.isEmpty).toBe(true);
      expect(res.emptyMessage).toBeTruthy();
    }).not.toThrow();
  });

  // Acceptance Criterion 5: {{product.price}} inside loop = exact item price for each element
  it("Case 4: Pricing Precision - {{product.price}} inside loop equals the exact price for each item", () => {
    const items = [
      { id: 1, title: "عنصر 1", price: 99.5 },
      { id: 2, title: "عنصر 2", price: 299 },
      { id: 3, title: "عنصر 3", price: 750 },
    ];

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      limit: 3,
      template: [
        {
          type: "text",
          settings: {
            rawPrice: "{{product.price}}",
            formattedPrice: "{{product.priceFormatted}}",
          },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, {
      products: items,
      currency: "SAR",
      locale: "en-US",
    });

    expect(expanded[0].settings.rawPrice).toBe("99.5");
    expect(expanded[1].settings.rawPrice).toBe("299");
    expect(expanded[2].settings.rawPrice).toBe("750");

    // Also assert formatted pricing contains currency and price
    expect(expanded[0].settings.formattedPrice).toContain("99.50");
    expect(expanded[1].settings.formattedPrice).toContain("299");
    expect(expanded[2].settings.formattedPrice).toContain("750");
  });

  // Acceptance Criterion: {{item.*}} token binding (Loop tokens)
  it("Case 5: Loop Item Tokens - resolves {{item.title}}, {{item.price}}, and {{item.image}}", () => {
    const loopItems = [
      {
        id: "item-a",
        title: "حقيبة سفر",
        price: 850,
        image: "https://swan.com/bag.jpg",
      },
      {
        id: "item-b",
        title: "نظارة شمسية",
        price: 320,
        image: "https://swan.com/glasses.jpg",
      },
    ];

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      template: [
        {
          type: "heading",
          settings: {
            title: "{{item.title}}",
            price: "{{item.price}}",
            img: "{{item.image}}",
          },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, loopItems);

    expect(expanded).toHaveLength(2);
    expect(expanded[0].settings.title).toBe("حقيبة سفر");
    expect(expanded[0].settings.price).toBe("850");
    expect(expanded[0].settings.img).toBe("https://swan.com/bag.jpg");

    expect(expanded[1].settings.title).toBe("نظارة شمسية");
    expect(expanded[1].settings.price).toBe("320");
    expect(expanded[1].settings.img).toBe("https://swan.com/glasses.jpg");
  });

  // Acceptance Criterion: Collection source with collectionId
  it("Case 6: Collection Source - filters and expands items from a specific collectionId", () => {
    const data = {
      collections: {
        "summer-deals": [
          { id: "s1", title: "شورت بحر", price: 180 },
          { id: "s2", title: "تيشيرت صيفي", price: 220 },
        ],
        "winter-coats": [
          { id: "w1", title: "معطف صوف", price: 1200 },
        ],
      },
    };

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "collection",
      collectionId: "summer-deals",
      limit: 10,
      template: [
        {
          type: "heading",
          settings: { text: "{{item.title}} - {{item.price}}" },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, data);

    expect(expanded).toHaveLength(2);
    expect(expanded[0].settings.text).toBe("شورت بحر - 180");
    expect(expanded[1].settings.text).toBe("تيشيرت صيفي - 220");
  });

  // Acceptance Criterion: Articles source with article-specific fields
  it("Case 7: Articles Source - expands articles with custom author, excerpt, and title fields", () => {
    const articlesData = {
      articles: [
        {
          id: "post-1",
          title: "أحدث صيحات أزياء 2026",
          author: "سارة أحمد",
          excerpt: "تعرف على أبرز التنسيقات الصيفية هذا العام...",
        },
        {
          id: "post-2",
          title: "دليل اختيار مقاس الحذاء المثالي",
          author: "عمر خالد",
          excerpt: "خطوات بسيطة تضمن لك قياساً دقيقاً ومريحاً...",
        },
      ],
    };

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "articles",
      template: [
        {
          type: "text",
          settings: {
            title: "{{item.title}}",
            byline: "بقلم: {{item.author}}",
            summary: "{{item.excerpt}}",
          },
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, articlesData);

    expect(expanded).toHaveLength(2);
    expect(expanded[0].settings.title).toBe("أحدث صيحات أزياء 2026");
    expect(expanded[0].settings.byline).toBe("بقلم: سارة أحمد");
    expect(expanded[0].settings.summary).toContain("أبرز التنسيقات");

    expect(expanded[1].settings.title).toBe("دليل اختيار مقاس الحذاء المثالي");
    expect(expanded[1].settings.byline).toBe("بقلم: عمر خالد");
  });

  // Case 8: Nested container template inside loop recursively resolving dynamic tokens in children
  it("Case 8: Nested Container Template - recursively resolves tokens in nested container children", () => {
    const products = [
      { id: "p1", title: "ساعة ذكية", price: 1500 },
      { id: "p2", title: "سماعة لاسلكية", price: 800 },
    ];

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      template: [
        {
          type: "container",
          settings: { direction: "row", gap: 16 },
          children: [
            {
              type: "heading",
              settings: { text: "{{product.title}}" },
            },
            {
              type: "button",
              settings: { text: "اشترِ الآن بـ {{product.price}} ج.م" },
            },
          ],
        },
      ],
    };

    const expanded = expandLoopSection(loopSection, { products });

    expect(expanded).toHaveLength(2);
    // Check first item container children
    expect(expanded[0].children?.[0]?.settings?.text).toBe("ساعة ذكية");
    expect(expanded[0].children?.[1]?.settings?.text).toBe("اشترِ الآن بـ 1500 ج.م");

    // Check second item container children
    expect(expanded[1].children?.[0]?.settings?.text).toBe("سماعة لاسلكية");
    expect(expanded[1].children?.[1]?.settings?.text).toBe("اشترِ الآن بـ 800 ج.م");
  });

  // Case 9: Structured Helper resolveLoopResult
  it("Case 9: resolveLoopResult Helper - returns structured metadata and columns", () => {
    const products = [
      { id: 1, title: "منتج A", price: 100 },
      { id: 2, title: "منتج B", price: 200 },
    ];

    const loopSection: StudioLoopSection = {
      type: "loop",
      source: "products",
      columns: 4,
      limit: 10,
      template: [{ type: "heading", settings: { text: "{{product.title}}" } }],
    };

    const resolved = resolveLoopResult(loopSection, { products });

    expect(resolved.columns).toBe(4);
    expect(resolved.source).toBe("products");
    expect(resolved.isEmpty).toBe(false);
    expect(resolved.sections).toHaveLength(2);
    expect(resolved.total).toBe(2);
    expect(resolved.limit).toBe(10);
  });

  // Case 10: UI Inspector Component StudioLoopControls
  it("Case 10: StudioLoopControls Inspector - renders and triggers callbacks for source, limit, and columns", () => {
    const onUpdateField = vi.fn();

    const initialSettings = {
      source: "products",
      limit: 6,
      columns: 3,
      emptyMessage: "فارغ",
      template: [{ type: "heading", settings: { text: "{{product.title}}" } }],
    };

    render(
      <StudioLoopControls
        settings={initialSettings}
        onUpdateField={onUpdateField}
      />
    );

    // 1. Verify source buttons render
    expect(screen.getByTestId("loop-source-products")).toBeDefined();
    expect(screen.getByTestId("loop-source-collection")).toBeDefined();
    expect(screen.getByTestId("loop-source-articles")).toBeDefined();

    // 2. Click collection source
    fireEvent.click(screen.getByTestId("loop-source-collection"));
    expect(onUpdateField).toHaveBeenCalledWith("source", "collection");

    // 3. Change columns
    fireEvent.click(screen.getByTestId("loop-column-4"));
    expect(onUpdateField).toHaveBeenCalledWith("columns", 4);

    // 4. Change limit
    const limitInput = screen.getByTestId("loop-limit-input");
    fireEvent.change(limitInput, { target: { value: "12" } });
    expect(onUpdateField).toHaveBeenCalledWith("limit", 12);

    // 5. Change empty message
    const emptyMsgInput = screen.getByTestId("loop-empty-message-input");
    fireEvent.change(emptyMsgInput, { target: { value: "لا توجد عناصر متاحة" } });
    expect(onUpdateField).toHaveBeenCalledWith("emptyMessage", "لا توجد عناصر متاحة");
  });
});
