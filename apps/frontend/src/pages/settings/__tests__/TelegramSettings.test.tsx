/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TelegramSettings from "../TelegramSettings";
import { telegramService } from "../../../services/telegramService";
import { apiClient } from "../../../services/apiClient";

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      id: "u-1",
      companyId: "company-123",
      email: "test@maxp.online",
    },
    isAuthenticated: true,
  }),
}));

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    derivedTheme: "light",
  }),
}));

vi.mock("../../../services/telegramService", () => ({
  telegramService: {
    getStatus: vi.fn(),
    connectBot: vi.fn(),
    disconnectBot: vi.fn(),
  },
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBots = [
  {
    id: "bot-1",
    label: "Sales Notification Bot",
    username: "maxp_sales_bot",
    running: true,
  },
];

const mockUserbots = [
  {
    id: "ub-1",
    label: "Support Agent Account",
    apiId: "12345678",
    clientPhone: "+201001234567",
    sessionString: "mock_session_string",
    inboxEnabled: false,
  },
];

describe("TelegramSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (telegramService.getStatus as any).mockResolvedValue({
      bots: [...mockBots],
    });
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === "/telegram/userbots") {
        return Promise.resolve({
          data: {
            data: [...mockUserbots],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    (telegramService.connectBot as any).mockResolvedValue({ success: true });
    (telegramService.disconnectBot as any).mockResolvedValue({ success: true });
    (apiClient.put as any).mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header and bots tab with connected bots", async () => {
    render(<TelegramSettings />);

    await waitFor(() => {
      expect(screen.getByText("Telegram Integration")).toBeTruthy();
    });

    expect(screen.getByText("Telegram Bots")).toBeTruthy();
    expect(screen.getByText("Telegram Userbots")).toBeTruthy();
    expect(screen.getByText("Sales Notification Bot")).toBeTruthy();
    expect(screen.getByText("@maxp_sales_bot")).toBeTruthy();
    expect(screen.getByText("Running")).toBeTruthy();
  });

  it("opens add bot modal and allows connecting a bot", async () => {
    render(<TelegramSettings />);

    await waitFor(() => {
      expect(screen.getByText("Sales Notification Bot")).toBeTruthy();
    });

    const addBotBtn = screen.getByRole("button", { name: /\+ Add New Bot/i });
    fireEvent.click(addBotBtn);

    expect(screen.getByText("Connect New Bot")).toBeTruthy();

    const labelInput = screen.getByPlaceholderText("e.g. Sales Bot, Support Team");
    const tokenInput = screen.getByPlaceholderText("123456789:ABCdefGHIjklMNOpqrsTUVwxyz");

    fireEvent.change(labelInput, { target: { value: "Marketing Bot" } });
    fireEvent.change(tokenInput, { target: { value: "987654:TEST_TOKEN" } });

    const connectBtn = screen.getByRole("button", { name: "Connect Bot" });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(telegramService.connectBot).toHaveBeenCalledWith(
        "company-123",
        "987654:TEST_TOKEN",
        "Marketing Bot"
      );
    });
  });

  it("switches to userbots tab and displays connected userbot", async () => {
    render(<TelegramSettings />);

    await waitFor(() => {
      expect(screen.getByText("Telegram Bots")).toBeTruthy();
    });

    const userbotsTabBtn = screen.getByRole("button", { name: /Telegram Userbots/i });
    fireEvent.click(userbotsTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Support Agent Account")).toBeTruthy();
    });

    expect(screen.getByText(/API ID: \*\*\*5678/)).toBeTruthy();
    expect(screen.getByText("Connected")).toBeTruthy();
  });

  it("toggles userbot inbox integration on click", async () => {
    render(<TelegramSettings />);

    await waitFor(() => {
      expect(screen.getByText("Telegram Bots")).toBeTruthy();
    });

    const userbotsTabBtn = screen.getByRole("button", { name: /Telegram Userbots/i });
    fireEvent.click(userbotsTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Support Agent Account")).toBeTruthy();
    });

    const inboxToggleBtn = screen.getByRole("button", { name: "Inbox OFF" });
    fireEvent.click(inboxToggleBtn);

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith("/telegram/userbots/ub-1/inbox", {
        enabled: true,
      });
    });
  });

  it("opens add userbot wizard on button click", async () => {
    render(<TelegramSettings />);

    await waitFor(() => {
      expect(screen.getByText("Telegram Bots")).toBeTruthy();
    });

    const userbotsTabBtn = screen.getByRole("button", { name: /Telegram Userbots/i });
    fireEvent.click(userbotsTabBtn);

    const addUserbotBtn = screen.getByRole("button", { name: /\+ Add New Userbot/i });
    fireEvent.click(addUserbotBtn);

    expect(screen.getByText("Add New Userbot")).toBeTruthy();
    expect(screen.getByText("Next & Send Code")).toBeTruthy();
  });
});
