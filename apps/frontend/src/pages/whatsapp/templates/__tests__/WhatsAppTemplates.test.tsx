/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import WhatsAppTemplates from "../../WhatsAppTemplates";
import { apiClient } from "../../../../services/apiClient";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { dir: () => "rtl", language: "ar" },
      t: (key: string) => {
        if (key === "whatsappNotifications.tabs.templates") return "قوالب الرسائل";
        if (key === "whatsappNotifications.tabs.products") return "المنتجات";
        if (key === "whatsappNotifications.tabs.marketing") return "التسويق";
        if (key === "whatsappNotifications.tabs.abandonedCart") return "سلات متروكة";
        if (key === "whatsappNotifications.tabs.hr") return "الموارد البشرية";
        if (key === "common.system") return "النظام";
        if (key === "common.search") return "بحث...";
        if (key === "common.refresh") return "تحديث";
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
  },
}));

vi.mock("../../customers/components/MetaTemplatesModal", () => ({
  default: () => <div data-testid="mock-meta-templates-modal" />,
}));

const mockTemplates = [
  {
    id: "tpl-1",
    name: "قالب ترحيب بالعميل الجديد",
    category: "CUSTOMER",
    eventType: "LOYALTY_POINTS_AWARDED",
    content: "مرحبا {customerName}، تم إضافة {points} نقطة لحسابك!",
    isActive: true,
    isDefault: false,
    channel: "AUTO",
    sentCount: 142,
    deliveredCount: 139,
    readCount: 120,
    metaTemplateName: null,
    metaTemplateStatus: null,
  },
  {
    id: "tpl-2",
    name: "قالب استرجاع السلة",
    category: "ABANDONED_CART",
    eventType: "CART_ABANDONED_1H",
    content: "أهلاً {customerName}، نسيت منتجات في سلتك بقيمة {cartTotal}",
    isActive: true,
    isDefault: false,
    channel: "BAILEYS",
    sentCount: 50,
    deliveredCount: 48,
    readCount: 35,
    metaTemplateName: null,
    metaTemplateStatus: null,
  },
  {
    id: "tpl-3",
    name: "تنبيه ميتا كلاود المعتمد",
    category: "MARKETING",
    eventType: "PROMOTIONAL",
    content: "عروض الجمعة البيضاء وصلت! كود الخصم: {couponCode}",
    isActive: true,
    isDefault: false,
    channel: "META_CLOUD",
    sentCount: 500,
    deliveredCount: 490,
    readCount: 410,
    metaTemplateName: "bf_promo_2026",
    metaTemplateStatus: "APPROVED",
  },
];

const mockSessions = [
  {
    id: "sess-meta-1",
    name: "Meta WhatsApp Official",
    provider: "META_CLOUD",
    metaDisplayPhoneNumber: "+201012345678",
  },
];

describe("WhatsAppTemplates Component (Batch 435)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/templates")) {
        return Promise.resolve({ data: { templates: mockTemplates } });
      }
      if (url.includes("/whatsapp/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and template cards after loading", async () => {
    render(
      <MemoryRouter>
        <WhatsAppTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قالب ترحيب بالعميل الجديد")).toBeInTheDocument();
      expect(screen.getByText("قالب استرجاع السلة")).toBeInTheDocument();
      expect(screen.getByText("تنبيه ميتا كلاود المعتمد")).toBeInTheDocument();
    });

    // Check tabular metrics
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("139")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();

    // Check channel badges
    expect(screen.getByText("توجيه ذكي (Auto)")).toBeInTheDocument();
    expect(screen.getByText("واتساب ويب (Baileys)")).toBeInTheDocument();
    expect(screen.getByText("ميتا كلاود (Meta Cloud)")).toBeInTheDocument();
  });

  it("filters templates by category tabs", async () => {
    render(
      <MemoryRouter>
        <WhatsAppTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قالب ترحيب بالعميل الجديد")).toBeInTheDocument();
    });

    // Click on "سلات متروكة" tab
    const cartTab = screen.getByRole("tab", { name: /سلات متروكة/i });
    fireEvent.click(cartTab);

    await waitFor(() => {
      expect(screen.getByText("قالب استرجاع السلة")).toBeInTheDocument();
      expect(screen.queryByText("قالب ترحيب بالعميل الجديد")).not.toBeInTheDocument();
      expect(screen.queryByText("تنبيه ميتا كلاود المعتمد")).not.toBeInTheDocument();
    });
  });

  it("filters templates using search input", async () => {
    render(
      <MemoryRouter>
        <WhatsAppTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قالب ترحيب بالعميل الجديد")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("بحث...");
    fireEvent.change(searchInput, { target: { value: "الجمعة" } });

    await waitFor(() => {
      expect(screen.getByText("تنبيه ميتا كلاود المعتمد")).toBeInTheDocument();
      expect(screen.queryByText("قالب ترحيب بالعميل الجديد")).not.toBeInTheDocument();
      expect(screen.queryByText("قالب استرجاع السلة")).not.toBeInTheDocument();
    });
  });

  it("opens create template dialog when clicking new template button", async () => {
    render(
      <MemoryRouter>
        <WhatsAppTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("إضافة قالب جديد")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("إضافة قالب جديد"));

    await waitFor(() => {
      expect(screen.getByText("قالب جديد")).toBeInTheDocument();
      expect(screen.getByText("حفظ القالب")).toBeInTheDocument();
      expect(screen.getByText("إلغاء")).toBeInTheDocument();
    });
  });

  it("triggers publish to Meta when clicking publish button", async () => {
    (apiClient.post as any).mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <WhatsAppTemplates />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("قالب ترحيب بالعميل الجديد")).toBeInTheDocument();
    });

    const publishButtons = screen.getAllByText("نشر على ميتا");
    expect(publishButtons.length).toBeGreaterThan(0);
    fireEvent.click(publishButtons[0]!);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/whatsapp-notifications/templates/tpl-1/publish",
        { sessionId: "sess-meta-1" },
        {},
      );
    });
  });
});
