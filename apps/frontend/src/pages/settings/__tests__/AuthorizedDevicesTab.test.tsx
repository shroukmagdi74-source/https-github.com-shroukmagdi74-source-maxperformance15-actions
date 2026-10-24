/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizedDevicesTab } from "../AuthorizedDevicesTab";
import { apiClient } from "../../../services/apiClient";
import toast from "sonner";

if (typeof window !== "undefined" && !window.PointerEvent) {
  (window as any).PointerEvent = class PointerEvent extends MouseEvent {};
}

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => {
  const toastMock = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
  return {
    __esModule: true,
    default: toastMock,
    toast: toastMock,
  };
});

const mockDevices = [
  {
    id: "dev-1",
    companyId: "comp-1",
    userId: "user-1",
    fingerprint: "fp-office-1234567890",
    deviceName: "Desk-PC-01",
    deviceType: "OFFICE" as const,
    clientType: "DESKTOP" as const,
    osVersion: "Windows 11",
    appVersion: "1.0.8",
    ipAddress: "192.168.1.10",
    isApproved: true,
    lastActiveAt: "2026-10-24T12:00:00Z",
    createdAt: "2026-10-01T10:00:00Z",
    user: {
      id: "user-1",
      firstName: "أحمد",
      lastName: "علي",
      email: "ahmed@example.com",
      role: "MANAGER",
    },
  },
  {
    id: "dev-2",
    companyId: "comp-1",
    userId: "user-2",
    fingerprint: "fp-personal-9876543210",
    deviceName: "iPhone-Mokhtar",
    deviceType: "PERSONAL" as const,
    clientType: "MOBILE" as const,
    osVersion: "iOS 18.1",
    appVersion: null,
    ipAddress: "10.0.0.5",
    isApproved: false,
    lastActiveAt: "2026-10-24T14:30:00Z",
    createdAt: "2026-10-15T09:00:00Z",
    user: {
      id: "user-2",
      firstName: "سارة",
      lastName: "محمد",
      email: "sara@example.com",
      role: "AGENT",
    },
  },
];

describe("AuthorizedDevicesTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockResolvedValue({
      data: {
        success: true,
        data: [...mockDevices],
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders header, policy banner, and device rows correctly", async () => {
    render(<AuthorizedDevicesTab />);

    expect(
      screen.getByText("إدارة أجهزة الموظفين وتحديد نوعها")
    ).toBeTruthy();
    expect(screen.getByText("جهاز مكتب (OFFICE)")).toBeTruthy();
    expect(screen.getByText("جهاز شخصي (PERSONAL)")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Desk-PC-01")).toBeTruthy();
      expect(screen.getByText("iPhone-Mokhtar")).toBeTruthy();
      expect(screen.getByText("أحمد علي")).toBeTruthy();
      expect(screen.getByText("سارة محمد")).toBeTruthy();
    });
  });

  it("allows switching filter tabs between all, office, and personal", async () => {
    render(<AuthorizedDevicesTab />);

    await waitFor(() => {
      expect(screen.getByText("Desk-PC-01")).toBeTruthy();
    });

    const officeFilter = screen.getByText("أجهزة المكتب");
    fireEvent.click(officeFilter);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/v1/devices", {
        params: { deviceType: "OFFICE" },
      });
    });
  });

  it("toggles device type between office and personal", async () => {
    (apiClient.patch as any).mockResolvedValue({
      data: { success: true },
    });

    render(<AuthorizedDevicesTab />);

    await waitFor(() => {
      expect(screen.getByText("Desk-PC-01")).toBeTruthy();
    });

    const officeBtn = screen.getByRole("button", { name: "مكتب" });
    fireEvent.click(officeBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith("/v1/devices/dev-1/type", {
        deviceType: "PERSONAL",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "تم تحويل الجهاز (Desk-PC-01) إلى جهاز شخصي مقيّد"
      );
    });
  });

  it("toggles device approval switch", async () => {
    (apiClient.patch as any).mockResolvedValue({
      data: { success: true },
    });

    render(<AuthorizedDevicesTab />);

    await waitFor(() => {
      expect(screen.getByText("Desk-PC-01")).toBeTruthy();
    });

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[0]);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith("/v1/devices/dev-1/type", {
        isApproved: false,
      });
      expect(toast.success).toHaveBeenCalledWith("تم حظر الجهاز فورياً");
    });
  });

  it("deletes a device when confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    (apiClient.delete as any).mockResolvedValue({
      data: { success: true },
    });

    render(<AuthorizedDevicesTab />);

    await waitFor(() => {
      expect(screen.getByText("Desk-PC-01")).toBeTruthy();
    });

    const deleteButtons = screen.getAllByTitle("حذف الجهاز");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith("/v1/devices/dev-1");
      expect(toast.success).toHaveBeenCalledWith(
        "تم حذف الجهاز من السجل بنجاح"
      );
      expect(screen.queryByText("Desk-PC-01")).toBeNull();
    });
  });
});
