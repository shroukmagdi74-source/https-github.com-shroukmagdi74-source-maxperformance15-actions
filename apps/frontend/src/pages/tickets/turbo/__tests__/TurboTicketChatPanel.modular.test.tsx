// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { extractMediaUrls, getStatusBadge } from "../chat-panel/chatPanelUtils";
import { TurboTicketEmptyState } from "../chat-panel/TurboTicketEmptyState";
import { TurboTicketChatHeader } from "../chat-panel/TurboTicketChatHeader";
import { TurboTicketInitialCard } from "../chat-panel/TurboTicketInitialCard";
import { TurboTicketMessageBubble } from "../chat-panel/TurboTicketMessageBubble";
import { TurboTicketInputBar } from "../chat-panel/TurboTicketInputBar";
import { TurboTicketOrderSidebar } from "../chat-panel/TurboTicketOrderSidebar";
import { TurboTicketImageLightbox } from "../chat-panel/TurboTicketImageLightbox";
import { TurboTicketDragOverlay } from "../chat-panel/TurboTicketDragOverlay";
import { TurboTicketChatPanel } from "../TurboTicketChatPanel";
import type { TurboTicketItem, TurboMessage } from "../types";

vi.mock("../../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: {
      firstName: "مختار",
      lastName: "الهنداوي",
      company: { name: "سوان فاشون" },
    },
  }),
}));

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

const mockTicket: TurboTicketItem = {
  id: "9876",
  code: "TRB-9876",
  subject: "تأخر تسليم الشحنة في الجيزة",
  content: "الشحنة متأخرة 3 أيام والعميل يستفسر.",
  status: "1",
  created_at: "2026-10-26T14:30:00Z",
  category: { id: "cat-1", name: "تأخير شحنة" },
  messages: [
    {
      id: "msg-1",
      content: "تم إرسال إشعار للمندوب وسيقوم بالتواصل مع العميل اليوم.",
      created_at: "2026-10-26T15:00:00Z",
      is_client_message: 0,
      user: { name: "عمرو ممثل تربو" },
    },
  ],
  matchedOrder: {
    id: "ord-101",
    orderNumber: "1042",
    status: "PROCESSING",
    turboStatus: "DELIVERING",
    turboTrackingNumber: "TRB-9876",
    customer: {
      name: "أحمد محمود",
      phone: "01012345678",
      address: "شارع الهرم - محطة نصر الدين",
      city: "الجيزة",
      governorate: "الجيزة",
    },
    items: [
      {
        id: "item-1",
        productName: "فستان بيج شتوي",
        variantName: "مقاس L",
        quantity: 1,
        unitPrice: 850,
        total: 850,
      },
    ],
    financials: {
      subtotal: 850,
      shippingFee: 60,
      discount: 0,
      total: 910,
    },
  },
};

describe("chatPanelUtils", () => {
  it("extracts media URLs from various formats", () => {
    expect(extractMediaUrls(null)).toEqual([]);
    expect(extractMediaUrls({ image: "https://example.com/photo.png" })).toEqual([
      "https://example.com/photo.png",
    ]);
    expect(extractMediaUrls({ file: "/uploads/doc.jpg" })).toEqual([
      "https://backoffice.turbo-eg.com/uploads/doc.jpg",
    ]);
  });

  it("resolves status badges correctly", () => {
    expect(getStatusBadge("0").label).toBe("جديدة");
    expect(getStatusBadge("1").label).toBe("قيد المعالجة");
    expect(getStatusBadge("2").label).toBe("مغلقة");
    expect(getStatusBadge("3").label).toBe("معلقة");
  });
});

describe("TurboTicketEmptyState", () => {
  it("renders empty state correctly", () => {
    render(<TurboTicketEmptyState />);
    expect(screen.getByText("مركز تذاكر ومحادثات الشحن")).toBeInTheDocument();
    expect(screen.getByText("Turbo Sync Connected")).toBeInTheDocument();
  });
});

describe("TurboTicketChatHeader", () => {
  it("renders ticket header tools", () => {
    const onToggleOrderSidebar = vi.fn();
    render(
      <TurboTicketChatHeader
        ticket={mockTicket}
        loading={false}
        copiedCode={false}
        showOrderSidebar={false}
        ratingScore={4}
        submittingRating={false}
        activeOrder={mockTicket.matchedOrder}
        onCopyCode={vi.fn()}
        onToggleOrderSidebar={onToggleOrderSidebar}
        onRate={vi.fn()}
        onOpenLogs={vi.fn()}
        onRefreshTicket={vi.fn()}
      />
    );

    expect(screen.getByText("تذكرة #9876")).toBeInTheDocument();
    expect(screen.getByText("قيد المعالجة")).toBeInTheDocument();
    const orderBtn = screen.getByTitle("تفاصيل الأوردر المرتبط");
    fireEvent.click(orderBtn);
    expect(onToggleOrderSidebar).toHaveBeenCalled();
  });
});

describe("TurboTicketInitialCard", () => {
  it("renders creator and content", () => {
    render(
      <TurboTicketInitialCard
        ticket={mockTicket}
        user={{ company: { name: "سوان فاشون" }, firstName: "مختار" }}
        onPreviewImage={vi.fn()}
      />
    );

    expect(screen.getByText(/تذكرة بواسطة: سوان فاشون/)).toBeInTheDocument();
    expect(screen.getByText("الفئة: تأخير شحنة")).toBeInTheDocument();
    expect(screen.getByText("الشحنة متأخرة 3 أيام والعميل يستفسر.")).toBeInTheDocument();
  });
});

describe("TurboTicketMessageBubble", () => {
  it("renders message bubble with sender title and text", () => {
    const msg: TurboMessage = mockTicket.messages![0];
    render(
      <TurboTicketMessageBubble
        message={msg}
        isStore={false}
        senderTitle="تربو - خدمة العملاء"
        roleName="تربو"
        onPreviewImage={vi.fn()}
      />
    );

    expect(screen.getByText("تربو - خدمة العملاء")).toBeInTheDocument();
    expect(screen.getByText(msg.content!)).toBeInTheDocument();
  });
});

describe("TurboTicketInputBar", () => {
  it("handles reply input typing", () => {
    const setReplyText = vi.fn();
    render(
      <TurboTicketInputBar
        replyText="ننتظر الرد"
        setReplyText={setReplyText}
        replyImage={null}
        setReplyImage={vi.fn()}
        replyImagePreview={null}
        sending={false}
        onSendReply={vi.fn()}
        onPaste={vi.fn()}
        onPreviewImage={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/اكتب ردك/);
    fireEvent.change(input, { target: { value: "تعديل الرد" } });
    expect(setReplyText).toHaveBeenCalledWith("تعديل الرد");
  });
});

describe("TurboTicketOrderSidebar", () => {
  it("renders order details and financials", () => {
    const onClose = vi.fn();
    render(
      <TurboTicketOrderSidebar
        activeOrder={mockTicket.matchedOrder}
        showOrderSidebar={true}
        onClose={onClose}
        orderSearchQuery=""
        setOrderSearchQuery={vi.fn()}
        searchingOrder={false}
        onSearchOrder={vi.fn()}
        onCopyCode={vi.fn()}
      />
    );

    expect(screen.getByText("تفاصيل طلب #1042")).toBeInTheDocument();
    expect(screen.getByText("أحمد محمود")).toBeInTheDocument();
    expect(screen.getByText("01012345678")).toBeInTheDocument();
    expect(screen.getByText("فستان بيج شتوي")).toBeInTheDocument();
    expect(screen.getByText("910 ج.م")).toBeInTheDocument();
  });
});

describe("TurboTicketImageLightbox and DragOverlay", () => {
  it("renders lightbox when url provided and calls onClose", () => {
    const onClose = vi.fn();
    render(
      <TurboTicketImageLightbox
        imageUrl="https://example.com/test.png"
        onClose={onClose}
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders drag overlay when isDragging", () => {
    render(<TurboTicketDragOverlay isDragging={true} />);
    expect(screen.getByText(/أفلت الصورة أو لقطة الشاشة هنا/)).toBeInTheDocument();
  });
});

describe("TurboTicketChatPanel integration", () => {
  it("renders coordinator shell with ticket correctly", () => {
    render(
      <TurboTicketChatPanel
        ticket={mockTicket}
        loading={false}
        onRefreshTicket={vi.fn()}
        onOpenLogs={vi.fn()}
      />
    );

    expect(screen.getByText("تذكرة #9876")).toBeInTheDocument();
    expect(screen.getByText("الشحنة متأخرة 3 أيام والعميل يستفسر.")).toBeInTheDocument();
  });

  it("renders empty state when ticket is null", () => {
    render(
      <TurboTicketChatPanel
        ticket={null}
        loading={false}
        onRefreshTicket={vi.fn()}
        onOpenLogs={vi.fn()}
      />
    );

    expect(screen.getByText("مركز تذاكر ومحادثات الشحن")).toBeInTheDocument();
  });
});
