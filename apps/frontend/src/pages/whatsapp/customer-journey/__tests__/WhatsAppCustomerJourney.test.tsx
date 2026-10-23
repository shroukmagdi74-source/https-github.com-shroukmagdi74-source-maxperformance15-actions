/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import WhatsAppCustomerJourney from "../../WhatsAppCustomerJourney";
import { apiClient } from "../../../../services/apiClient";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();
  return {
    ...actual,
    useTranslation: () => ({
      i18n: { dir: () => "rtl", language: "ar" },
      t: (key: string, options?: any) => {
        if (key === "whatsappJourney.flows.count") return `${options?.count || 0} سلاسل`;
        if (key === "whatsappJourney.tabs.flows") return "سلاسل الرسائل";
        if (key === "whatsappJourney.tabs.monitoring") return "المراقبة الحية";
        if (key === "whatsappJourney.flows.addNew") return "سلسلة جديدة";
        if (key === "whatsappJourney.flows.enabled") return "مفعلة";
        if (key === "whatsappJourney.flows.disabled") return "معطلة";
        if (key === "common.refresh") return "تحديث";
        if (key === "common.back") return "رجوع";
        if (key === "common.search") return "بحث...";
        if (key === "common.cancel") return "إلغاء";
        if (key === "common.save") return "حفظ";
        return key;
      },
    }),
  };
});

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../../hooks/useAuthSimple", () => ({
  useAuth: () => ({
    user: { id: "u-admin", role: "OWNER", name: "System Admin" },
    loading: false,
  }),
}));

const MockFlowCanvas = () => <div data-testid="mock-flow-canvas">FlowCanvas Mock</div>;

const mockFlowsResponse = {
  data: [
    {
      id: "flow-1",
      name: "سلسلة تأكيد الطلب",
      isEnabled: true,
      createdAt: "2026-10-20T10:00:00Z",
      channels: ["WHATSAPP"],
      _count: { steps: 3, journeys: 12, categories: 1 },
    },
    {
      id: "flow-2",
      name: "سلسلة السلة المتروكة",
      isEnabled: false,
      createdAt: "2026-10-21T10:00:00Z",
      channels: ["WHATSAPP", "FACEBOOK"],
      _count: { steps: 2, journeys: 5, categories: 1 },
    },
  ],
};

const mockStepsResponse = {
  data: [
    {
      id: "step-1",
      flowId: "flow-1",
      stepOrder: 1,
      delayDays: 1,
      content: "مرحبا {firstName}، تم استلام طلبك رقم {orderNumber}",
      buttons: [],
    },
  ],
};

const mockJourneysResponse = {
  data: [
    {
      id: "j-1",
      status: "ACTIVE",
      currentStep: 1,
      nextSendAt: "2026-10-24T10:00:00Z",
      customer: { firstName: "أحمد", lastName: "علي", phone: "01012345678" },
      order: { orderNumber: "ORD-991" },
      flow: { name: "سلسلة تأكيد الطلب", steps: [{ id: "step-1" }] },
    },
  ],
};

describe("WhatsAppCustomerJourney", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/steps")) {
        return Promise.resolve({ data: mockStepsResponse });
      }
      if (url.includes("/journeys")) {
        return Promise.resolve({ data: mockJourneysResponse });
      }
      if (url.includes("/flows")) {
        return Promise.resolve({ data: mockFlowsResponse });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it("renders page top bar, flow list, steps canvas and monitoring section", async () => {
    render(
      <MemoryRouter>
        <WhatsAppCustomerJourney FlowCanvasComponent={MockFlowCanvas} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("سلاسل الرسائل")).toBeInTheDocument();
      expect(screen.getByText("المراقبة الحية")).toBeInTheDocument();
      expect(screen.getAllByText("سلسلة جديدة").length).toBeGreaterThan(0);
    });
  });

  it("loads and displays flows and customer journeys", async () => {
    render(
      <MemoryRouter>
        <WhatsAppCustomerJourney FlowCanvasComponent={MockFlowCanvas} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("سلسلة تأكيد الطلب").length).toBeGreaterThan(0);
      expect(screen.getByText("سلسلة السلة المتروكة")).toBeInTheDocument();
      expect(screen.getByText("أحمد علي")).toBeInTheDocument();
    });
  });

  it("allows selecting a flow and fetching its steps", async () => {
    render(
      <MemoryRouter>
        <WhatsAppCustomerJourney FlowCanvasComponent={MockFlowCanvas} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("سلسلة السلة المتروكة").length).toBeGreaterThan(0);
    });

    const callsBefore = (apiClient.get as any).mock.calls.length;
    const secondFlowBtn = screen.getAllByText("سلسلة السلة المتروكة")[0];
    fireEvent.click(secondFlowBtn);

    await waitFor(() => {
      expect((apiClient.get as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("opens create flow dialog when clicking add new flow button", async () => {
    render(
      <MemoryRouter>
        <WhatsAppCustomerJourney FlowCanvasComponent={MockFlowCanvas} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("سلسلة جديدة").length).toBeGreaterThan(0);
    });

    const addBtn = screen.getAllByRole("button", { name: /سلسلة جديدة/ })[0];
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getAllByRole("dialog").length).toBeGreaterThan(0);
    });
  });

  it("triggers manual workspace refresh when clicking refresh button", async () => {
    render(
      <MemoryRouter>
        <WhatsAppCustomerJourney FlowCanvasComponent={MockFlowCanvas} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("سلسلة السلة المتروكة").length).toBeGreaterThan(0);
    });

    const callsBefore = (apiClient.get as any).mock.calls.length;
    const refreshBtn = screen.getByRole("button", { name: /تحديث/ });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect((apiClient.get as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
