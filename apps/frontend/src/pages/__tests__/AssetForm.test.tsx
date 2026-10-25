// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import AssetForm from "../hr/assets/AssetForm";
import { companyAwareApi } from "../../services/companyAwareApi";

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("AssetForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (companyAwareApi.get as any).mockImplementation((url: string) => {
      if (url.includes("/hr/assets/categories")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ id: "cat-1", name: "أجهزة لابتوب" }],
          },
        });
      }
      if (url.includes("/procurement/suppliers")) {
        return Promise.resolve({
          data: {
            suppliers: [{ id: "sup-1", name: "مورد التكنولوجيا", mobile: "01012345678" }],
          },
        });
      }
      if (url.includes("/hr/employees")) {
        return Promise.resolve({
          data: {
            success: true,
            employees: [
              { id: "emp-1", firstName: "أحمد", lastName: "سعيد", employeeNumber: "EMP-100" },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders add asset form modal with basic, location, and financial sections", async () => {
    render(
      <AssetForm
        usePortal={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("إضافة أصل جديد")).toBeTruthy();
    expect(screen.getByText("البيانات الأساسية للأصل")).toBeTruthy();
    expect(screen.getByText("الحالة والموقع")).toBeTruthy();
    expect(screen.getByText("البيانات المالية والضمان")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("أجهزة لابتوب")).toBeTruthy();
    });
  });

  it("renders edit mode title and populates initial data", async () => {
    render(
      <AssetForm
        usePortal={false}
        initialData={{
          id: "asset-99",
          name: "ThinkPad X1 Carbon",
          code: "AST-99",
          purchaseValue: 65000,
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText("تعديل بيانات الأصل")).toBeTruthy();
    expect((screen.getByDisplayValue("ThinkPad X1 Carbon") as HTMLInputElement).value).toBe(
      "ThinkPad X1 Carbon"
    );
    expect((screen.getByDisplayValue("AST-99") as HTMLInputElement).value).toBe("AST-99");
  });
});
