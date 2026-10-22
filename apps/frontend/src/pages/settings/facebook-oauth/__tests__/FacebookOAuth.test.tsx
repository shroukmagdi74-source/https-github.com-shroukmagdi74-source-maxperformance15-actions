/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import FacebookOAuth from "../../FacebookOAuth";

// Mock auth hook
const mockUser = {
  id: "user-test-1",
  companyId: "comp-test-1",
  role: "COMPANY_ADMIN",
  name: "Mokhtar Test",
};

let mockIsAuthenticated = true;

vi.mock("../../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

// Mock token manager
vi.mock("../../../../utils/tokenManager", () => ({
  default: {
    createAuthHeaders: () => ({ Authorization: "Bearer test-token" }),
  },
}));

// Mock page sync
vi.mock("../../../../utils/facebookPageSync", () => ({
  emitFacebookPageSync: vi.fn(),
  subscribeToFacebookPageSync: vi.fn(() => () => {}),
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

const mockStatusConnected = {
  success: true,
  connected: true,
  pagesCount: 2,
  connectedPagesCount: 2,
  disconnectedPagesCount: 0,
  facebookUser: {
    id: "fb-user-1",
    name: "MaxP Fashion",
    picture: "https://example.com/pic.png",
  },
  accounts: [
    {
      id: "acc-1",
      facebookUserId: "fb-user-1",
      name: "MaxP Main Account",
      email: "fashion@maxp.online",
      status: "ACTIVE",
      pagesCount: 2,
      connectedPagesCount: 2,
    },
  ],
  pages: [
    {
      id: "page-rec-1",
      pageId: "100200300",
      pageName: "MaxP Fashion Store",
      status: "connected",
      connectedAt: "2026-03-01T12:00:00Z",
      lastActivity: "2026-03-05T12:00:00Z",
      needsReconnect: false,
      canReconnect: true,
      account: {
        id: "acc-1",
        facebookUserId: "fb-user-1",
        name: "MaxP Main Account",
        email: "fashion@maxp.online",
        status: "ACTIVE",
      },
    },
    {
      id: "page-rec-2",
      pageId: "100200301",
      pageName: "MaxP Outlet",
      status: "connected",
      connectedAt: "2026-03-02T12:00:00Z",
      lastActivity: "2026-03-05T12:00:00Z",
      needsReconnect: false,
      canReconnect: true,
      account: {
        id: "acc-1",
        facebookUserId: "fb-user-1",
        name: "MaxP Main Account",
        email: "fashion@maxp.online",
        status: "ACTIVE",
      },
    },
  ],
};

const mockStatusEmpty = {
  success: true,
  connected: false,
  pagesCount: 0,
  connectedPagesCount: 0,
  disconnectedPagesCount: 0,
  pages: [],
};

describe("FacebookOAuth (Batch 422)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    mockIsAuthenticated = true;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it("renders unauthenticated message when user is not logged in", () => {
    mockIsAuthenticated = false;
    render(<FacebookOAuth />);
    expect(screen.getByText("يجب تسجيل الدخول أولاً")).toBeInTheDocument();
  });

  it("renders connected pages list and KPIs when pages are returned", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/facebook-oauth/status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusConnected),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, skippedPages: [] }),
      });
    }) as any;

    render(<FacebookOAuth />);

    // Wait for pages to load
    await waitFor(() => {
      expect(screen.getByText("MaxP Fashion Store")).toBeInTheDocument();
      expect(screen.getByText("MaxP Outlet")).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getByText("MaxP Fashion")).toBeInTheDocument();
    expect(screen.getByText("(100200300)")).toBeInTheDocument();
    expect(screen.getByText("(100200301)")).toBeInTheDocument();
  });

  it("renders connect card when no pages are connected", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/facebook-oauth/status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusEmpty),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, skippedPages: [] }),
      });
    }) as any;

    render(<FacebookOAuth />);

    await waitFor(() => {
      const connectButtons = screen.getAllByRole("button", { name: /ربط مع/i });
      expect(connectButtons.length).toBeGreaterThan(0);
    });
  });

  it("toggles page selection and select all properly", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/facebook-oauth/status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusConnected),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, skippedPages: [] }),
      });
    }) as any;

    render(<FacebookOAuth />);

    await waitFor(() => {
      expect(screen.getByText("MaxP Fashion Store")).toBeInTheDocument();
    });

    // Check checkboxes
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(3); // 1 for select all + 2 for pages

    // Click select all
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText("(2 / 2)")).toBeInTheDocument();

    // Deselect all
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText("(0 / 2)")).toBeInTheDocument();
  });
});
