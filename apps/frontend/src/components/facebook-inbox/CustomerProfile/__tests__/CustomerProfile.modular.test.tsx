// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import CustomerProfile from "../CustomerProfile";
import {
  CustomerProfileHeader,
  CustomerInfoTab,
  CustomerOrdersTab,
  CustomerTimelineTab,
  BlockCustomerModal,
} from "../customer-profile";
import { InboxConversation } from "../../../../types/inbox.types";

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, message: "تم بنجاح" } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, message: "تم التحديث" } }),
  },
}));

vi.mock("../../../orders/EnhancedOrderModal", () => ({
  default: ({ isOpen, order, onClose }: any) =>
    isOpen ? (
      <div data-testid="enhanced-order-modal">
        <span>Order #{order?.orderNumber}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../../StatusDropdown/StatusDropdown", () => ({
  default: ({ currentStatus }: any) => (
    <div data-testid="status-dropdown">{currentStatus}</div>
  ),
}));

vi.mock("../../AssignmentDropdown/AssignmentDropdown", () => ({
  default: () => <div data-testid="assignment-dropdown">Assignment</div>,
}));

vi.mock("../../TagInput/TagInput", () => ({
  default: ({ tags, onTagsChange }: any) => (
    <div data-testid="tag-input">
      {tags?.map((t: string) => (
        <span key={t}>{t}</span>
      ))}
      <button onClick={() => onTagsChange([...(tags || []), "new-tag"])}>Add Tag</button>
    </div>
  ),
}));

const mockCustomer = {
  id: "cust-1",
  firstName: "أحمد",
  lastName: "علي",
  name: "أحمد علي",
  email: "ahmed@company.com",
  phone: "01012345678",
  city: "القاهرة",
  governorate: "القاهرة",
  area: "المعادي",
  address: "شارع النصر",
  notes: "عميل مميز",
  tags: ["VIP", "متكرر"],
  totalOrdersCount: 5,
  deliveryRate: 100,
  customerRating: "A",
};

const mockConversation: InboxConversation = {
  id: "conv-1",
  platform: "facebook",
  pageId: "page-123",
  pageName: "متجر الأزياء",
  customerId: "cust-1",
  customerName: "أحمد علي",
  customerPhone: "01012345678",
  status: "open",
  tags: ["VIP"],
  unreadCount: 0,
  lastMessage: "مرحباً",
  lastMessageAt: new Date().toISOString(),
  lastMessageTime: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOrders = [
  {
    id: "ord-1",
    orderNumber: "1001",
    status: "DELIVERED",
    total: 750,
    createdAt: new Date().toISOString(),
    conversationId: "conv-1",
    items: [
      {
        name: "قميص كلاسيك",
        productName: "قميص كلاسيك",
        quantity: 2,
        price: 375,
        productColor: "أزرق",
        productSize: "L",
      },
    ],
  },
];

const mockActivities = [
  {
    id: "act-1",
    action: "MESSAGE_RECEIVED",
    description: "استلام رسالة جديدة",
    createdAt: new Date().toISOString(),
  },
];

const mockHookReturn = {
  orders: mockOrders,
  activities: mockActivities,
  loading: false,
  loadCustomerData: vi.fn(),
  prependOrder: vi.fn(),
  updateCustomerPhone: vi.fn().mockResolvedValue({ success: true, message: "تم تحديث الهاتف" }),
  calculateLTV: () => 1500,
  customer: mockCustomer,
};

vi.mock("../../../../hooks/inbox/useCustomerProfile", () => ({
  useCustomerProfile: () => mockHookReturn,
}));

describe("CustomerProfile - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders CustomerProfile coordinator with header and tabs", () => {
    render(
      <CustomerProfile
        conversation={mockConversation}
        onTagsChange={vi.fn()}
        updatingTags={false}
      />
    );

    // Header renders customer name
    expect(screen.getByText("أحمد علي")).toBeDefined();
    // Header renders page name
    expect(screen.getByText("متجر الأزياء")).toBeDefined();
    // Stats renders LTV and orders count
    expect(screen.getByText(/1,500/)).toBeDefined();
    // Tabs exist
    expect(screen.getByRole("button", { name: /نشاط/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /طلبات/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /معلومات/ })).toBeDefined();
  });

  it("switches to orders tab and renders customer orders", () => {
    render(
      <CustomerProfile
        conversation={mockConversation}
        onTagsChange={vi.fn()}
        updatingTags={false}
      />
    );

    const ordersTabBtn = screen.getByRole("button", { name: /طلبات/ });
    fireEvent.click(ordersTabBtn);

    // Order number rendered
    expect(screen.getByText("#1001")).toBeDefined();
    // Item name rendered
    expect(screen.getByText(/قميص كلاسيك/)).toBeDefined();
  });

  it("switches to info tab and displays contact info", () => {
    render(
      <CustomerProfile
        conversation={mockConversation}
        onTagsChange={vi.fn()}
        updatingTags={false}
      />
    );

    const infoTabBtn = screen.getByRole("button", { name: /معلومات/ });
    fireEvent.click(infoTabBtn);

    // Contact info phone
    expect(screen.getByText("01012345678")).toBeDefined();
    // Email
    expect(screen.getByText("ahmed@company.com")).toBeDefined();
    // Notes
    expect(screen.getByText("عميل مميز")).toBeDefined();
  });

  it("renders CustomerTimelineTab with activity list and sync button", () => {
    const onSync = vi.fn();
    render(
      <CustomerTimelineTab
        conversation={mockConversation}
        activities={mockActivities}
        syncMessage={null}
        syncingMessages={false}
        onSyncMessages={onSync}
      />
    );

    expect(screen.getByText("استلام رسالة جديدة")).toBeDefined();
    const syncBtn = screen.getByText("جلب الرسائل");
    fireEvent.click(syncBtn);
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it("renders BlockCustomerModal and handles confirm / cancel", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onReasonChange = vi.fn();

    const { rerender } = render(
      <BlockCustomerModal
        isOpen={false}
        blockReason=""
        blocking={false}
        onBlockReasonChange={onReasonChange}
        onBlockConfirm={onConfirm}
        onBlockCancel={onCancel}
      />
    );

    expect(screen.queryByText("حظر العميل على صفحة الفيس بوك")).toBeNull();

    rerender(
      <BlockCustomerModal
        isOpen={true}
        blockReason="إزعاج متكرر"
        blocking={false}
        onBlockReasonChange={onReasonChange}
        onBlockConfirm={onConfirm}
        onBlockCancel={onCancel}
      />
    );

    expect(screen.getByText("حظر العميل على صفحة الفيس بوك")).toBeDefined();
    const textarea = screen.getByPlaceholderText("أدخل سبب الحظر...");
    fireEvent.change(textarea, { target: { value: "سبب جديد" } });
    expect(onReasonChange).toHaveBeenCalledWith("سبب جديد");

    fireEvent.click(screen.getByText("تأكيد الحظر"));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("إلغاء"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders CustomerProfileHeader with action triggers", () => {
    const onSoundToggle = vi.fn();
    const onNotificationsToggle = vi.fn();
    const onCreateOrder = vi.fn();
    const onBlockClick = vi.fn();

    render(
      <CustomerProfileHeader
        conversation={mockConversation}
        ordersCount={3}
        ltv={2500}
        effectiveStatus="open"
        soundEnabled={true}
        notificationsEnabled={true}
        onSoundToggle={onSoundToggle}
        onNotificationsToggle={onNotificationsToggle}
        onCreateOrder={onCreateOrder}
        onBlockClick={onBlockClick}
      />
    );

    expect(screen.getByText("أحمد علي")).toBeDefined();
    expect(screen.getByText("2,500 ج.م")).toBeDefined();

    const createOrderBtn = screen.getByTitle("إنشاء طلب سريع لهذا العميل");
    fireEvent.click(createOrderBtn);
    expect(onCreateOrder).toHaveBeenCalledTimes(1);

    const blockBtn = screen.getByTitle("حظر العميل على الصفحة");
    fireEvent.click(blockBtn);
    expect(onBlockClick).toHaveBeenCalledTimes(1);
  });
});
