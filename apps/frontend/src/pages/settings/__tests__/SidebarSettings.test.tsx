/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SidebarSettings from "../SidebarSettings";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("../../../utils/tokenManager", () => ({
  default: {
    createAuthHeaders: (headers: Record<string, string> = {}) => ({
      Authorization: "Bearer mock_token",
      ...headers,
    }),
  },
}));

const mockUpdateSettings = vi.fn().mockResolvedValue(true);
const mockRefreshSettings = vi.fn();
const mockSetUserLayout = vi.fn();

const mockT = (key: string, opts?: any) => {
  if (opts?.visible !== undefined && opts?.total !== undefined) {
    return `${opts.visible} of ${opts.total} visible`;
  }
  if (opts?.count !== undefined) {
    return `${opts.count} items`;
  }
  return key;
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

const mockUser = {
  id: "user-1",
  role: "COMPANY_ADMIN",
  activeApps: ["orders", "products"],
};

vi.mock("../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

const mockSettings = {
  sections: {
    orders: {
      visible: true,
      order: 0,
      requiredRoles: ["COMPANY_ADMIN"],
      requiredApps: ["orders"],
      items: {
        orders_list: {
          visible: true,
          enabled: true,
          order: 0,
          requiredRoles: ["COMPANY_ADMIN"],
          requiredApps: ["orders"],
          label: "All Orders",
        },
      },
    },
    products: {
      visible: true,
      order: 1,
      requiredRoles: [],
      requiredApps: ["products"],
      items: {
        products_list: {
          visible: false,
          enabled: true,
          order: 0,
          requiredRoles: [],
          requiredApps: ["products"],
          label: "All Products",
        },
      },
    },
  },
};

vi.mock("../../../contexts/SidebarSettingsContext", () => ({
  useSidebarSettings: () => ({
    settings: mockSettings,
    isLoading: false,
    updateSettings: mockUpdateSettings,
    refreshSettings: mockRefreshSettings,
    userLayout: null,
    setUserLayout: mockSetUserLayout,
  }),
}));

vi.mock("../../../config/sidebar", () => ({
  getSidebarConfig: () => [
    {
      id: "orders",
      title: "Orders Section",
      hidden: false,
      items: [
        {
          itemId: "orders_list",
          label: "All Orders",
          to: "/orders",
          hidden: false,
        },
      ],
    },
    {
      id: "products",
      title: "Products Section",
      hidden: false,
      items: [
        {
          itemId: "products_list",
          label: "All Products",
          to: "/products",
          hidden: false,
        },
      ],
    },
  ],
}));

describe("SidebarSettings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, layout picker, and smart info card", () => {
    render(<SidebarSettings />);

    expect(screen.getByText("sidebar.sidebarTitle")).toBeTruthy();
    expect(screen.getByText("sidebar.sidebarLayout")).toBeTruthy();
    expect(screen.getByText("sidebar.sidebarSmartTitle")).toBeTruthy();
    expect(screen.getByText("sidebar.sidebarRefresh")).toBeTruthy();
  });

  it("allows selecting a layout from layout picker", () => {
    render(<SidebarSettings />);

    const classicBtn = screen.getByText("sidebar.sidebarLayoutClassic");
    expect(classicBtn).toBeTruthy();
    fireEvent.click(classicBtn);

    expect(mockSetUserLayout).toHaveBeenCalledWith("classic");
  });

  it("handles refresh button click", () => {
    render(<SidebarSettings />);

    const refreshBtn = screen.getByText("sidebar.sidebarRefresh");
    fireEvent.click(refreshBtn);

    expect(mockRefreshSettings).toHaveBeenCalled();
  });

  it("switches to flat view mode", () => {
    render(<SidebarSettings />);

    const flatViewBtn = screen.getByText("sidebar.sidebarViewFlat");
    fireEvent.click(flatViewBtn);

    expect(screen.getByText("Orders Section")).toBeTruthy();
    expect(screen.getByText("Products Section")).toBeTruthy();
  });

  it("filters search results when typing in search input", async () => {
    render(<SidebarSettings />);

    const searchInput = screen.getByPlaceholderText("sidebar.sidebarSearchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "All Orders" } });

    await waitFor(() => {
      expect(screen.getByText("All Orders")).toBeTruthy();
    });
  });
});
