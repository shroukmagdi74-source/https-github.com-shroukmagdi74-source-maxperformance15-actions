// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Suppliers from "../Suppliers";
import {
  SuppliersHeader,
  SuppliersTable,
  SuppliersMobileView,
  SupplierFormModal,
  SupplierDetailsModal,
  SupplierQuickTagModal,
  StarRating,
  parseTags,
} from "../suppliers/index";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSuppliers = [
  {
    id: "supp-1",
    name: "مورد النور والهدى",
    contactPerson: "أحمد حسني",
    email: "alnoor@example.com",
    phone: "01012345678",
    mobile: "01098765432",
    city: "القاهرة",
    country: "مصر",
    taxNumber: "123456789",
    commercialRegister: "987654",
    creditLimit: 50000,
    currentBalance: 12500,
    rating: 4,
    tags: "أقمشة,قطن,درجة أولى",
    isActive: true,
    address: "وسط البلد، القاهرة",
    notes: "مورد موثوق وسريع",
  },
  {
    id: "supp-2",
    name: "مؤسسة الأمل للتوريدات",
    contactPerson: "سارة كمال",
    email: "alamal@example.com",
    phone: "01122334455",
    currentBalance: -3000,
    rating: 5,
    tags: ["إكسسوارات"],
    isActive: false,
    address: "مدينة نصر",
  },
];

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.startsWith("/procurement/suppliers")) {
        return Promise.resolve({
          data: {
            suppliers: mockSuppliers,
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn().mockResolvedValue({
      data: { success: true, message: "تمت العملية بنجاح", updatedCount: 2, currentBalance: 12500 },
    }),
    put: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم التعديل بنجاح" },
    }),
    delete: vi.fn().mockResolvedValue({
      data: { success: true, message: "تم الحذف بنجاح" },
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k: string, d?: string) => d || k,
    i18n: {
      language: "ar",
      dir: () => "rtl",
    },
  }),
}));

describe("Procurement Suppliers Modularization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Subcomponent & Helper Unit Tests", () => {
    it("parseTags handles string, array, json, and empty inputs correctly", () => {
      expect(parseTags("tag1, tag2,tag3")).toEqual(["tag1", "tag2", "tag3"]);
      expect(parseTags(["a", "b"])).toEqual(["a", "b"]);
      expect(parseTags('["json1", "json2"]')).toEqual(["json1", "json2"]);
      expect(parseTags(null)).toEqual([]);
      expect(parseTags(undefined)).toEqual([]);
      expect(parseTags("")).toEqual([]);
    });

    it("StarRating renders read-only and interactive states", () => {
      const onChange = vi.fn();
      const { container } = render(<StarRating value={3} onChange={onChange} />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(5);

      fireEvent.click(buttons[3]); // 4th star (rating 4)
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("SuppliersHeader triggers recalculateAll and addNew callbacks", () => {
      const onRecalc = vi.fn();
      const onAdd = vi.fn();
      render(
        <SuppliersHeader
          recalculatingAll={false}
          loading={false}
          onRecalculateAll={onRecalc}
          onAddNew={onAdd}
        />
      );

      fireEvent.click(screen.getByText("مزامنة وتدقيق الأرصدة"));
      expect(onRecalc).toHaveBeenCalled();

      fireEvent.click(screen.getByText("procurement.suppliers.addNew"));
      expect(onAdd).toHaveBeenCalled();
    });

    it("SuppliersTable renders columns, tags, and action triggers", () => {
      const onRecalcSingle = vi.fn();
      const onQuickTag = vi.fn();
      const onViewDetails = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <SuppliersTable
          suppliers={mockSuppliers as any}
          loading={false}
          searchTerm=""
          recalculatingId={null}
          onRecalculateSingle={onRecalcSingle}
          onQuickTag={onQuickTag}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText("مورد النور والهدى")).toBeTruthy();
      expect(screen.getByText("أحمد حسني")).toBeTruthy();
      expect(screen.getByText("مستحق للمورد")).toBeTruthy();
      expect(screen.getByText("دفعة مقدمة")).toBeTruthy();
      expect(screen.getByText("+1")).toBeTruthy(); // Tag overflow for 3 tags
    });

    it("SupplierQuickTagModal handles input and submits", () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      const setQuickTagInput = vi.fn();

      render(
        <SupplierQuickTagModal
          supplier={mockSuppliers[0] as any}
          onClose={onClose}
          quickTagInput="مستعجل"
          setQuickTagInput={setQuickTagInput}
          saving={false}
          onSave={onSave}
        />
      );

      expect(screen.getByText("إضافة وسم للمورد")).toBeTruthy();
      const saveBtn = screen.getByText("common.save");
      fireEvent.click(saveBtn);
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe("Coordinator Integration Tests", () => {
    it("renders coordinator shell with search bar and suppliers list", async () => {
      render(
        <MemoryRouter>
          <Suppliers />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText("مورد النور والهدى").length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText("procurement.suppliers.searchPlaceholder");
      expect(searchInput).toBeTruthy();
      fireEvent.change(searchInput, { target: { value: "النور" } });
      expect((searchInput as HTMLInputElement).value).toBe("النور");
    });

    it("navigates to supplier details on view click", async () => {
      render(
        <MemoryRouter>
          <Suppliers />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText("مورد النور والهدى").length).toBeGreaterThan(0);
      });

      const viewBtns = screen.getAllByTitle("procurement.suppliers.viewDetails");
      fireEvent.click(viewBtns[0]);
      expect(mockNavigate).toHaveBeenCalledWith("/procurement/suppliers/supp-1");
    });
  });
});
