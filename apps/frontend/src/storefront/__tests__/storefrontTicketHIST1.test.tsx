// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  StudioHistoryPanel,
  formatArabicDateTime,
  countSnapshotDetails,
} from "../studio/StudioHistoryPanel";
import { StudioTopBar } from "../studio/StudioTopBar";
import { storefrontSettingsService } from "../../services/storefrontSettingsService";
import { toast } from "sonner";

vi.mock("../../services/storefrontSettingsService", () => ({
  storefrontSettingsService: {
    getRevisions: vi.fn(),
    getRevisionById: vi.fn(),
    restoreRevision: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Ticket HIST-1: Storefront Version History & Rollback UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Pure Helpers: Formatting & Snapshot Details", () => {
    it("formatArabicDateTime formats an ISO date without throwing", () => {
      const formatted = formatArabicDateTime("2026-10-22T14:32:00.000Z");
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("countSnapshotDetails accurately aggregates pages, sections, and themeId", () => {
      const snapshot = {
        themeId: "khemet-fashion-eg",
        designTokens: {
          pages: {
            home: { sections: [{ type: "hero" }, { type: "grid" }] },
            about: { sections: [{ type: "content" }] },
          },
        },
      };

      const result = countSnapshotDetails(snapshot);
      expect(result.pagesCount).toBe(2);
      expect(result.sectionsCount).toBe(3);
      expect(result.themeId).toBe("khemet-fashion-eg");
    });

    it("countSnapshotDetails handles empty or null gracefully", () => {
      const result = countSnapshotDetails(null);
      expect(result.pagesCount).toBe(0);
      expect(result.sectionsCount).toBe(0);
      expect(result.themeId).toBe("modern-minimal");
    });
  });

  describe("2. StudioTopBar History Button", () => {
    it("renders «السجل» button with data-testid='studio-history-button'", () => {
      const handleToggleHistory = vi.fn();

      render(
        <StudioTopBar
          storeName="متجري"
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
          isHistoryOpen={false}
          onToggleHistory={handleToggleHistory}
        />
      );

      const historyBtn = screen.getByTestId("studio-history-button");
      expect(historyBtn).toBeDefined();
      expect(historyBtn.textContent).toContain("السجل");

      fireEvent.click(historyBtn);
      expect(handleToggleHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("3. StudioHistoryPanel Behavior", () => {
    it("renders empty state when there are no revisions", async () => {
      vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
        success: true,
        data: [],
      });

      render(
        <StudioHistoryPanel
          isOpen={true}
          onClose={vi.fn()}
          companyId="company-test"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("studio-history-empty")).toBeDefined();
      });

      expect(screen.getByText("مفيش إصدارات لسه — أول حفظ هينشئ إصدار")).toBeDefined();
    });

    it("renders revisions list with formatted metadata (#12, date, author, note)", async () => {
      vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
        success: true,
        data: [
          {
            id: "rev-12",
            revisionNumber: 12,
            createdAt: "2026-10-22T14:32:00.000Z",
            createdByName: "محمد",
            createdByEmail: "mohamed@example.com",
            note: "تعديل المنيو",
          },
          {
            id: "rev-11",
            revisionNumber: 11,
            createdAt: "2026-10-22T13:00:00.000Z",
            createdByName: "سارة",
            createdByEmail: "sara@example.com",
            note: null,
          },
        ],
      });

      render(
        <StudioHistoryPanel
          isOpen={true}
          onClose={vi.fn()}
          companyId="company-test"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("#12")).toBeDefined();
        expect(screen.getByText("#11")).toBeDefined();
      });

      expect(screen.getByText("· محمد")).toBeDefined();
      expect(screen.getByText("· «تعديل المنيو»")).toBeDefined();
    });

    it("clicking «معاينة» displays the preview summary with page count, section count, and style", async () => {
      vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
        success: true,
        data: [
          {
            id: "rev-12",
            revisionNumber: 12,
            createdAt: "2026-10-22T14:32:00.000Z",
            createdByName: "محمد",
            note: "تعديل المنيو",
          },
        ],
      });

      vi.mocked(storefrontSettingsService.getRevisionById).mockResolvedValue({
        success: true,
        data: {
          id: "rev-12",
          companyId: "company-test",
          revisionNumber: 12,
          createdAt: "2026-10-22T14:32:00.000Z",
          createdByName: "محمد",
          note: "تعديل المنيو",
          snapshot: {
            themeId: "women-fashion-eg",
            designTokens: {
              pages: {
                home: { sections: [{ type: "banner" }, { type: "slider" }] },
                contact: { sections: [{ type: "form" }] },
              },
            },
          },
        },
      });

      render(
        <StudioHistoryPanel
          isOpen={true}
          onClose={vi.fn()}
          companyId="company-test"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("preview-revision-rev-12")).toBeDefined();
      });

      fireEvent.click(screen.getByTestId("preview-revision-rev-12"));

      await waitFor(() => {
        expect(screen.getByText("ملخص الإصدار #12")).toBeDefined();
      });

      expect(screen.getByText("عدد الصفحات")).toBeDefined();
      expect(screen.getByText("2")).toBeDefined();
      expect(screen.getByText("عدد الأقسام")).toBeDefined();
      expect(screen.getByText("3")).toBeDefined();
      expect(screen.getByText("women-fashion-eg")).toBeDefined();
    });

    it("clicking «استرجاع» opens confirmation dialog with exact ticket text", async () => {
      vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
        success: true,
        data: [
          {
            id: "rev-12",
            revisionNumber: 12,
            createdAt: "2026-10-22T14:32:00.000Z",
            createdByName: "محمد",
            note: "تعديل المنيو",
          },
        ],
      });

      render(
        <StudioHistoryPanel
          isOpen={true}
          onClose={vi.fn()}
          companyId="company-test"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("restore-revision-rev-12")).toBeDefined();
      });

      fireEvent.click(screen.getByTestId("restore-revision-rev-12"));

      expect(screen.getByTestId("restore-confirmation-modal")).toBeDefined();
      expect(
        screen.getByText("هيرجع المتجر لحالة #12 — التغييرات الحالية هتتحفظ كإصدار جديد")
      ).toBeDefined();
    });

    it("clicking «تأكيد الاسترجاع» triggers restore API, shows success toast, and invokes onRestoreSuccess", async () => {
      const handleRestoreSuccess = vi.fn();
      const handleClose = vi.fn();

      vi.mocked(storefrontSettingsService.getRevisions).mockResolvedValue({
        success: true,
        data: [
          {
            id: "rev-12",
            revisionNumber: 12,
            createdAt: "2026-10-22T14:32:00.000Z",
            createdByName: "محمد",
            note: "تعديل المنيو",
          },
        ],
      });

      const restoredSettings = {
        id: "settings-1",
        companyId: "company-test",
        designTokens: { themeId: "women-fashion-eg", pages: {} },
      };

      vi.mocked(storefrontSettingsService.restoreRevision).mockResolvedValue({
        success: true,
        data: restoredSettings as any,
        message: "Restored to revision #12",
      });

      render(
        <StudioHistoryPanel
          isOpen={true}
          onClose={handleClose}
          companyId="company-test"
          onRestoreSuccess={handleRestoreSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("restore-revision-rev-12")).toBeDefined();
      });

      fireEvent.click(screen.getByTestId("restore-revision-rev-12"));

      const confirmBtn = screen.getByTestId("confirm-restore-btn");
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(storefrontSettingsService.restoreRevision).toHaveBeenCalledWith(
          "rev-12",
          "company-test"
        );
      });

      expect(toast.success).toHaveBeenCalledWith("تم استرجاع الإصدار #12 بنجاح ✨");
      expect(handleRestoreSuccess).toHaveBeenCalledWith(restoredSettings);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
