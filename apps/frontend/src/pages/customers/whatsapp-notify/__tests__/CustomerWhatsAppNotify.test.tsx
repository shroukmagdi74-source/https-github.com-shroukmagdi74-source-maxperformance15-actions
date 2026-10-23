/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import CustomerWhatsAppNotify from "../../CustomerWhatsAppNotify";
import { apiClient } from "../../../../services/apiClient";

// Mock apiClient
vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Birthday component
vi.mock("../../BirthdayWhatsAppNotify", () => ({
  default: () => <div data-testid="birthday-notify-page">Birthday Page</div>,
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

const mockSessions = [
  {
    sessionId: "sess-123",
    phoneNumber: "201012345678",
    isConnected: true,
    status: "CONNECTED",
  },
];

describe("CustomerWhatsAppNotify (Batch 424)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Birthday component when mode is birthday", () => {
    render(
      <MemoryRouter>
        <CustomerWhatsAppNotify mode="birthday" />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("birthday-notify-page")).toBeInTheDocument();
  });

  it("renders general cockpit with connected session and audience card", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      if (url.includes("/preview-audience")) {
        return Promise.resolve({ data: { count: 1250 } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <CustomerWhatsAppNotify mode="general" />
      </MemoryRouter>,
    );

    // Verify header title
    expect(screen.getByText("إرسال إشعارات واتساب للعملاء")).toBeInTheDocument();

    // Verify session badge
    await waitFor(() => {
      expect(screen.getByText("201012345678")).toBeInTheDocument();
    });

    // Verify audience options and count
    expect(screen.getByText("تحديد شريحة الجمهور المستهدفة")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });
  });

  it("switches audience target when clicked", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      if (url.includes("/preview-audience")) {
        return Promise.resolve({ data: { count: 350 } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <CustomerWhatsAppNotify mode="general" />
      </MemoryRouter>,
    );

    // Click 'newCustomers' audience option
    const newCustomersButton = screen.getByText("العملاء الجدد");
    fireEvent.click(newCustomersButton);

    await waitFor(() => {
      expect(screen.getByText("انضموا خلال آخر:")).toBeInTheDocument();
    });
  });

  it("updates message textarea and reflects into live chat preview", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      if (url.includes("/preview-audience")) {
        return Promise.resolve({ data: { count: 500 } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <CustomerWhatsAppNotify mode="general" />
      </MemoryRouter>,
    );

    const textarea = screen.getByPlaceholderText(/اكتب نص رسالة الواتساب هنا/i);
    fireEvent.change(textarea, { target: { value: "مرحباً يا {customerName}، خصم خاص!" } });

    expect(textarea).toHaveValue("مرحباً يا {customerName}، خصم خاص!");

    // In live chat preview, {customerName} is replaced with sample name 'محمد أحمد'
    expect(screen.getByText("مرحباً يا محمد أحمد، خصم خاص!")).toBeInTheDocument();
  });

  it("triggers handleSend and displays campaign progress", async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/sessions")) {
        return Promise.resolve({ data: { sessions: mockSessions } });
      }
      if (url.includes("/preview-audience")) {
        return Promise.resolve({ data: { count: 100 } });
      }
      return Promise.resolve({ data: {} });
    });

    (apiClient.post as any).mockResolvedValue({
      data: { success: true, campaignId: "camp-999", total: 100 },
    });

    render(
      <MemoryRouter>
        <CustomerWhatsAppNotify mode="general" />
      </MemoryRouter>,
    );

    // Type message
    const textarea = screen.getByPlaceholderText(/اكتب نص رسالة الواتساب هنا/i);
    fireEvent.change(textarea, { target: { value: "رسالة تجريبية للحملة" } });

    // Wait for session to load so button is enabled
    await waitFor(() => {
      expect(screen.getByText("201012345678")).toBeInTheDocument();
    });

    // Click Send
    const sendButton = screen.getByRole("button", { name: /بدء إرسال الحملة الآن/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/customers/whatsapp-notify/smart-send",
        expect.objectContaining({
          audience: "withOrders",
          message: "رسالة تجريبية للحملة",
          sessionId: "sess-123",
        }),
      );
      expect(screen.getByText("حملة الإرسال قيد التشغيل")).toBeInTheDocument();
    });
  });
});
