// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import ReceiptFormSection from "../hr/assets/sections/ReceiptFormSection";
import {
  createInitialReceipts,
  buildReceiptFromSelection,
} from "../hr/assets/sections/receipt-form/helpers";

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
  },
}));

const mockGet = vi.fn();

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

describe("ReceiptFormSection Helpers", () => {
  it("creates initial receipts and builds receipt from employee and asset selection", () => {
    const initial = createInitialReceipts();
    expect(initial).toHaveLength(2);
    expect(initial[0].referenceNumber).toBe("AST-2024-001");

    const generated = buildReceiptFromSelection(
      {
        id: "emp-99",
        firstName: "محمود",
        lastName: "عادل",
        employeeId: "EMP-990",
        position: "مدير مالي",
        department: { name: "المالية" },
      },
      {
        id: "ast-99",
        name: "Dell Latitude 7440",
        category: { name: "حواسيب" },
        code: "DL-7440",
        serialNumber: "SN-DELL-7440",
        condition: "NEW",
      },
    );

    expect(generated.employeeName).toBe("محمود عادل");
    expect(generated.assetCode).toBe("DL-7440");
    expect(generated.assetCondition).toBe("جديد (Brand New)");
  });
});

describe("ReceiptFormSection Component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: { success: true, data: [] } });
  });

  it("renders sidebar receipts list and displays selected receipt document preview", async () => {
    render(<ReceiptFormSection />);

    expect(screen.getByText("أحمد محمد علي")).toBeTruthy();
    expect(screen.getByText("AST-2024-001")).toBeTruthy();

    fireEvent.click(screen.getByText("أحمد محمد علي"));

    await waitFor(() => {
      expect(screen.getByText("نموذج استلام عهدة")).toBeTruthy();
    });
    expect(screen.getByText("EMP-1552")).toBeTruthy();
    expect(screen.getByText("SN-998822JH1")).toBeTruthy();
  });

  it("opens generate receipt modal when clicking توليد نموذج جديد", () => {
    render(<ReceiptFormSection />);

    fireEvent.click(screen.getByText("توليد نموذج جديد"));

    expect(screen.getByText("توليد نموذج استلام عهدة")).toBeTruthy();
    expect(screen.getByText("اختر الموظف")).toBeTruthy();
  });
});
