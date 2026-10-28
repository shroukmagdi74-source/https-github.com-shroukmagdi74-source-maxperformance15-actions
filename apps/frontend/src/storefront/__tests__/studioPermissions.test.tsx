// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock i18n and toast before component imports
vi.mock("../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../../i18n", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "ar",
  },
}));

vi.mock("@/i18n", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "ar",
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../store/useCartStore", () => {
  const mockCartState = { items: [], isOpen: false };
  const fn: any = vi.fn((selector) =>
    selector ? selector(mockCartState) : mockCartState
  );
  fn.getState = vi.fn(() => mockCartState);
  fn.setState = vi.fn();
  return {
    useCartStore: fn,
    DEFAULT_STOREFRONT_CART_STORAGE_NAME: "test-cart",
    getStorefrontPreviewCartStorageName: () => "test-cart",
    buildCartItemId: (identity: { productId?: string; variantId?: string | null }) =>
      `test-${identity?.productId || "p"}-${identity?.variantId || "v"}`,
  };
});

let mockCurrentUser: any = { id: "user_owner_1", role: "OWNER", name: "المالك التجاري" };

vi.mock("../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: mockCurrentUser,
  }),
}));

vi.mock("../analytics/beacon", () => ({
  trackStudioOpen: vi.fn(),
  trackStudioPublish: vi.fn(),
  trackStudioTemplateApply: vi.fn(),
  trackStudioAiOpen: vi.fn(),
  trackStudioError: vi.fn(),
  sendAnalyticsEvent: vi.fn(),
  setStorefrontCompanySlug: vi.fn(),
  setStorefrontCompanyId: vi.fn(),
}));

import {
  resolveStudioAccess,
  recordStudioHeartbeat,
  getActiveStudioEditors,
  clearStudioHeartbeat,
  STUDIO_HEARTBEAT_STORAGE_KEY,
  checkOptimisticConcurrency,
  computeTokensDiff,
} from "../studio/utils/studioPermissions";
import { StorefrontStudioShell } from "../studio/StorefrontStudioShell";
import { StudioTopBar } from "../studio/StudioTopBar";
import { StudioConflictPanel } from "../studio/StudioConflictPanel";
import { StudioViewerBanner } from "../studio/StudioViewerBanner";
import { toast } from "sonner";
import { DEFAULT_STOREFRONT_THEME_ID } from "../themes";

describe("Ticket PERM-1: Studio Permissions & Optimistic Concurrency Lock (#46)", () => {
  const baseDesignTokens = {
    themeId: DEFAULT_STOREFRONT_THEME_ID,
    pages: {
      home: {
        title: "الرئيسية",
        sections: [
          { type: "hero", title: "مرحباً بكم في متجرنا" },
          { type: "grid", title: "المنتجات المميزة" },
        ],
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockCurrentUser = { id: "user_owner_1", role: "OWNER", name: "المالك التجاري" };
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  // =========================================================================
  // 1. Pure Helper Tests: resolveStudioAccess
  // =========================================================================

  describe("1. resolveStudioAccess (Pure Access Resolution)", () => {
    it("1.1 Owner role grants full access (canEdit=true, canPublish=true)", () => {
      const access = resolveStudioAccess({
        id: "usr_1",
        role: "OWNER",
        name: "مالك المتجر",
      });
      expect(access.canEdit).toBe(true);
      expect(access.canPublish).toBe(true);
      expect(access.reason).toBe("owner_full_access");
    });

    it("1.2 Manager and Admin roles grant full access (canEdit=true, canPublish=true)", () => {
      const managerAccess = resolveStudioAccess({
        id: "usr_2",
        role: "MANAGER",
        name: "مدير المتجر",
      });
      expect(managerAccess.canEdit).toBe(true);
      expect(managerAccess.canPublish).toBe(true);

      const adminAccess = resolveStudioAccess({
        id: "usr_3",
        role: "COMPANY_ADMIN",
        name: "أدمن الشركة",
      });
      expect(adminAccess.canEdit).toBe(true);
      expect(adminAccess.canPublish).toBe(true);
    });

    it("1.3 Employee with 'storefront.edit' has edit permission but cannot publish (canEdit=true, canPublish=false)", () => {
      const access = resolveStudioAccess({
        id: "usr_emp_1",
        role: "EMPLOYEE",
        permissions: ["storefront.edit"],
        name: "مصمم المتجر",
      });
      expect(access.canEdit).toBe(true);
      expect(access.canPublish).toBe(false);
      expect(access.reason).toBe("employee_edit_only");
    });

    it("1.4 Employee with both 'storefront.edit' and 'storefront.publish' can edit and publish", () => {
      const access = resolveStudioAccess({
        id: "usr_emp_2",
        role: "EMPLOYEE",
        permissions: ["storefront.edit", "storefront.publish"],
      });
      expect(access.canEdit).toBe(true);
      expect(access.canPublish).toBe(true);
      expect(access.reason).toBe("employee_edit_and_publish");
    });

    it("1.5 Employee without 'storefront.edit' permission is viewer (canEdit=false, canPublish=false)", () => {
      const access = resolveStudioAccess({
        id: "usr_emp_3",
        role: "EMPLOYEE",
        permissions: ["orders.view", "customers.view"],
      });
      expect(access.canEdit).toBe(false);
      expect(access.canPublish).toBe(false);
      expect(access.reason).toBe("viewer_no_permission");
    });

    it("1.6 Anonymous or null user is viewer (canEdit=false, canPublish=false)", () => {
      const access = resolveStudioAccess(null);
      expect(access.canEdit).toBe(false);
      expect(access.canPublish).toBe(false);
      expect(access.reason).toBe("anonymous_viewer");
    });

    it("1.7 Company-level OWNER role grants full access even if user role is unassigned", () => {
      const access = resolveStudioAccess(
        { id: "usr_generic" },
        { id: "comp_1", role: "OWNER" }
      );
      expect(access.canEdit).toBe(true);
      expect(access.canPublish).toBe(true);
    });
  });

  // =========================================================================
  // 2. Viewer Mode UI & DOM Assertions
  // =========================================================================

  describe("2. Viewer Mode UI & TopBar Guards", () => {
    it("2.1 Viewer mode renders viewer banner with text and permission request button", () => {
      render(
        <StudioViewerBanner
          reason="صلاحية storefront.edit غير مفعّلة"
          onRequestPermission={() => toast.info("طلب الصلاحية")}
        />
      );

      const banner = screen.getByTestId("studio-viewer-banner");
      expect(banner).toBeDefined();
      expect(banner.textContent).toContain("أنت في وضع المشاهدة");

      const reqBtn = screen.getByTestId("studio-request-permission-btn");
      expect(reqBtn).toBeDefined();
      expect(reqBtn.textContent).toContain("طلب صلاحية");

      fireEvent.click(reqBtn);
      expect(toast.info).toHaveBeenCalledWith("طلب الصلاحية");
    });

    it("2.2 StudioTopBar in viewer mode disables both Save and Publish buttons", () => {
      render(
        <StudioTopBar
          themeName=" مودرن"
          activePageKey="home"
          deviceMode="desktop"
          hasPendingChanges={true}
          canUndo={true}
          canRedo={true}
          saving={false}
          onBack={vi.fn()}
          onPageChange={vi.fn()}
          onDeviceChange={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          onSave={vi.fn()}
          onPublish={vi.fn()}
          onOpenPreview={vi.fn()}
          canEdit={false}
          canPublish={false}
        />
      );

      const publishBtn = screen.getByTestId("studio-publish-button");
      expect(publishBtn.hasAttribute("disabled")).toBe(true);

      const saveBtn = screen.getByTestId("studio-save-button");
      expect(saveBtn.hasAttribute("disabled")).toBe(true);
    });

    it("2.3 StorefrontStudioShell renders viewer banner when rendered with a viewer user", () => {
      render(
        <StorefrontStudioShell
          themeId={DEFAULT_STOREFRONT_THEME_ID}
          designTokens={baseDesignTokens}
          storeName="متجري"
          hasPendingChanges={false}
          saving={false}
          onSave={vi.fn()}
          onChange={vi.fn()}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          user={{ id: "viewer_1", role: "EMPLOYEE", permissions: [] }}
        />
      );

      const viewerBanner = screen.getByTestId("studio-viewer-banner");
      expect(viewerBanner).toBeDefined();
      expect(viewerBanner.textContent).toContain("أنت في وضع المشاهدة");

      const publishBtn = screen.getByTestId("studio-publish-button");
      expect(publishBtn.hasAttribute("disabled")).toBe(true);
    });
  });

  // =========================================================================
  // 3. Optimistic Concurrency Lock: 409 Conflict & Zero Write to State
  // =========================================================================

  describe("3. Optimistic Concurrency Lock (baseRevision & 409 Conflict)", () => {
    it("3.1 checkOptimisticConcurrency flags conflict when server revision is ahead", () => {
      const conflictResult = checkOptimisticConcurrency(2, 3);
      expect(conflictResult.conflict).toBe(true);
      expect(conflictResult.reason).toContain("Revision mismatch");

      const okResult = checkOptimisticConcurrency(3, 3);
      expect(okResult.conflict).toBe(false);
    });

    it("3.2 Saving with stale baseRevision (409) displays conflict panel and makes ZERO writes to state", async () => {
      const mockOnChange = vi.fn();
      const mockOnSave = vi.fn().mockRejectedValue({
        status: 409,
        response: { status: 409, data: { serverRevision: 5 } },
      });

      render(
        <StorefrontStudioShell
          themeId={DEFAULT_STOREFRONT_THEME_ID}
          designTokens={baseDesignTokens}
          storeName="متجري"
          hasPendingChanges={true}
          saving={false}
          baseRevision={4}
          onSave={mockOnSave}
          onChange={mockOnChange}
          onBack={vi.fn()}
          onOpenPreview={vi.fn()}
          canEdit={true}
          canPublish={true}
        />
      );

      // Attempt to save draft
      const saveBtn = screen.getByTestId("studio-save-button");
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ baseRevision: 4 });
      });

      // Conflict panel must be visible
      const conflictPanel = await screen.findByTestId("studio-conflict-panel");
      expect(conflictPanel).toBeDefined();
      expect(conflictPanel.textContent).toContain("حد تاني عدّل");

      // ZERO writes to state!
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("3.3 Conflict panel 'اعرض الفرق' expands diff view and 'حدّث نسختك' calls onReload", async () => {
      const handleReload = vi.fn();
      const handleClose = vi.fn();

      const serverTokens = {
        themeId: "khemet-fashion-eg",
        pages: {
          home: { title: "الرئيسية المحدثة" },
          about: { title: "من نحن" },
        },
      };

      render(
        <StudioConflictPanel
          isOpen={true}
          baseRevision={3}
          serverRevision={4}
          localTokens={baseDesignTokens}
          serverTokens={serverTokens}
          onClose={handleClose}
          onReload={handleReload}
        />
      );

      const diffBtn = screen.getByTestId("studio-conflict-diff-btn");
      expect(diffBtn).toBeDefined();

      // Click "اعرض الفرق"
      fireEvent.click(diffBtn);
      const diffView = screen.getByTestId("studio-conflict-diff-view");
      expect(diffView).toBeDefined();
      expect(diffView.textContent).toContain("تغير القالب");

      // Click "حدّث نسختك"
      const reloadBtn = screen.getByTestId("studio-conflict-reload-btn");
      fireEvent.click(reloadBtn);
      expect(handleReload).toHaveBeenCalledTimes(1);
    });

    it("3.4 computeTokensDiff correctly aggregates theme and page differences", () => {
      const local = { themeId: "theme-a", pages: { home: { v: 1 } } };
      const server = { themeId: "theme-b", pages: { home: { v: 2 }, contact: {} } };

      const diff = computeTokensDiff(local, server);
      expect(diff.hasChanges).toBe(true);
      expect(diff.themeChanged).toBe(true);
      expect(diff.changedPages).toContain("home");
      expect(diff.changedPages).toContain("contact");
    });
  });

  // =========================================================================
  // 4. Heartbeat Active Editors Indicator (sessionStorage)
  // =========================================================================

  describe("4. Heartbeat: Active Editors Indicator", () => {
    it("4.1 Two sessions on the same page register in sessionStorage and both editor names appear", () => {
      // Session 1: أحمد
      recordStudioHeartbeat(
        "home",
        { id: "u1", name: "أحمد علي" },
        "session_tab_1",
        sessionStorage
      );

      // Session 2: سارة
      recordStudioHeartbeat(
        "home",
        { id: "u2", name: "سارة محمد" },
        "session_tab_2",
        sessionStorage
      );

      const activeEditors = getActiveStudioEditors("home", sessionStorage);
      expect(activeEditors.length).toBe(2);
      expect(activeEditors.map((e) => e.userName)).toContain("أحمد علي");
      expect(activeEditors.map((e) => e.userName)).toContain("سارة محمد");

      // Render TopBar with these active editors
      render(
        <StudioTopBar
          themeName="مودرن"
          activePageKey="home"
          deviceMode="desktop"
          hasPendingChanges={false}
          canUndo={false}
          canRedo={false}
          saving={false}
          onBack={vi.fn()}
          onPageChange={vi.fn()}
          onDeviceChange={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          onSave={vi.fn()}
          onOpenPreview={vi.fn()}
          activeEditors={activeEditors}
        />
      );

      const indicator = screen.getByTestId("studio-active-editors-indicator");
      expect(indicator).toBeDefined();
      expect(indicator.textContent).toContain("بيعدّل الآن:");
      expect(indicator.textContent).toContain("أحمد علي");
      expect(indicator.textContent).toContain("سارة محمد");
    });

    it("4.2 Expired heartbeat entries (>60s) are automatically pruned", () => {
      // Simulate old expired session
      const expiredEntry = {
        sessionId: "session_old",
        userName: "محرر قديم",
        pageKey: "home",
        lastHeartbeat: Date.now() - 70000, // 70 seconds ago (> 60s)
      };
      sessionStorage.setItem(
        STUDIO_HEARTBEAT_STORAGE_KEY,
        JSON.stringify([expiredEntry])
      );

      // Register fresh session
      recordStudioHeartbeat(
        "home",
        { id: "u_fresh", name: "محرر حالي" },
        "session_fresh",
        sessionStorage
      );

      const active = getActiveStudioEditors("home", sessionStorage);
      expect(active.length).toBe(1);
      expect(active[0].userName).toBe("محرر حالي");
    });

    it("4.3 clearStudioHeartbeat removes session on unmount", () => {
      recordStudioHeartbeat(
        "home",
        { id: "u1", name: "أحمد" },
        "session_to_leave",
        sessionStorage
      );
      expect(getActiveStudioEditors("home", sessionStorage).length).toBe(1);

      clearStudioHeartbeat("session_to_leave", sessionStorage);
      expect(getActiveStudioEditors("home", sessionStorage).length).toBe(0);
    });
  });
});
