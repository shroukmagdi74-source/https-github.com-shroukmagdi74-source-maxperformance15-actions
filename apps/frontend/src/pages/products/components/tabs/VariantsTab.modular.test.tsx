// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { VariantsTab } from "./VariantsTab";
import {
  VariantsTabHeader,
  VariantsBulkActions,
  VariantsSavedImagesSyncBanner,
  VariantCard,
} from "./variants";
import { ProductVariant } from "./variants/types";

afterEach(() => {
  cleanup();
});

const mockVariants: ProductVariant[] = [
  {
    name: "أحمر - كبير",
    type: "color",
    sku: "VAR-RED-L",
    price: 250,
    comparePrice: 300,
    cost: 150,
    stock: 20,
    trackInventory: true,
    isActive: true,
    attributes: [
      { name: "اللون", value: "أحمر" },
      { name: "المقاس", value: "كبير" },
    ],
  },
  {
    name: "أحمر - صغير",
    type: "color",
    sku: "VAR-RED-S",
    price: 230,
    comparePrice: 280,
    cost: 140,
    stock: 0,
    trackInventory: true,
    isActive: false,
    attributes: [
      { name: "اللون", value: "أحمر" },
      { name: "المقاس", value: "صغير" },
    ],
  },
];

const mockT = (key: string) => {
  const map: Record<string, string> = {
    "products.variants.title": "المتغيرات",
    "products.variants.addVariant": "إضافة متغير",
    "products.variants.noVariants": "لا توجد متغيرات",
    "products.variants.noVariantsDesc": "أضف متغيرات جديدة للمنتج",
  };
  return map[key] || key;
};

describe("VariantsTab Modular Components (Batch 567)", () => {
  describe("VariantsTabHeader", () => {
    it("renders title, color modal button, and handles show/hide toggle", () => {
      const toggleMock = vi.fn();
      const colorModalMock = vi.fn();

      render(
        <VariantsTabHeader
          variantsCount={2}
          colorGroupsCount={1}
          showVariants={true}
          setShowVariants={toggleMock}
          displayCurrency="EGP"
          onOpenColorModal={colorModalMock}
          t={mockT}
        />
      );

      expect(screen.getByText(/المتغيرات \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/تعيين الصور حسب اللون \(1 ألوان\)/)).toBeInTheDocument();

      const toggleBtn = screen.getByText("إخفاء");
      fireEvent.click(toggleBtn);
      expect(toggleMock).toHaveBeenCalled();
    });
  });

  describe("VariantsBulkActions", () => {
    it("renders bulk actions dropdown and triggers apply callback", () => {
      const actionChangeMock = vi.fn();
      const applyMock = vi.fn();

      render(
        <VariantsBulkActions
          variantsCount={2}
          bulkAction="set_price"
          handleBulkActionChange={actionChangeMock}
          showBulkInput={true}
          bulkValue={300}
          setBulkValue={vi.fn()}
          applyBulkAction={applyMock}
          shippingClassOptions={[]}
          displayCurrency="EGP"
          onOpenColorModal={vi.fn()}
        />
      );

      expect(screen.getByText("إجراء جماعي على كل المتغيرات:")).toBeInTheDocument();
      const applyBtn = screen.getByText("تطبيق على 2 متغير");
      fireEvent.click(applyBtn);
      expect(applyMock).toHaveBeenCalled();
    });
  });

  describe("VariantsSavedImagesSyncBanner", () => {
    it("renders sync banner when saved count > 0 and handles 1-click sync", () => {
      const syncMock = vi.fn();

      render(
        <VariantsSavedImagesSyncBanner
          syncableSavedCount={2}
          variantsCount={4}
          onApplyAllSavedColorImages={syncMock}
        />
      );

      expect(
        screen.getByText(/تم العثور على 2 صور ألوان محفوظة مسبقاً لهذا المنتج!/)
      ).toBeInTheDocument();

      const applyBtn = screen.getByText("تطبيق صور الألوان على كل المقاسات الآن");
      fireEvent.click(applyBtn);
      expect(syncMock).toHaveBeenCalled();
    });
  });

  describe("VariantCard", () => {
    it("renders variant row and expands to display basic info and price fields", () => {
      const toggleMock = vi.fn();
      const removeMock = vi.fn();
      const updateMock = vi.fn();

      const { rerender } = render(
        <VariantCard
          idx={0}
          variant={mockVariants[0]}
          isExpanded={false}
          onToggle={toggleMock}
          onRemove={removeMock}
          updateVariant={updateMock}
          handleVariantImageChange={vi.fn()}
          displayCurrency="EGP"
          shippingClassOptions={[]}
          copiedGroupToast={null}
          setCopiedGroupToast={vi.fn()}
          applyImageToGroup={vi.fn()}
        />
      );

      expect(screen.getByText("أحمر - كبير")).toBeInTheDocument();
      expect(screen.getByText("VAR-RED-L")).toBeInTheDocument();
      expect(screen.getByText("نشط")).toBeInTheDocument();

      // Click to toggle
      const cardHeader = screen.getByText("أحمر - كبير");
      fireEvent.click(cardHeader);
      expect(toggleMock).toHaveBeenCalled();

      // Rerender as expanded
      rerender(
        <VariantCard
          idx={0}
          variant={mockVariants[0]}
          isExpanded={true}
          onToggle={toggleMock}
          onRemove={removeMock}
          updateVariant={updateMock}
          handleVariantImageChange={vi.fn()}
          displayCurrency="EGP"
          shippingClassOptions={[]}
          copiedGroupToast={null}
          setCopiedGroupToast={vi.fn()}
          applyImageToGroup={vi.fn()}
        />
      );

      expect(screen.getByText("المعلومات الأساسية")).toBeInTheDocument();
      expect(screen.getByText("صورة المتغير")).toBeInTheDocument();
      expect(screen.getByText("التسعير")).toBeInTheDocument();
      expect(screen.getAllByText("المخزون").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("الشحن")).toBeInTheDocument();
    });
  });

  describe("VariantsTab Coordinator", () => {
    it("renders full variants tab with cards and add variant button", () => {
      const addMock = vi.fn();

      render(
        <VariantsTab
          variants={mockVariants}
          showVariants={true}
          setShowVariants={vi.fn()}
          bulkAction=""
          handleBulkActionChange={vi.fn()}
          showBulkInput={false}
          bulkValue=""
          setBulkValue={vi.fn()}
          applyBulkAction={vi.fn()}
          removeVariant={vi.fn()}
          updateVariant={vi.fn()}
          handleVariantImageChange={vi.fn()}
          addVariant={addMock}
          displayCurrency="EGP"
          shippingClassOptions={[]}
          t={mockT}
        />
      );

      expect(screen.getByText("أحمر - كبير")).toBeInTheDocument();
      expect(screen.getByText("أحمر - صغير")).toBeInTheDocument();

      const addBtn = screen.getByText("إضافة متغير");
      fireEvent.click(addBtn);
      expect(addMock).toHaveBeenCalled();
    });
  });
});
