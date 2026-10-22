/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import WhatsAppNotifications from "../../WhatsAppNotifications";
import { apiClient } from "../../../../services/apiClient";

// Mock apiClient
vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock translation
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, defaultVal?: string | Record<string, unknown>) => {
        if (typeof defaultVal === "string") return defaultVal;
        return key;
      },
      i18n: {
        language: "ar",
        dir: () => "rtl",
      },
    }),
  };
});

// Mock scheduled reports tab
vi.mock("../../scheduled-reports/WhatsAppScheduledReportsTab", () => ({
  WhatsAppScheduledReportsTab: () => <div data-testid="scheduled-reports-tab">Reports Tab</div>,
}));

const mockSettings = {
  id: "sett-1",
  companyId: "comp-1",
  isEnabled: true,
  defaultSessionId: "sess-1",
  stickySessionEnabled: true,
  orderNotificationsEnabled: true,
  orderCreatedEnabled: true,
  orderConfirmedEnabled: true,
  orderProcessingEnabled: true,
  orderShippedEnabled: true,
  orderDeliveredEnabled: true,
  orderCancelledEnabled: false,
  paymentReminderEnabled: true,
  paymentReminderHours: 24,
  productNotificationsEnabled: true,
  backInStockEnabled: true,
  priceDropEnabled: false,
  newProductEnabled: true,
  abandonedCartEnabled: true,
  abandonedCartFirstReminder: 1,
  abandonedCartSecondReminder: 24,
  abandonedCartThirdReminder: 72,
  abandonedCartDiscountEnabled: true,
  abandonedCartDiscountPercent: 10,
  marketingNotificationsEnabled: true,
  promotionalEnabled: true,
  couponEnabled: true,
  birthdayEnabled: true,
  loyaltyEnabled: true,
  companyLifecycleNotificationsEnabled: true,
  newSignupWelcomeEnabled: true,
  newSignupAdminAlertEnabled: true,
  companyLifecycleAdminPhones: "01011112222",
  companyLifecycleAdminRoutingMode: "ALL",
  subscriptionCreatedEnabled: true,
  subscriptionRenewedEnabled: true,
  subscriptionCancelledEnabled: false,
  newsletterSubscribedEnabled: true,
  benefitGrantedEnabled: true,
  hrNotificationsEnabled: true,
  attendanceReminderEnabled: true,
  attendanceConfirmedEnabled: true,
  checkoutConfirmedEnabled: true,
  leaveApprovalEnabled: true,
  permissionApprovalEnabled: true,
  manualDeductionEnabled: false,
  payrollEnabled: true,
  birthdayWishEnabled: true,
  warningNotificationEnabled: true,
  taskNotificationsEnabled: true,
  taskCreatedEnabled: true,
  taskUpdatedEnabled: true,
  taskStatusChangedEnabled: true,
  taskCommentedEnabled: true,
  taskAttachmentAddedEnabled: true,
  taskDeletedEnabled: false,
  taskWatcherAddedEnabled: true,
  taskExecutionCheckEnabled: false,
  taskDeadlineReminderEnabled: true,
  taskOverdueEnabled: true,
  taskSubtaskCreatedEnabled: false,
  taskChecklistItemCompletedEnabled: false,
  taskTimeEntryAddedEnabled: false,
  rateLimitPerMinute: 20,
  quietHoursEnabled: true,
  quietHoursStart: "23:00",
  quietHoursEnd: "08:00",
};

const mockSessions = [
  {
    id: "sess-1",
    name: "Customer Support",
    phoneNumber: "201011112222",
    status: "CONNECTED",
  },
];

const mockTemplates = [
  {
    id: "tpl-1",
    name: "Back in stock alert",
    category: "PRODUCTS",
    eventType: "BACK_IN_STOCK",
    content: "عزيزي العميل، المنتج متوفر الآن!",
    isActive: true,
    isDefault: true,
  },
];

describe("WhatsAppNotifications (Batch 423)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading skeletons initially", () => {
    (apiClient.get as any).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <WhatsAppNotifications />
      </MemoryRouter>,
    );
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders full cockpit layout with KPIs and General Tab after load", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/settings")) {
        return Promise.resolve({
          data: { settings: mockSettings, sessions: mockSessions },
        });
      }
      if (url.includes("/whatsapp-notifications/templates")) {
        return Promise.resolve({
          data: { templates: mockTemplates },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <WhatsAppNotifications companyName="MaxP Store" />
      </MemoryRouter>,
    );

    // Wait for content
    await waitFor(() => {
      expect(screen.getByText(/إشعارات واتساب · MaxP Store/i)).toBeInTheDocument();
    });

    // Verify KPIs
    expect(screen.getByText("201011112222")).toBeInTheDocument();

    // Verify General Tab content
    expect(screen.getByText("التحكم الرئيسي والجلسة")).toBeInTheDocument();
    expect(screen.getByText("حدود الإرسال وساعات الهدوء")).toBeInTheDocument();
  });

  it("allows switching tabs between General, Products, and Marketing", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/settings")) {
        return Promise.resolve({
          data: { settings: mockSettings, sessions: mockSessions },
        });
      }
      if (url.includes("/whatsapp-notifications/templates")) {
        return Promise.resolve({
          data: { templates: mockTemplates },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <WhatsAppNotifications />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("التحكم الرئيسي والجلسة")).toBeInTheDocument();
    });

    // Click on Products tab
    const productsTabButton = screen.getByRole("button", {
      name: /whatsappNotifications.tabs.products/i,
    });
    fireEvent.click(productsTabButton);

    await waitFor(() => {
      expect(screen.getByText("استعادة السلات المتروكة")).toBeInTheDocument();
    });
  });

  it("opens test notification dialog and displays inputs", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/settings")) {
        return Promise.resolve({
          data: { settings: mockSettings, sessions: mockSessions },
        });
      }
      if (url.includes("/whatsapp-notifications/templates")) {
        return Promise.resolve({
          data: { templates: mockTemplates },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <WhatsAppNotifications />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("التحكم الرئيسي والجلسة")).toBeInTheDocument();
    });

    // Click test message button
    const testButton = screen.getByRole("button", {
      name: /إرسال رسالة تجريبية/i,
    });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText("إرسال إشعار اختباري")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("2010xxxxxxxx")).toBeInTheDocument();
    });
  });

  it("triggers saveSettings when Save button is clicked", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/whatsapp-notifications/settings")) {
        return Promise.resolve({
          data: { settings: mockSettings, sessions: mockSessions },
        });
      }
      if (url.includes("/whatsapp-notifications/templates")) {
        return Promise.resolve({
          data: { templates: mockTemplates },
        });
      }
      return Promise.resolve({ data: {} });
    });
    (apiClient.put as any).mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter>
        <WhatsAppNotifications />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("التحكم الرئيسي والجلسة")).toBeInTheDocument();
    });

    // Click Save button
    const saveButton = screen.getByRole("button", { name: /حفظ الإعدادات/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/whatsapp-notifications/settings",
        expect.any(Object),
        expect.any(Object),
      );
    });
  });
});
