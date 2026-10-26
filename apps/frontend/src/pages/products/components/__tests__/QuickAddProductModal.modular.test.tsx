import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickAddHeader } from "../quick-add/QuickAddHeader";
import { QuickAddBasicFields } from "../quick-add/QuickAddBasicFields";
import { QuickAddCategoryWarehouseSection } from "../quick-add/QuickAddCategoryWarehouseSection";
import { QuickAddImagesSection } from "../quick-add/QuickAddImagesSection";
import { QuickAddAttributesSection } from "../quick-add/QuickAddAttributesSection";
import { QuickAddVariantsMatrix } from "../quick-add/QuickAddVariantsMatrix";
import { QuickAddFooter } from "../quick-add/QuickAddFooter";

describe("QuickAddProductModal Modular Subcomponents", () => {
  it("renders QuickAddHeader and handles close", () => {
    const onClose = jest.fn();
    render(<QuickAddHeader titleId="test-modal" onClose={onClose} />);

    expect(screen.getByText("إنشاء طلب سريع")).toBeInTheDocument();
    expect(screen.getByText("طلب سريع")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("إغلاق النافذة");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders QuickAddBasicFields and handles price input", () => {
    const setName = jest.fn();
    const setPrice = jest.fn();
    const setComparePrice = jest.fn();

    render(
      <QuickAddBasicFields
        name="تيشيرت مميز"
        setName={setName}
        price="250"
        setPrice={setPrice}
        comparePrice="300"
        setComparePrice={setComparePrice}
        displayCurrency="ج.م"
        fieldErrors={{}}
        setFieldErrors={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("تيشيرت مميز")).toBeInTheDocument();
    expect(screen.getByDisplayValue("250")).toBeInTheDocument();

    const priceInput = screen.getByDisplayValue("250");
    fireEvent.change(priceInput, { target: { value: "350" } });
    expect(setPrice).toHaveBeenCalledWith("350");
  });

  it("renders QuickAddCategoryWarehouseSection and handles category select", () => {
    const setCategoryId = jest.fn();
    const categories = [
      { id: "cat-1", name: "ملابس رجالي" },
      { id: "cat-2", name: "أحذية" },
    ];

    render(
      <QuickAddCategoryWarehouseSection
        categoryId="cat-1"
        setCategoryId={setCategoryId}
        categories={categories}
        loadingCategories={false}
        isQuickAddingCategory={false}
        setIsQuickAddingCategory={jest.fn()}
        newCategoryName=""
        setNewCategoryName={jest.fn()}
        addingCategoryLoading={false}
        handleQuickAddCategory={jest.fn()}
        showWarehouseSelect={false}
        warehouseId=""
        setWarehouseId={jest.fn()}
        internalWarehouses={[]}
        loadingWarehouses={false}
        hasOptions={false}
        stock="15"
        setStock={jest.fn()}
        variants={[]}
        fieldErrors={{}}
        setFieldErrors={jest.fn()}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "cat-2" } });
    expect(setCategoryId).toHaveBeenCalledWith("cat-2");
  });

  it("renders QuickAddImagesSection and shows primary badge", () => {
    const setImages = jest.fn();
    const images = ["https://example.com/img1.jpg", "https://example.com/img2.jpg"];
    const fileRef = { current: null };

    render(
      <QuickAddImagesSection
        images={images}
        setImages={setImages}
        fileInputRef={fileRef}
        uploadingImage={false}
        handleImageFileChange={jest.fn()}
      />,
    );

    expect(screen.getByText("الرئيسية")).toBeInTheDocument();
    expect(screen.getByText("إضافة صورة")).toBeInTheDocument();
  });

  it("renders QuickAddAttributesSection and toggles switch", () => {
    const onToggle = jest.fn();
    render(
      <QuickAddAttributesSection
        hasOptions={false}
        onToggleHasOptions={onToggle}
        attributes={[]}
        onAddAttributeFromTemplate={jest.fn()}
        newCustomAttrName=""
        setNewCustomAttrName={jest.fn()}
        onAddCustomAttribute={jest.fn()}
        onRemoveAttribute={jest.fn()}
        attrInputValues={{}}
        setAttrInputValues={jest.fn()}
        onAddValueToAttribute={jest.fn()}
        onRemoveValueFromAttribute={jest.fn()}
      />,
    );

    const switchBtn = screen.getByRole("switch");
    fireEvent.click(switchBtn);
    expect(onToggle).toHaveBeenCalled();
  });

  it("renders QuickAddVariantsMatrix and triggers bulk actions", () => {
    const onApplyBasePrice = jest.fn();
    const onApplyBulkStock = jest.fn();
    const onUpdateVariant = jest.fn();
    const onRemoveVariant = jest.fn();
    const variants = [
      {
        id: "var-1",
        name: "L - أسود",
        price: "250",
        stock: "10",
        attributeValues: { المقاس: "L", اللون: "أسود" },
      },
    ];

    render(
      <QuickAddVariantsMatrix
        validAttributes={[{ id: "1", name: "المقاس", slug: "size", values: ["L"] }]}
        potentialCombinationCount={1}
        onGenerateVariations={jest.fn()}
        variants={variants}
        price="250"
        onApplyBasePriceToAll={onApplyBasePrice}
        bulkStockValue="20"
        setBulkStockValue={jest.fn()}
        onApplyBulkStockToAll={onApplyBulkStock}
        onUpdateVariant={onUpdateVariant}
        onRemoveVariant={onRemoveVariant}
      />,
    );

    expect(screen.getByText("L - أسود")).toBeInTheDocument();
    const applyBaseBtn = screen.getByText(/تطبيق السعر الأساسي/);
    fireEvent.click(applyBaseBtn);
    expect(onApplyBasePrice).toHaveBeenCalled();
  });

  it("renders QuickAddFooter and handles submit triggers", () => {
    const onSubmit = jest.fn();
    render(
      <QuickAddFooter
        onAdvanceToNew={jest.fn()}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        submitting={false}
        actionType="publish"
      />,
    );

    const publishBtn = screen.getByText("حفظ ونشر فوراً");
    fireEvent.click(publishBtn);
    expect(onSubmit).toHaveBeenCalledWith(false);

    const advanceBtn = screen.getByText("حفظ ومتابعة التفاصيل");
    fireEvent.click(advanceBtn);
    expect(onSubmit).toHaveBeenCalledWith(true);
  });
});
