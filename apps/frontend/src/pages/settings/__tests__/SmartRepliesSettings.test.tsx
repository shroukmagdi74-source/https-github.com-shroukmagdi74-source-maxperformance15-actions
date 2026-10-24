/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SmartRepliesSettings from "../SmartRepliesSettings";
import { apiClient } from "../../../services/apiClient";
import { toast } from "sonner";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockT = (key: string) => key;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockData = {
  enableRuleResponses: true,
  channels: ["WHATSAPP", "FACEBOOK", "INSTAGRAM"],
  customRuleResponses: {
    templates: [
      {
        id: "tpl-1",
        name: "رسالة الترحيب",
        type: "greeting",
        channels: ["WHATSAPP", "FACEBOOK"],
        keywords: ["مرحبا", "السلام عليكم"],
        responses: ["أهلاً بك في متجرنا! كيف يمكننا مساعدتك اليوم؟"],
        isDefault: false,
      },
    ],
  },
};

describe("SmartRepliesSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mockData,
      },
    });
    (apiClient.put as any).mockResolvedValue({
      data: {
        success: true,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, toggle card, and templates list after loading", async () => {
    render(<SmartRepliesSettings />);

    await waitFor(() => {
      expect(screen.getByText("smartReplies.pageTitle")).toBeTruthy();
    });

    expect(screen.getAllByText("smartReplies.enableTitle").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("smartReplies.templates")).toBeTruthy();
    expect(screen.getByText("رسالة الترحيب")).toBeTruthy();
  });

  it("handles toggling the main smart replies switch", async () => {
    render(<SmartRepliesSettings />);

    await waitFor(() => {
      expect(screen.getByText("رسالة الترحيب")).toBeTruthy();
    });

    const toggleBtn = screen.getByRole("switch");
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/smart-replies/rule-responses",
        expect.objectContaining({
          enableRuleResponses: false,
        })
      );
    });
  });

  it("handles toggling a global channel pill", async () => {
    render(<SmartRepliesSettings />);

    await waitFor(() => {
      expect(screen.getAllByText("واتساب").length).toBeGreaterThanOrEqual(1);
    });

    // Click on Telegram Bot pill to activate it
    const telegramBotBtns = screen.getAllByText("تلجرام بوت");
    fireEvent.click(telegramBotBtns[0]);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/smart-replies/rule-responses",
        expect.objectContaining({
          channels: expect.arrayContaining(["TELEGRAM_BOT"]),
        })
      );
    });
  });

  it("opens edit mode when clicking on a template edit button", async () => {
    render(<SmartRepliesSettings />);

    await waitFor(() => {
      expect(screen.getByText("رسالة الترحيب")).toBeTruthy();
    });

    const editButtons = screen.getAllByText("smartReplies.edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByText("smartReplies.editTemplate")).toBeTruthy();
    expect(screen.getByText("smartReplies.saveChanges")).toBeTruthy();
  });

  it("handles adding a new template and canceling", async () => {
    render(<SmartRepliesSettings />);

    await waitFor(() => {
      expect(screen.getByText("smartReplies.addRule")).toBeTruthy();
    });

    const addRuleBtn = screen.getByText("smartReplies.addRule");
    fireEvent.click(addRuleBtn);

    expect(screen.getByText("إضافة قالب رد تلقائي جديد")).toBeTruthy();

    const cancelBtn = screen.getByText("smartReplies.cancel");
    fireEvent.click(cancelBtn);

    expect(screen.queryByText("إضافة قالب رد تلقائي جديد")).toBeNull();
  });
});
