/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Ensure Node 26 localStorage compatibility
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage?.clear) {
  Object.defineProperty(globalThis, "localStorage", {
    value: storageMock,
    writable: true,
    configurable: true,
  });
}

import type {
  StudioGlobalComponent,
  StudioComponentInstance,
} from "../studio/StudioTypes";
import {
  resolveComponentInstance,
  createGlobalComponent,
  createComponentInstance,
  detachComponentInstance,
  countComponentUsage,
  validateComponentHierarchy,
  createDeletedComponentPlaceholder,
} from "../studio/utils/resolveComponentInstance";
import { StudioGlobalComponentsPanel } from "../studio/inspector/StudioGlobalComponentsPanel";

describe("GLOBAL-1: Global Components Synced Across Storefront Pages", () => {
  beforeEach(() => {
    storageMock.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Creation and Key Stripping
  // ─────────────────────────────────────────────────────────────
  it("Criterion 1: createGlobalComponent strips section keys/ids and formats master component", () => {
    const rawSection = {
      type: "hero-banner",
      key: "hero-banner-1729000",
      id: "raw-id-999",
      label: "البانر الترويجي الكبير",
      settings: {
        title: "خصومات نهاية الأسبوع",
        backgroundColor: "#112233",
        ctaText: "تسوق الآن",
      },
      children: [
        {
          type: "heading",
          key: "child-heading-1",
          id: "child-id-1",
          settings: { text: "عنوان فرعي" },
        },
      ],
    };

    const comp = createGlobalComponent("البانر الرئيسي", rawSection);

    expect(comp.id).toMatch(/^comp-/);
    expect(comp.name).toBe("البانر الرئيسي");
    expect(comp.section.type).toBe("hero-banner");
    expect(comp.section.key).toBeUndefined();
    expect(comp.section.id).toBeUndefined();
    expect(comp.section.settings?.title).toBe("خصومات نهاية الأسبوع");
    expect(comp.section.children?.[0].key).toBeUndefined();
    expect(comp.section.children?.[0].id).toBeUndefined();
    expect(comp.createdAt).toBeDefined();
    expect(comp.updatedAt).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Multi-Page Synchronization (Acceptance Criteria 2)
  // ─────────────────────────────────────────────────────────────
  it("Criterion 2: Sync - Master component modification (text/color) propagates to instances in both pages", () => {
    // 1. Create a master component
    const masterComponent: StudioGlobalComponent = {
      id: "comp-shared-promo",
      name: "شريط العرض المتزامن",
      section: {
        type: "promo-strip",
        settings: {
          message: "عرض حصري: شحن مجاني لكافة المحافظات",
          backgroundColor: "#2563eb",
          textColor: "#ffffff",
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const globalComponents: StudioGlobalComponent[] = [masterComponent];

    // 2. Insert instances into Page 1 and Page 2
    const page1Section: StudioComponentInstance = {
      type: "componentInstance",
      key: "instance-home-1",
      componentId: "comp-shared-promo",
      label: "شريط العرض المتزامن",
      settings: { componentId: "comp-shared-promo" },
    };

    const page2Section: StudioComponentInstance = {
      type: "componentInstance",
      key: "instance-shop-2",
      componentId: "comp-shared-promo",
      label: "شريط العرض المتزامن",
      settings: { componentId: "comp-shared-promo" },
    };

    // 3. Initial resolution on both pages
    const resolvedP1Initial = resolveComponentInstance(page1Section, globalComponents);
    const resolvedP2Initial = resolveComponentInstance(page2Section, globalComponents);

    expect(resolvedP1Initial.type).toBe("promo-strip");
    expect(resolvedP1Initial.key).toBe("instance-home-1");
    expect(resolvedP1Initial.settings.message).toBe("عرض حصري: شحن مجاني لكافة المحافظات");
    expect(resolvedP1Initial.settings.backgroundColor).toBe("#2563eb");

    expect(resolvedP2Initial.type).toBe("promo-strip");
    expect(resolvedP2Initial.key).toBe("instance-shop-2");
    expect(resolvedP2Initial.settings.message).toBe("عرض حصري: شحن مجاني لكافة المحافظات");
    expect(resolvedP2Initial.settings.backgroundColor).toBe("#2563eb");

    // 4. Update the master component (text and color)
    masterComponent.section = {
      ...masterComponent.section,
      settings: {
        message: "تحديث الصيف: خصم 40% على جميع المنتجات",
        backgroundColor: "#dc2626",
        textColor: "#fef08a",
      },
    };
    masterComponent.updatedAt = new Date().toISOString();

    // 5. Re-resolve both pages: both MUST reflect the updated text and color!
    const resolvedP1Updated = resolveComponentInstance(page1Section, globalComponents);
    const resolvedP2Updated = resolveComponentInstance(page2Section, globalComponents);

    // Assert Page 1 received updates
    expect(resolvedP1Updated.settings.message).toBe("تحديث الصيف: خصم 40% على جميع المنتجات");
    expect(resolvedP1Updated.settings.backgroundColor).toBe("#dc2626");
    expect(resolvedP1Updated.settings.textColor).toBe("#fef08a");
    expect(resolvedP1Updated.key).toBe("instance-home-1");

    // Assert Page 2 received updates
    expect(resolvedP2Updated.settings.message).toBe("تحديث الصيف: خصم 40% على جميع المنتجات");
    expect(resolvedP2Updated.settings.backgroundColor).toBe("#dc2626");
    expect(resolvedP2Updated.settings.textColor).toBe("#fef08a");
    expect(resolvedP2Updated.key).toBe("instance-shop-2");
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Detaching an Instance (Acceptance Criteria 3)
  // ─────────────────────────────────────────────────────────────
  it("Criterion 3: Detach - Detaching an instance converts it to standalone section; subsequent master edits do NOT affect it", () => {
    const masterComponent: StudioGlobalComponent = {
      id: "comp-nav-banner",
      name: "بانر التصفح",
      section: {
        type: "hero-banner",
        settings: {
          title: "العنوان المشترك",
          subtitle: "الوصف الأصلي المشترك",
          accentColor: "#059669",
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const globalComponents: StudioGlobalComponent[] = [masterComponent];

    const instance: StudioComponentInstance = {
      type: "componentInstance",
      key: "instance-cart-77",
      componentId: "comp-nav-banner",
      settings: { componentId: "comp-nav-banner" },
    };

    // Detach instance
    const detachedSection = detachComponentInstance(instance, globalComponents);

    // Verify detached section has become a standalone section
    expect(detachedSection.type).toBe("hero-banner");
    expect(detachedSection.componentId).toBeUndefined();
    expect(detachedSection._instanceOf).toBeUndefined();
    expect(detachedSection._isComponentInstance).toBeUndefined();
    expect(detachedSection.settings.componentId).toBeUndefined();
    expect(detachedSection.settings.title).toBe("العنوان المشترك");
    expect(detachedSection.settings.accentColor).toBe("#059669");

    // Modify master component
    masterComponent.section.settings.title = "تم تعديل الأصل كلياً";
    masterComponent.section.settings.accentColor = "#9333ea";

    // Verify detached section remains completely untouched
    expect(detachedSection.settings.title).toBe("العنوان المشترك");
    expect(detachedSection.settings.accentColor).toBe("#059669");

    // But an active instance of master DOES reflect the changes
    const stillActiveInstance: StudioComponentInstance = {
      type: "componentInstance",
      key: "instance-active-88",
      componentId: "comp-nav-banner",
    };
    const resolvedActive = resolveComponentInstance(stillActiveInstance, globalComponents);
    expect(resolvedActive.settings.title).toBe("تم تعديل الأصل كلياً");
    expect(resolvedActive.settings.accentColor).toBe("#9333ea");
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Deleting Master Component (Acceptance Criteria 4)
  // ─────────────────────────────────────────────────────────────
  it("Criterion 4: Delete master - Instances safely resolve to placeholder with ZERO throw/crash", () => {
    const globalComponents: StudioGlobalComponent[] = [
      {
        id: "comp-temp",
        name: "مكوّن مؤقت",
        section: { type: "reviews", settings: { title: "آراء العملاء" } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const orphanInstance: StudioComponentInstance = {
      type: "componentInstance",
      key: "instance-orphan-1",
      componentId: "comp-deleted-id",
      label: "مكوّن كان موجوداً",
      settings: { componentId: "comp-deleted-id" },
    };

    // Must NOT throw when component is missing
    let resolved: any = null;
    expect(() => {
      resolved = resolveComponentInstance(orphanInstance, globalComponents);
    }).not.toThrow();

    expect(resolved).not.toBeNull();
    expect(resolved.isPlaceholder).toBe(true);
    expect(resolved.isDeletedComponent).toBe(true);
    expect(resolved.label).toContain("مكوّن محذوف");
    expect(resolved.settings?.title).toContain("مكوّن محذوف");
    expect(resolved.key).toBe("instance-orphan-1");
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Circular Self-Reference Protection (Acceptance Criteria 5)
  // ─────────────────────────────────────────────────────────────
  it("Criterion 5: Loop protection - Component containing an instance of itself is rejected with a clear error", () => {
    const componentId = "comp-self-loop";

    // Direct self-reference inside section
    const selfReferencingSection = {
      type: "componentInstance",
      componentId: "comp-self-loop",
      settings: { componentId: "comp-self-loop" },
    };

    // Validation must reject
    expect(() => {
      validateComponentHierarchy(componentId, selfReferencingSection);
    }).toThrow(/حلقة تكرار ذاتية غير مسموحة/);

    // Also createGlobalComponent must reject self-referencing section
    expect(() => {
      createGlobalComponent("مكوّن خاطئ", selfReferencingSection, {
        customId: componentId,
      });
    }).toThrow(/حلقة تكرار ذاتية غير مسموحة/);

    // Also resolveComponentInstance must throw descriptive error on cycle
    const loopMaster: StudioGlobalComponent = {
      id: componentId,
      name: "حلقة مفرغة",
      section: selfReferencingSection,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => {
      resolveComponentInstance(selfReferencingSection, [loopMaster]);
    }).toThrow(/حلقة تكرار ذاتية غير مسموحة/);
  });

  it("Criterion 5b: Nested Container self-reference - Container child containing parent component is rejected", () => {
    const containerCompId = "comp-container-loop";

    const containerSectionWithSelfChild = {
      type: "container",
      children: [
        {
          type: "heading",
          settings: { text: "عنصر عادي" },
        },
        {
          type: "componentInstance",
          componentId: containerCompId,
        },
      ],
    };

    expect(() => {
      validateComponentHierarchy(containerCompId, containerSectionWithSelfChild);
    }).toThrow(/حلقة تكرار ذاتية غير مسموحة/);
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Non-instance Passthrough & Container Deep Resolution
  // ─────────────────────────────────────────────────────────────
  it("Criterion 6: Non-instance sections pass through untouched, while container children resolve instances", () => {
    const normalSection = {
      type: "richtext",
      key: "rich-1",
      settings: { title: "محتوى مقال" },
    };

    const resolvedNormal = resolveComponentInstance(normalSection, []);
    expect(resolvedNormal).toBe(normalSection);

    // Nested container with a component instance child
    const masterBadge: StudioGlobalComponent = {
      id: "comp-trust-badge",
      name: "شارة الثقة",
      section: {
        type: "features-bar",
        settings: { title: "دفع آمن 100%" },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const containerSection = {
      type: "container",
      key: "container-main",
      children: [
        { type: "heading", key: "h1", settings: { text: "أهلاً بكم" } },
        {
          type: "componentInstance",
          key: "inst-badge",
          componentId: "comp-trust-badge",
        },
      ],
    };

    const resolvedContainer = resolveComponentInstance(containerSection, [masterBadge]);
    expect(resolvedContainer.type).toBe("container");
    expect(resolvedContainer.children).toHaveLength(2);
    expect(resolvedContainer.children[0].type).toBe("heading");
    expect(resolvedContainer.children[1].type).toBe("features-bar");
    expect(resolvedContainer.children[1].settings.title).toBe("دفع آمن 100%");
    expect(resolvedContainer.children[1].key).toBe("inst-badge");
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Component Usage Counter
  // ─────────────────────────────────────────────────────────────
  it("Criterion 7: countComponentUsage correctly counts instance occurrences across multiple pages and containers", () => {
    const targetCompId = "comp-target-count";

    const pagesMock = {
      home: {
        sections: [
          { type: "hero-banner" },
          { type: "componentInstance", componentId: targetCompId },
          {
            type: "container",
            children: [
              { type: "componentInstance", componentId: targetCompId },
            ],
          },
        ],
      },
      shop: {
        sections: [
          { type: "product-grid" },
          { type: "componentInstance", componentId: "other-comp" },
        ],
      },
      checkout: {
        sections: [
          { type: "componentInstance", componentId: targetCompId },
        ],
      },
    };

    const count = countComponentUsage(targetCompId, pagesMock);
    expect(count).toBe(3);

    const unusedCount = countComponentUsage("unreferenced-comp", pagesMock);
    expect(unusedCount).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────
  // 8. StudioGlobalComponentsPanel UI Testing
  // ─────────────────────────────────────────────────────────────
  it("Criterion 8: StudioGlobalComponentsPanel renders list, creates component, inserts instance, and warns on delete", () => {
    const sampleComponents: StudioGlobalComponent[] = [
      {
        id: "comp-sample-1",
        name: "هيدر العيد",
        section: { type: "hero-banner", settings: { title: "كل عام وأنتم بخير" } },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockCreate = vi.fn();
    const mockInsert = vi.fn();
    const mockEditMaster = vi.fn();
    const mockDetach = vi.fn();
    const mockDelete = vi.fn();

    const selectedConfig = {
      type: "featured-products",
      key: "featured-key-1",
      label: "الأكثر مبيعاً",
      settings: { title: "أقوى المنتجات" },
    };

    const { rerender } = render(
      <StudioGlobalComponentsPanel
        globalComponents={sampleComponents}
        selectedSectionKey="featured-key-1"
        selectedSectionConfig={selectedConfig}
        onCreateComponent={mockCreate}
        onInsertInstance={mockInsert}
        onEditMaster={mockEditMaster}
        onDetachInstance={mockDetach}
        onDeleteComponent={mockDelete}
      />
    );

    // Verify header and list
    expect(screen.getByText("المكوّنات العالمية")).toBeDefined();
    expect(screen.getByText("هيدر العيد")).toBeDefined();

    // 1. Create component action
    const convertBtn = screen.getByTestId("convert-to-component-btn");
    fireEvent.click(convertBtn);

    const nameInput = screen.getByTestId("component-name-input") as HTMLInputElement;
    expect(nameInput.value).toBe("الأكثر مبيعاً");

    fireEvent.change(nameInput, { target: { value: "مكوّن المنتجات المختار" } });
    const confirmCreateBtn = screen.getByTestId("confirm-create-component-btn");
    fireEvent.click(confirmCreateBtn);

    expect(mockCreate).toHaveBeenCalledWith("مكوّن المنتجات المختار", selectedConfig);

    // 2. Insert instance action
    const insertBtn = screen.getByTestId("insert-instance-comp-sample-1");
    fireEvent.click(insertBtn);
    expect(mockInsert).toHaveBeenCalledWith("comp-sample-1");

    // 3. Edit master action
    const editMasterBtn = screen.getByTestId("edit-master-comp-sample-1");
    fireEvent.click(editMasterBtn);
    expect(mockEditMaster).toHaveBeenCalledWith("comp-sample-1");

    // 4. Detach instance when active section is an instance
    const instanceConfig = {
      type: "componentInstance",
      key: "active-inst-key",
      componentId: "comp-sample-1",
      settings: { componentId: "comp-sample-1" },
    };

    rerender(
      <StudioGlobalComponentsPanel
        globalComponents={sampleComponents}
        selectedSectionKey="active-inst-key"
        selectedSectionConfig={instanceConfig}
        onCreateComponent={mockCreate}
        onInsertInstance={mockInsert}
        onEditMaster={mockEditMaster}
        onDetachInstance={mockDetach}
        onDeleteComponent={mockDelete}
      />
    );

    const detachBtn = screen.getByTestId("detach-instance-btn");
    fireEvent.click(detachBtn);
    expect(mockDetach).toHaveBeenCalledWith("active-inst-key");

    // 5. Delete component with usage confirmation warning
    const pagesWithUsage = {
      home: {
        sections: [{ type: "componentInstance", componentId: "comp-sample-1" }],
      },
    };

    rerender(
      <StudioGlobalComponentsPanel
        globalComponents={sampleComponents}
        allPages={pagesWithUsage}
        selectedSectionKey="active-inst-key"
        selectedSectionConfig={instanceConfig}
        onCreateComponent={mockCreate}
        onInsertInstance={mockInsert}
        onEditMaster={mockEditMaster}
        onDetachInstance={mockDetach}
        onDeleteComponent={mockDelete}
      />
    );

    const deleteBtn = screen.getByTestId("delete-component-comp-sample-1");
    fireEvent.click(deleteBtn);

    // Warning should appear
    expect(screen.getByText("تحذير: المكوّن مستخدم")).toBeDefined();

    // Confirm delete
    const confirmDeleteBtn = screen.getByTestId("delete-confirm-btn");
    fireEvent.click(confirmDeleteBtn);
    expect(mockDelete).toHaveBeenCalledWith("comp-sample-1", true);
  });
});
