// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import DocumentsSection from "../hr/assets/sections/DocumentsSection";
import {
  formatFileSize,
  getDocumentTypeLabel,
  filterAssetDocuments,
} from "../hr/assets/sections/documents/helpers";

const { mockGet, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("../../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

vi.mock("../../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

vi.mock("../../services/companyAwareApi", () => ({
  companyAwareApi: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

describe("DocumentsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/hr/assets") {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: "asset-1", name: "MacBook Pro 16", code: "AST-01" },
            ],
          },
        });
      }
      if (url.includes("/hr/assets/documents/all")) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              documents: [
                {
                  id: "doc-1",
                  assetId: "asset-1",
                  documentType: "invoice",
                  fileName: "macbook_invoice.pdf",
                  fileUrl: "https://example.com/macbook_invoice.pdf",
                  fileSize: 204800,
                  mimeType: "application/pdf",
                  uploadedBy: "admin",
                  uploadedAt: "2026-10-15T10:00:00.000Z",
                  description: "فاتورة شراء جهاز المطور",
                  asset: { id: "asset-1", name: "MacBook Pro 16", code: "AST-01" },
                },
              ],
              pagination: { totalPages: 1 },
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders documents list, quick upload cards, and filter tabs", async () => {
    render(<DocumentsSection />);

    await waitFor(() => {
      expect(screen.getByText("macbook_invoice.pdf")).toBeInTheDocument();
    });

    expect(screen.getByText("الوثائق والمرفقات")).toBeInTheDocument();
    expect(screen.getByText("فاتورة شراء جهاز المطور")).toBeInTheDocument();
    expect(screen.getAllByText("فاتورة الشراء").length).toBeGreaterThan(0);
  });

  it("opens upload modal when clicking upload button", async () => {
    render(<DocumentsSection />);

    await waitFor(() => {
      expect(screen.getByText("macbook_invoice.pdf")).toBeInTheDocument();
    });

    const uploadBtn = screen.getByRole("button", { name: /رفع مستند جديد/i });
    fireEvent.click(uploadBtn);

    expect(screen.getByText("اختر الأصل *")).toBeInTheDocument();
    expect(screen.getByText("نوع المستند *")).toBeInTheDocument();
  });

  it("formats file size, resolves document type labels, and filters documents via helpers", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(getDocumentTypeLabel("warranty")).toBe("شهادة الضمان");

    const docs = [
      {
        id: "1",
        assetId: "a1",
        documentType: "invoice",
        fileName: "inv.pdf",
        fileUrl: "/inv.pdf",
        uploadedBy: "u",
        uploadedAt: "2026-10-01",
      },
      {
        id: "2",
        assetId: "a2",
        documentType: "warranty",
        fileName: "war.pdf",
        fileUrl: "/war.pdf",
        uploadedBy: "u",
        uploadedAt: "2026-10-01",
      },
    ];

    expect(filterAssetDocuments(docs as any, "warranty", "all", "")).toHaveLength(1);
    expect(filterAssetDocuments(docs as any, "all", "a1", "")).toHaveLength(1);
  });
});
