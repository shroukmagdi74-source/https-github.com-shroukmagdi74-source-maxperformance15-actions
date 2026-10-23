/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import WhatsAppMetaTemplates from "../../WhatsAppMetaTemplates";
import { apiClient } from "../../../../services/apiClient";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { dir: () => "rtl", language: "ar" },
      t: (key: string) => {
        if (key === "common.back") return "رجوع";
        if (key === "common.search") return "بحث...";
        return key;
      },
    }),
  };
});

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSessions = [
  {
    id: "sess-meta-1",
    name: "MaxP Meta Official",
    phoneNumber: "+201012345678",
    provider: "META_CLOUD",
  },
];

const mockTemplates = [
  {
    name: "order_confirmation",
    status: "APPROVED",
    category: "UTILITY",
    language: "ar",
    id: "tpl-meta-1",
    components: [
      { type: "HEADER", format: "TEXT", text: "تأكيد طلبك" },
      { type: "BODY", text: "مرحباً {{1}}، طلبك رقم {{2}} قيد التجهيز الآن." },
      { type: "FOOTER", text: "شكراً لتعاملك معنا" },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "تتبع الشحنة", url: "https://example.com/track" }],
      },
    ],
  },
  {
    name: "otp_verification",
    status: "APPROVED",
    category: "AUTHENTICATION",
    language: "ar",
    id: "tpl-meta-2",
    components: [
      { type: "BODY", text: "رمز التحقق هو {{1}}" },
      {
        type: "BUTTONS",
        buttons: [{ type: "OTP", text: "نسخ الرمز" }],
      },
    ],
  },
  {
    name: "black_friday_promo",
    status: "REJECTED",
    category: "MARKETING",
    language: "ar",
    id: "tpl-meta-3",
    rejected_reason: "Promotional content violates timing policy",
    components: [
      { type: "BODY", text: "عروض الجمعة البيضاء وصلت بخصومات حتى 50%!" },
    ],
  },
];

describe("WhatsAppMetaTemplates Component (Batch 436)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      if (url.includes("/whatsapp-templates/templates")) {
        return Promise.resolve({ data: { templates: mockTemplates } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders session selection, templates table and status banner", async () => {
    render(
      <MemoryRouter>
        <WhatsAppMetaTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("order_confirmation").length).toBeGreaterThan(0);
      expect(screen.getAllByText("otp_verification").length).toBeGreaterThan(0);
      expect(screen.getAllByText("black_friday_promo").length).toBeGreaterThan(0);
    });

    // Check health alert for rejected template
    expect(screen.getByText(/مرفوض من Meta/i)).toBeInTheDocument();
  });

  it("filters templates by status chip", async () => {
    render(
      <MemoryRouter>
        <WhatsAppMetaTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("order_confirmation").length).toBeGreaterThan(0);
    });

    // Click on "مرفوضة" status chip
    const rejectedChip = screen.getByRole("tab", { name: /مرفوضة/i });
    fireEvent.click(rejectedChip);

    await waitFor(() => {
      expect(screen.getAllByText("black_friday_promo").length).toBeGreaterThan(0);
      expect(screen.queryByText("order_confirmation")).not.toBeInTheDocument();
      expect(screen.queryByText("otp_verification")).not.toBeInTheDocument();
    });
  });

  it("filters templates using search input", async () => {
    render(
      <MemoryRouter>
        <WhatsAppMetaTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("order_confirmation").length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText("ابحث بالاسم أو ID...");
    fireEvent.change(searchInput, { target: { value: "otp" } });

    await waitFor(() => {
      expect(screen.getAllByText("otp_verification").length).toBeGreaterThan(0);
      expect(screen.queryByText("order_confirmation")).not.toBeInTheDocument();
      expect(screen.queryByText("black_friday_promo")).not.toBeInTheDocument();
    });
  });

  it("opens create template dialog and steps through", async () => {
    render(
      <MemoryRouter>
        <WhatsAppMetaTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قالب جديد")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("قالب جديد"));

    await waitFor(() => {
      expect(screen.getByText("اسم القالب")).toBeInTheDocument();
      expect(screen.getByText("المعلومات الأساسية")).toBeInTheDocument();
    });

    // Click "التالي" to proceed to Content step
    const nextButton = screen.getByText("التالي");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("المحتوى")).toBeInTheDocument();
    });
  });

  it("opens ready-to-use template library dialog", async () => {
    render(
      <MemoryRouter>
        <WhatsAppMetaTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("فتح مكتبة القوالب الجاهزة")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("فتح مكتبة القوالب الجاهزة"));

    await waitFor(() => {
      expect(screen.getByText("قوالب جاهزة")).toBeInTheDocument();
      expect(screen.getByText("دورة الطلبات")).toBeInTheDocument();
      expect(screen.getByText("الولاء والمكافآت")).toBeInTheDocument();
    });
  });
});
