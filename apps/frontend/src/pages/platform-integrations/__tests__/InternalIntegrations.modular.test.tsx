// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  InternalIntegrationsHeader,
  InternalIntegrationsTabsNav,
  InternalConnectionsTab,
  InternalRequestsTab,
  InternalConsumersTab,
  InternalFindCompanyTab,
  InternalPullProductsView,
  InternalPullOrdersView,
  Connection,
  Request,
  InternalProduct,
  InternalOrder,
} from "../internal-integrations";
import { InternalIntegrations } from "../InternalIntegrations";

afterEach(() => {
  cleanup();
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const dict: Record<string, string> = {
        "platform.k_43": "الربط الداخلي للمنصة",
        "platform.k_44": "إدارة وتكامل بياناتك مع شركاء المنصة",
        "platform.k_94": "الشركاء المتصلون (",
        "platform.k_95": "الطلبات الواردة (",
        "platform.k_96": "المستهلكون (",
        "platform.k_97": "بحث عن شركة",
        "platform.k_98": "متصل",
        "platform.k_48": "سحب المنتجات",
        "platform.k_49": "سحب الطلبات",
        "platform.k_99": "حذف الاتصال",
        "platform.k_45": "لا توجد اتصالات نشطة",
        "platform.k_46": "ابدأ بإضافة شركات ومتاجر شريكة لتبادل البيانات",
        "platform.k_100": "قبول",
        "platform.k_101": "رفض",
        "platform.k_47": "لا توجد طلبات ربط واردة حالياً",
        "platform.k_102": "مستهلك لبياناتك",
        "platform.k_103": "إلغاء الصلاحية",
        "platform.k_50": "لا يوجد مستهلكون لبياناتك حالياً",
        "platform.k_51": "معرف شركتك (Company ID)",
        "platform.k_52": "تم النسخ",
        "platform.k_53": "نسخ المعرف",
        "platform.k_104": "شارك هذا المعرف مع الشركات الأخرى للربط معك",
        "platform.k_54": "إرسال طلب ربط لشركة أخرى",
        "platform.k_55": "أدخل معرف الشركة (Company ID)...",
        "platform.k_56": "إرسال الطلب",
        "platform.k_105": "ملاحظة: يتطلب الربط موافقة الطرف الآخر",
        "platform.k_22": "سحب منتجات: ",
        "platform.k_23": "اختر المنتجات التي ترغب في استيرادها لمتجرك",
        "platform.k_90": "استيراد المنتجات المحددة (",
        "platform.k_25": "بحث في المنتجات...",
        "platform.k_91": "تحديد الكل (",
        "platform.k_92": "إلغاء تحديد الكل",
        "platform.k_26": "جاري جلب المنتجات...",
        "platform.k_27": " ج.م",
        "platform.k_28": "المخزون: ",
        "platform.variants_count": `${options?.count || 0} متغير`,
        "platform.k_29": "لا توجد نتائج مطابقة لبحثك",
        "platform.k_30": "جرب البحث بكلمات أخرى",
        "platform.k_31": "لا توجد منتجات متاحة",
        "platform.k_32": "هذا الشريك لم يضف أي منتجات بعد",
        "platform.k_33": "سحب طلبات: ",
        "platform.k_34": "اختر الطلبات المتاحة للاستيراد",
        "platform.k_93": "استيراد الطلبات (",
        "platform.k_35": "جاري جلب الطلبات...",
        "platform.k_36": "طلب #",
        "platform.k_37": "العميل:",
        "platform.k_38": "الهاتف:",
        "platform.k_39": "الإجمالي:",
        "platform.k_40": "العناصر:",
        "platform.k_41": "لا توجد طلبات متاحة للسحب",
        "platform.k_42": "لا توجد طلبات جديدة حالياً قابلة للاستيراد من هذا الشريك",
      };
      return dict[key] || key;
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../internal-integrations/useInternalIntegrations", () => ({
  useInternalIntegrations: () => ({
    user: { id: "user-1", companyId: "COMP-TEST-12345" },
    view: "main",
    setView: vi.fn(),
    activeTab: "connections",
    setActiveTab: vi.fn(),
    connections: [],
    requests: [],
    consumers: [],
    loading: false,
    searchId: "",
    setSearchId: vi.fn(),
    searching: false,
    copied: false,
    selectedProvider: null,
    providerProducts: [],
    selectedProductIndexes: new Set(),
    fetchingProducts: false,
    importing: false,
    productSearchQuery: "",
    setProductSearchQuery: vi.fn(),
    respondingIds: new Set(),
    availableOrders: [],
    selectedOrderIds: new Set(),
    fetchingOrders: false,
    importingOrders: false,
    totalProviderVariants: 0,
    filteredProducts: [],
    handleRespond: vi.fn(),
    sendRequest: vi.fn(),
    updatePermission: vi.fn(),
    deleteConnection: vi.fn(),
    startPulling: vi.fn(),
    startPullingOrders: vi.fn(),
    toggleProduct: vi.fn(),
    toggleOrder: vi.fn(),
    handleImport: vi.fn(),
    handleImportOrders: vi.fn(),
    handleSelectAll: vi.fn(),
    handleDeselectAll: vi.fn(),
    handleCopyCompanyId: vi.fn(),
  }),
}));

const mockConnection: Connection = {
  id: "conn-1",
  providerId: "comp-provider-1",
  consumerId: "comp-consumer-1",
  allowProductPull: true,
  allowOrderPull: true,
  createdAt: "2026-01-01T00:00:00Z",
  provider: {
    name: "مورد النخبة",
    email: "supplier@elite.com",
    logo: "https://example.com/logo.png",
  },
};

const mockRequest: Request = {
  id: "req-1",
  senderId: "comp-sender-1",
  receiverId: "comp-receiver-1",
  status: "PENDING",
  message: "نود الربط لمزامنة المنتجات والطلبات",
  createdAt: "2026-01-01T00:00:00Z",
  requester: {
    name: "متجر الأناقة",
    email: "store@style.com",
  },
};

const mockProduct: InternalProduct = {
  internalId: "prod-1",
  name: "قميص كلاسيك فاخر",
  sku: "SHIRT-001",
  category: "ملابس رجالية",
  price: 550,
  stock: 25,
  images: ["https://example.com/shirt.png"],
  variants: [{ id: "var-1", name: "أزرق - L", price: 550, stock: 10 }],
};

const mockOrder: InternalOrder = {
  id: "ord-1",
  orderNumber: "ORD-9876",
  total: 1100,
  createdAt: "2026-01-01T00:00:00Z",
  customer: {
    firstName: "أحمد",
    lastName: "محمود",
    phone: "01012345678",
  },
  orderItems: [
    {
      product: { name: "قميص كلاسيك فاخر" },
      quantity: 2,
    },
  ],
};

describe("InternalIntegrations Modular Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders InternalIntegrationsHeader with title and subtitle", () => {
    render(<InternalIntegrationsHeader />);
    expect(screen.getByText("الربط الداخلي للمنصة")).toBeTruthy();
    expect(
      screen.getByText("إدارة وتكامل بياناتك مع شركاء المنصة")
    ).toBeTruthy();
  });

  it("renders InternalIntegrationsTabsNav and switches tabs", () => {
    const setActiveTab = vi.fn();
    render(
      <InternalIntegrationsTabsNav
        activeTab="connections"
        setActiveTab={setActiveTab}
        connectionsCount={3}
        requestsCount={2}
        consumersCount={1}
      />
    );

    expect(screen.getByRole("button", { name: /الشركاء المتصلون/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /الطلبات الواردة/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /المستهلكون/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /بحث عن شركة/ }));
    expect(setActiveTab).toHaveBeenCalledWith("find");
  });

  it("renders InternalConnectionsTab with connections grid and triggers actions", () => {
    const onStartPulling = vi.fn();
    const onStartPullingOrders = vi.fn();
    const onDeleteConnection = vi.fn();

    render(
      <InternalConnectionsTab
        connections={[mockConnection]}
        onStartPulling={onStartPulling}
        onStartPullingOrders={onStartPullingOrders}
        onDeleteConnection={onDeleteConnection}
      />
    );

    expect(screen.getByText("مورد النخبة")).toBeTruthy();
    expect(screen.getByText("supplier@elite.com")).toBeTruthy();
    expect(screen.getByText("متصل")).toBeTruthy();

    fireEvent.click(screen.getByText("سحب المنتجات"));
    expect(onStartPulling).toHaveBeenCalledWith(mockConnection);

    fireEvent.click(screen.getByText("سحب الطلبات"));
    expect(onStartPullingOrders).toHaveBeenCalledWith(mockConnection);

    fireEvent.click(screen.getByText("حذف الاتصال"));
    expect(onDeleteConnection).toHaveBeenCalledWith("conn-1");
  });

  it("renders InternalConnectionsTab empty state when empty", () => {
    render(
      <InternalConnectionsTab
        connections={[]}
        onStartPulling={vi.fn()}
        onStartPullingOrders={vi.fn()}
        onDeleteConnection={vi.fn()}
      />
    );
    expect(screen.getByText("لا توجد اتصالات نشطة")).toBeTruthy();
  });

  it("renders InternalRequestsTab and responds to requests", () => {
    const onRespond = vi.fn();
    render(
      <InternalRequestsTab
        requests={[mockRequest]}
        respondingIds={new Set()}
        onRespond={onRespond}
      />
    );

    expect(screen.getByText("متجر الأناقة")).toBeTruthy();
    expect(
      screen.getByText('"نود الربط لمزامنة المنتجات والطلبات"')
    ).toBeTruthy();

    fireEvent.click(screen.getByText("قبول"));
    expect(onRespond).toHaveBeenCalledWith("req-1", "APPROVED");

    fireEvent.click(screen.getByText("رفض"));
    expect(onRespond).toHaveBeenCalledWith("req-1", "REJECTED");
  });

  it("renders InternalConsumersTab and toggles permissions", () => {
    const onUpdatePermission = vi.fn();
    const onDeleteConnection = vi.fn();

    const mockConsumer = {
      id: "conn-consumer-1",
      allowProductPull: true,
      allowOrderPull: false,
      consumer: {
        name: "فرع القاهرة",
        email: "cairo@branch.com",
      },
    };

    render(
      <InternalConsumersTab
        consumers={[mockConsumer]}
        onUpdatePermission={onUpdatePermission}
        onDeleteConnection={onDeleteConnection}
      />
    );

    expect(screen.getByText("فرع القاهرة")).toBeTruthy();
    expect(screen.getByText("مستهلك لبياناتك")).toBeTruthy();

    const productToggle = screen.getByLabelText("سحب المنتجات toggle");
    fireEvent.click(productToggle);
    expect(onUpdatePermission).toHaveBeenCalledWith("conn-consumer-1", {
      allowProductPull: false,
    });

    fireEvent.click(screen.getByText("إلغاء الصلاحية"));
    expect(onDeleteConnection).toHaveBeenCalledWith("conn-consumer-1");
  });

  it("renders InternalFindCompanyTab and copies company ID and sends requests", () => {
    const onCopy = vi.fn();
    const onSend = vi.fn();
    const setSearchId = vi.fn();

    render(
      <InternalFindCompanyTab
        userCompanyId="COMP-TEST-12345"
        searchId="TARGET-COMP-99"
        setSearchId={setSearchId}
        searching={false}
        copied={false}
        onCopyCompanyId={onCopy}
        onSendRequest={onSend}
      />
    );

    expect(screen.getByText("COMP-TEST-12345")).toBeTruthy();
    fireEvent.click(screen.getByText("نسخ المعرف"));
    expect(onCopy).toHaveBeenCalled();

    const input = screen.getByPlaceholderText(
      "أدخل معرف الشركة (Company ID)..."
    );
    fireEvent.change(input, { target: { value: "NEW-COMP-ID" } });
    expect(setSearchId).toHaveBeenCalledWith("NEW-COMP-ID");

    fireEvent.click(screen.getByText("إرسال الطلب"));
    expect(onSend).toHaveBeenCalled();
  });

  it("renders InternalPullProductsView with search, select and import triggers", () => {
    const onImport = vi.fn();
    const onSelectAll = vi.fn();
    const onDeselectAll = vi.fn();
    const onToggleProduct = vi.fn();
    const onBack = vi.fn();

    render(
      <InternalPullProductsView
        selectedProvider={mockConnection}
        providerProducts={[mockProduct]}
        filteredProducts={[mockProduct]}
        totalProviderVariants={1}
        selectedProductIndexes={new Set([0])}
        fetchingProducts={false}
        importing={false}
        productSearchQuery=""
        setProductSearchQuery={vi.fn()}
        onBack={onBack}
        onImport={onImport}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onToggleProduct={onToggleProduct}
      />
    );

    expect(screen.getByText("قميص كلاسيك فاخر")).toBeTruthy();
    expect(screen.getByText(/550/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^تحديد الكل/ }));
    expect(onSelectAll).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /إلغاء تحديد الكل/ }));
    expect(onDeselectAll).toHaveBeenCalled();

    fireEvent.click(screen.getByText("قميص كلاسيك فاخر"));
    expect(onToggleProduct).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getByLabelText("الرجوع"));
    expect(onBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /استيراد المنتجات المحددة/ }));
    expect(onImport).toHaveBeenCalled();
  });

  it("renders InternalPullOrdersView and handles order import", () => {
    const onBack = vi.fn();
    const onImportOrders = vi.fn();
    const onToggleOrder = vi.fn();

    render(
      <InternalPullOrdersView
        selectedProvider={mockConnection}
        availableOrders={[mockOrder]}
        selectedOrderIds={new Set(["ord-1"])}
        fetchingOrders={false}
        importingOrders={false}
        onBack={onBack}
        onImportOrders={onImportOrders}
        onToggleOrder={onToggleOrder}
      />
    );

    expect(screen.getByText("ORD-9876")).toBeTruthy();
    expect(screen.getByText("أحمد محمود")).toBeTruthy();
    expect(screen.getByText("01012345678")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /استيراد الطلبات/ }));
    expect(onImportOrders).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("الرجوع"));
    expect(onBack).toHaveBeenCalled();
  });

  it("renders coordinator InternalIntegrations without crash", () => {
    render(<InternalIntegrations />);
    expect(screen.getByText("الربط الداخلي للمنصة")).toBeTruthy();
    expect(screen.getByText("لا توجد اتصالات نشطة")).toBeTruthy();
  });
});
