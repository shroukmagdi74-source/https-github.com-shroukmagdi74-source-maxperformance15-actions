// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import HRApiIntegrations from "../hr/HRApiIntegrations";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockKeys = [
  {
    id: "key-1",
    name: "بصمة الفرع الرئيسي",
    keyPrefix: "hrk_live_98a",
    scopes: "*",
    isActive: true,
    createdAt: "2026-10-01T10:00:00Z",
    lastUsedAt: "2026-10-20T14:00:00Z",
  },
];

const mockWebhooks = [
  {
    id: "hook-1",
    name: "n8n HR Sync",
    targetUrl: "https://hooks.example.com/hr",
    subscribedEvents: "*",
    isActive: true,
  },
];

describe("HRApiIntegrations (Batch 516)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === "/hr/external-api/keys") {
        return Promise.resolve({ data: { success: true, data: mockKeys } });
      }
      if (url === "/hr/external-api/webhooks") {
        return Promise.resolve({ data: { success: true, data: mockWebhooks } });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, tabs, and API keys list", async () => {
    render(<HRApiIntegrations />);

    expect(
      await screen.findByText(/الربط الخارجي وأدوات الذكاء الاصطناعي/i)
    ).toBeDefined();
    expect(await screen.findByText("بصمة الفرع الرئيسي")).toBeDefined();
    expect(screen.getByText("hrk_live_98a****")).toBeDefined();
    expect(screen.getByText("نشط")).toBeDefined();
  });

  it("switches to webhooks tab and submits a new webhook", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { success: true },
    });

    render(<HRApiIntegrations />);
    await screen.findByText("بصمة الفرع الرئيسي");

    fireEvent.click(screen.getByText("الـ Webhooks والأحداث اللحظية"));

    expect(await screen.findByText("n8n HR Sync")).toBeDefined();
    expect(screen.getByText("https://hooks.example.com/hr")).toBeDefined();

    fireEvent.change(
      screen.getByPlaceholderText("اسم النظام (مثال: n8n HR Automation)"),
      { target: { value: "ERP Connector" } }
    );
    fireEvent.change(screen.getByPlaceholderText("رابط الـ Webhook (https://...)"), {
      target: { value: "https://erp.example.com/webhook" },
    });

    fireEvent.click(screen.getByText("حفظ الرابط"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/hr/external-api/webhooks", {
        name: "ERP Connector",
        targetUrl: "https://erp.example.com/webhook",
        subscribedEvents: ["*"],
      });
    });
  });

  it("switches to docs tab and displays OpenAPI 3.1 endpoints", async () => {
    render(<HRApiIntegrations />);
    await screen.findByText("بصمة الفرع الرئيسي");

    fireEvent.click(screen.getByText("توثيق الذكاء الاصطناعي (OpenAPI)"));

    expect(
      await screen.findByText("مواصفات الـ API الموحدة للذكاء الاصطناعي (OpenAPI 3.1)")
    ).toBeDefined();
    expect(
      screen.getByText("https://api.maxp.online/api/v1/external/hr")
    ).toBeDefined();
    expect(screen.getByText("Swagger التفاعلي")).toBeDefined();
  });

  it("opens create key modal, creates a key, and displays the raw key", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: { rawKey: "hrk_secret_full_raw_key_999" },
      },
    });

    render(<HRApiIntegrations />);
    await screen.findByText("بصمة الفرع الرئيسي");

    fireEvent.click(screen.getByText("إنشاء مفتاح جديد"));

    expect(await screen.findByText("إنشاء مفتاح API جديد")).toBeDefined();

    fireEvent.change(screen.getByPlaceholderText("اسم تعريفي واضح"), {
      target: { value: "AI Agent Key" },
    });

    fireEvent.click(screen.getByText("توليد المفتاح"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/hr/external-api/keys", {
        name: "AI Agent Key",
        scopes: ["*"],
      });
    });

    expect(await screen.findByText("hrk_secret_full_raw_key_999")).toBeDefined();
  });
});
