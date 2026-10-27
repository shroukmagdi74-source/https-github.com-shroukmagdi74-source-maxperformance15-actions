// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductLandingPages from "../ProductLandingPages";
import { productLandingPagesService } from "../../../services/productLandingPagesService";

vi.mock("../../../services/productLandingPagesService", () => ({
  productLandingPagesService: {
    list: vi.fn(),
    listProducts: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    generateAiContent: vi.fn(),
  },
}));

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "usr_1",
      companyId: "comp_1",
      company: {
        id: "comp_1",
        slug: "swan-store",
        customDomain: "",
      },
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const mockProduct = {
  id: "prod_1",
  name: "حذاء رياضي مريح",
  slug: "comfort-running-shoes",
  price: 450,
  mainImage: "https://example.com/shoe.jpg",
  images: ["https://example.com/shoe.jpg"],
};

const mockPage = {
  id: "lp_1",
  companyId: "comp_1",
  productId: "prod_1",
  slug: "comfort-running-shoes-lp",
  title: "حذاء الجري المريح الأصلي",
  status: "DRAFT" as const,
  generationMode: "MANUAL",
  generationStatus: "COMPLETED",
  slices: [],
  sections: [
    {
      id: "sec_hero",
      type: "HEADING" as const,
      title: "العنوان الرئيسي",
      enabled: true,
      content: {
        heading: "أفضل حذاء رياضي لعام 2026",
        subheading: "راحة وأناقة تدوم طوال اليوم",
      },
    },
    {
      id: "sec_text",
      type: "TEXT" as const,
      title: "نص تفصيلي",
      enabled: true,
      content: {
        bodyText: "صُمم هذا الحذاء من أجود الخامات الطبية.",
      },
    },
  ],
  formConfig: {
    orderKicker: "نموذج الطلب",
    orderTitle: "اطلب حذاء الجري الآن",
    orderCopy: "الدفع عند الاستلام مع معاينة قبل الدفع",
    buttonLabel: "تأكيد الطلب الآن",
  },
  product: mockProduct,
};

describe("ProductLandingPages (Modular Architecture)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders clean zero state when merchant has no landing pages", async () => {
    (productLandingPagesService.list as any).mockResolvedValue([]);
    (productLandingPagesService.listProducts as any).mockResolvedValue([mockProduct]);

    render(
      <MemoryRouter>
        <ProductLandingPages />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("ابدأ بإنشاء أول صفحة هبوط لمنتجاتك!"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("+ إنشاء أول صفحة هبوط الآن"),
    ).toBeInTheDocument();
  });

  it("renders header, summary card, sections stack, and mobile nav when landing pages exist", async () => {
    (productLandingPagesService.list as any).mockResolvedValue([mockPage]);
    (productLandingPagesService.listProducts as any).mockResolvedValue([mockProduct]);

    render(
      <MemoryRouter>
        <ProductLandingPages />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/حذاء الجري المريح الأصلي/).length).toBeGreaterThanOrEqual(1);
    });

    // Check Mobile navigation tabs
    expect(screen.getByRole("button", { name: /المحرر والأقسام/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /المعاينة الحية/ })).toBeInTheDocument();

    // Check sections rendered
    expect(screen.getByText("العنوان الرئيسي")).toBeInTheDocument();
    expect(screen.getByText("نص تفصيلي")).toBeInTheDocument();
  });

  it("switches mobile tabs between editor and preview correctly", async () => {
    (productLandingPagesService.list as any).mockResolvedValue([mockPage]);
    (productLandingPagesService.listProducts as any).mockResolvedValue([mockProduct]);

    render(
      <MemoryRouter>
        <ProductLandingPages />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/حذاء الجري المريح الأصلي/).length).toBeGreaterThanOrEqual(1);
    });

    const previewTabBtn = screen.getByRole("button", { name: /المعاينة الحية/ });
    fireEvent.click(previewTabBtn);

    expect(previewTabBtn).toHaveClass("is-active");

    const editorTabBtn = screen.getByRole("button", { name: /المحرر والأقسام/ });
    fireEvent.click(editorTabBtn);

    expect(editorTabBtn).toHaveClass("is-active");
  });

  it("triggers save mutation successfully when clicking save in header", async () => {
    (productLandingPagesService.list as any).mockResolvedValue([mockPage]);
    (productLandingPagesService.listProducts as any).mockResolvedValue([mockProduct]);
    (productLandingPagesService.update as any).mockResolvedValue({
      ...mockPage,
      title: "حذاء الجري المحدث",
    });

    render(
      <MemoryRouter>
        <ProductLandingPages />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/حذاء الجري المريح الأصلي/).length).toBeGreaterThanOrEqual(1);
    });

    const saveBtn = screen.getAllByRole("button", { name: /حفظ/ })[0];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(productLandingPagesService.update).toHaveBeenCalledWith(
        "lp_1",
        expect.objectContaining({
          slug: "comfort-running-shoes-lp",
        }),
      );
    });
  });

  it("allows opening create landing page modal from zero state", async () => {
    (productLandingPagesService.list as any).mockResolvedValue([]);
    (productLandingPagesService.listProducts as any).mockResolvedValue([mockProduct]);

    render(
      <MemoryRouter>
        <ProductLandingPages />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("ابدأ بإنشاء أول صفحة هبوط لمنتجاتك!")).toBeInTheDocument();
    });

    const createBtn = screen.getByText("+ إنشاء أول صفحة هبوط الآن");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText(/إنشاء صفحة هبوط جديدة للمنتج/)).toBeInTheDocument();
    });
  });
});
