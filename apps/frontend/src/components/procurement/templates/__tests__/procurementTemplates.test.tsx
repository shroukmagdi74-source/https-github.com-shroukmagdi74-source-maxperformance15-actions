import React from "react";
import { render, screen } from "@testing-library/react";
import {
  AVAILABLE_PROCUREMENT_TEMPLATES,
  DEFAULT_PROCUREMENT_TEMPLATE,
  NormalizedProcurementData,
} from "../types";
import { OfficialTaxTemplate } from "../OfficialTaxTemplate";
import { ModernMinimalTemplate } from "../ModernMinimalTemplate";
import { GoodsReceiptTemplate } from "../GoodsReceiptTemplate";
import { ProcurementPrintRenderer } from "../ProcurementPrintRenderer";

const mockSampleInvoice: NormalizedProcurementData = {
  documentType: "PI",
  documentNumber: "PI-000123",
  documentDate: "2026-10-24T10:00:00Z",
  dueDate: "2026-11-24T10:00:00Z",
  status: "PENDING",
  statusLabel: "غير مدفوعة",
  companyName: "شركة تجارة المستقبل",
  supplier: {
    id: "sup-1",
    name: "مورد الأقمشة والمواد الخام",
    phone: "01012345678",
    email: "supplier@fabric.com",
    taxNumber: "987-654-321",
  },
  linkedReference: {
    type: "PO",
    number: "PO-000088",
  },
  items: [
    {
      id: "item-1",
      productName: "قماش قطن مصري فاخر",
      description: "رول عرض 150 سم",
      sku: "FAB-CTN-01",
      quantity: 50,
      unitPrice: 120,
      taxRate: 14,
      discountRate: 5,
      totalPrice: 6270,
    },
  ],
  financialSummary: {
    subtotal: 6000,
    discountAmount: 300,
    taxAmount: 798,
    shippingCost: 200,
    totalAmount: 6698,
    paidAmount: 0,
    remainingAmount: 6698,
  },
  notes: "التسليم في المخزن الرئيسي مع فحص الجودة المبدئي.",
  paymentTerms: "سداد بعد 30 يوم من تاريخ الاستلام",
};

describe("Procurement Multi-Template Architecture", () => {
  it("should have 3 registered professional templates with valid metadata", () => {
    expect(AVAILABLE_PROCUREMENT_TEMPLATES).toHaveLength(3);
    const ids = AVAILABLE_PROCUREMENT_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(["official_tax", "modern_minimal", "goods_receipt"]);
    expect(DEFAULT_PROCUREMENT_TEMPLATE).toBe("official_tax");

    AVAILABLE_PROCUREMENT_TEMPLATES.forEach((tmpl) => {
      expect(tmpl.nameAr).toBeTruthy();
      expect(tmpl.nameEn).toBeTruthy();
      expect(tmpl.badgeAr).toBeTruthy();
      expect(tmpl.descriptionAr).toBeTruthy();
    });
  });

  describe("OfficialTaxTemplate", () => {
    it("renders official commercial tax invoice correctly", () => {
      render(<OfficialTaxTemplate data={mockSampleInvoice} isRtl={true} />);

      expect(screen.getByText("شركة تجارة المستقبل")).toBeInTheDocument();
      expect(screen.getByText("PI-000123")).toBeInTheDocument();
      expect(screen.getByText("مورد الأقمشة والمواد الخام")).toBeInTheDocument();
      expect(screen.getByText("قماش قطن مصري فاخر")).toBeInTheDocument();
      expect(screen.getByText("FAB-CTN-01")).toBeInTheDocument();

      // Check 3-signature block headers
      expect(screen.getByText("الاعتمادات والتواقيع الرسمية")).toBeInTheDocument();
      expect(screen.getByText("إعداد المحاسب المسؤول")).toBeInTheDocument();
      expect(screen.getByText("اعتماد المدير المالي / الإدارة")).toBeInTheDocument();
    });
  });

  describe("ModernMinimalTemplate", () => {
    it("renders sleek minimal layout with tabular numerals and clean signoff", () => {
      render(<ModernMinimalTemplate data={mockSampleInvoice} isRtl={true} />);

      expect(screen.getByText("شركة تجارة المستقبل")).toBeInTheDocument();
      expect(screen.getByText("PI-000123")).toBeInTheDocument();
      expect(screen.getByText("PURCHASE INVOICE")).toBeInTheDocument();
      expect(screen.getByText("إعداد وتوثيق المشتريات")).toBeInTheDocument();
      expect(screen.getByText("اعتماد الإدارة والصرف")).toBeInTheDocument();
    });
  });

  describe("GoodsReceiptTemplate", () => {
    it("renders warehouse physical receiving note with QC check items", () => {
      render(<GoodsReceiptTemplate data={mockSampleInvoice} isRtl={true} />);

      expect(screen.getByText("شركة تجارة المستقبل")).toBeInTheDocument();
      expect(screen.getByText(/إذن استلام وفحص مخزني/)).toBeInTheDocument();
      expect(screen.getByText("قماش قطن مصري فاخر")).toBeInTheDocument();
      expect(screen.getByText("سلامة التغليف الخارجي")).toBeInTheDocument();
      expect(screen.getByText("أمين المستودع المستلم")).toBeInTheDocument();
      expect(screen.getByText("مسؤول الجودة والاعتماد")).toBeInTheDocument();
    });
  });

  describe("ProcurementPrintRenderer", () => {
    it("dynamically renders the selected template", () => {
      const { rerender } = render(
        <ProcurementPrintRenderer
          templateId="official_tax"
          data={mockSampleInvoice}
          isRtl={true}
        />
      );
      expect(screen.getByText("TAX PURCHASE INVOICE")).toBeInTheDocument();

      rerender(
        <ProcurementPrintRenderer
          templateId="modern_minimal"
          data={mockSampleInvoice}
          isRtl={true}
        />
      );
      expect(screen.getByText("PURCHASE INVOICE")).toBeInTheDocument();

      rerender(
        <ProcurementPrintRenderer
          templateId="goods_receipt"
          data={mockSampleInvoice}
          isRtl={true}
        />
      );
      expect(screen.getByText(/WAREHOUSE RECEIPT & QUALITY INSPECTION NOTE/)).toBeInTheDocument();
    });
  });
});
