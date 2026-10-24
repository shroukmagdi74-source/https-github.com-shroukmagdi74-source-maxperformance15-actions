/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CompanyLinks from "../CompanyLinks";

const mockLinks = [
  {
    id: "link-1",
    name: "بوابة الموردين الرئيسية",
    url: "https://suppliers.example.com",
    username: "maxp_admin",
    openMode: "new_tab",
    hasPassword: true,
  },
  {
    id: "link-2",
    name: "نظام الشحن الداخلي",
    url: "https://shipping.internal.net",
    username: "logistics_lead",
    openMode: "in_app",
    hasPassword: false,
  },
];

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "usr-admin",
      role: "COMPANY_ADMIN",
      companyId: "comp-1",
    },
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "companyLinks.title": "روابط الشركة",
        "companyLinks.addLink": "إضافة رابط",
        "companyLinks.editLink": "تعديل الرابط",
        "companyLinks.copy": "نسخ الرابط",
        "companyLinks.createShareLink": "إنشاء رابط مشاركة",
        "companyLinks.shareLinkCopied": "تم نسخ رابط المشاركة",
        "companyLinks.shareLinkRevoked": "تم إلغاء رابط المشاركة",
        "companyLinks.usernameCopied": "تم نسخ اسم المستخدم",
        "companyLinks.passwordCopied": "تم نسخ كلمة المرور",
        "companyLinks.password": "كلمة المرور",
        "companyLinks.showPassword": "عرض كلمة المرور",
        "companyLinks.copyPassword": "نسخ كلمة المرور",
        "companyLinks.open": "فتح الرابط",
        "companyLinks.copyUsername": "نسخ اسم المستخدم",
        "companyLinks.linkName": "اسم الرابط",
        "companyLinks.url": "الرابط",
        "companyLinks.username": "اسم المستخدم",
        "companyLinks.openMode": "طريقة الفتح",
        "companyLinks.newTab": "علامة تبويب جديدة",
        "companyLinks.inApp": "داخل التطبيق",
        "companyLinks.deleteConfirm": "تأكيد حذف الرابط",
        "common.edit": "تعديل",
        "common.delete": "حذف",
        "common.cancel": "إلغاء",
        "common.save": "حفظ",
        "common.close": "إغلاق",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn((url: string) => {
      if (url === "company/links") {
        return Promise.resolve({ data: { data: mockLinks } });
      }
      if (url === "company/links/share-token") {
        return Promise.resolve({ data: { data: { token: "token-abc-123" } } });
      }
      if (url.includes("/password")) {
        return Promise.resolve({ data: { data: { password: "SuperSecretPassword123!" } } });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));

describe("CompanyLinks Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and links list correctly", async () => {
    render(<CompanyLinks />);

    expect(screen.getByText("روابط الشركة")).toBeTruthy();
    expect(screen.getByText("إضافة رابط")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("بوابة الموردين الرئيسية")).toBeTruthy();
      expect(screen.getByText("نظام الشحن الداخلي")).toBeTruthy();
      expect(screen.getByText("https://suppliers.example.com")).toBeTruthy();
      expect(screen.getByText("maxp_admin")).toBeTruthy();
      expect(screen.getByText("محمي بكلمة مرور")).toBeTruthy();
    });
  });

  it("opens add link modal on clicking add button", async () => {
    render(<CompanyLinks />);

    const addBtn = screen.getByText("إضافة رابط");
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByLabelText("اسم الرابط")).toBeTruthy();
      expect(screen.getByLabelText("الرابط")).toBeTruthy();
      expect(screen.getByLabelText("اسم المستخدم")).toBeTruthy();
      expect(screen.getByLabelText("كلمة المرور")).toBeTruthy();
    });
  });

  it("opens show password modal when clicking show password", async () => {
    render(<CompanyLinks />);

    await waitFor(() => {
      expect(screen.getByText("بوابة الموردين الرئيسية")).toBeTruthy();
    });

    const showPasswordBtn = screen.getByRole("button", { name: "عرض كلمة المرور" });
    fireEvent.click(showPasswordBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue("SuperSecretPassword123!")).toBeTruthy();
    });
  });

  it("opens delete confirmation modal when clicking delete", async () => {
    render(<CompanyLinks />);

    await waitFor(() => {
      expect(screen.getByText("بوابة الموردين الرئيسية")).toBeTruthy();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "حذف" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("تأكيد حذف الرابط")).toBeTruthy();
    });
  });
});
