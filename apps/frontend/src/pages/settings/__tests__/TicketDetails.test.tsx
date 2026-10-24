/* @vitest-environment jsdom */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TicketDetails from "../TicketDetails";

const mockNavigate = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockApiGet = vi.fn();
const mockApiPost = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("../../../utils/i18n-toast", () => ({
  tToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

const mockTicketData = {
  success: true,
  data: {
    ticket: {
      id: 1234,
      content: "مشكلة في تأكيد الشحنة على بورتال Turbo",
      status: 1,
      created_at: "2026-10-24T10:00:00.000Z",
      rate: 4,
      messages: [
        {
          id: 1,
          ticket_id: 1234,
          message: "السلام عليكم، الشحنة رقم 5542 لم تظهر في بورتال توربو",
          content: "السلام عليكم، الشحنة رقم 5542 لم تظهر في بورتال توربو",
          sender_name: "التاجر أحمد",
          is_client_message: 1,
          created_at: "2026-10-24T10:05:00.000Z",
        },
        {
          id: 2,
          ticket_id: 1234,
          message: "أهلاً بك، تم فحص الشحنة ومزامنتها بنجاح مع السيستم",
          content: "أهلاً بك، تم فحص الشحنة ومزامنتها بنجاح مع السيستم",
          sender_name: "الدعم الفني",
          is_client_message: 0,
          created_at: "2026-10-24T10:15:00.000Z",
        },
      ],
    },
  },
};

const mockLogData = {
  success: true,
  data: {
    logs: [
      {
        id: 101,
        description: "تم تغيير حالة التذكرة إلى قيد المعالجة",
        created_at: "2026-10-24T10:06:00.000Z",
        user: { full_name: "فريق الدعم" },
      },
    ],
  },
};

describe("TicketDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockImplementation((url: string) => {
      if (url.includes("/log")) {
        return Promise.resolve({ data: mockLogData });
      }
      return Promise.resolve({ data: mockTicketData });
    });
    mockApiPost.mockResolvedValue({
      data: { success: true },
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={["/settings/turbo/tickets/1234"]}>
        <Routes>
          <Route
            path="/settings/turbo/tickets/:ticketId"
            element={<TicketDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

  it("loads and displays ticket details, messages, and status correctly", async () => {
    renderComponent();

    expect(screen.getByText("جاري تحميل تفاصيل التذكرة...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("معلومات التذكرة")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /تذكرة.*1234/ })).toBeInTheDocument();
      expect(screen.getByText("مشكلة في تأكيد الشحنة على بورتال Turbo")).toBeInTheDocument();
      expect(screen.getByText("قيد المعالجة")).toBeInTheDocument();
    });

    // Check messages
    expect(screen.getByText("السلام عليكم، الشحنة رقم 5542 لم تظهر في بورتال توربو")).toBeInTheDocument();
    expect(screen.getByText("أهلاً بك، تم فحص الشحنة ومزامنتها بنجاح مع السيستم")).toBeInTheDocument();
    expect(screen.getByText("خدمة العملاء")).toBeInTheDocument();

    // Check logs
    expect(screen.getByText("سجل التذكرة")).toBeInTheDocument();
    expect(screen.getByText("تم تغيير حالة التذكرة إلى قيد المعالجة")).toBeInTheDocument();
  });

  it("submits reply when typing and clicking send reply button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("إرسال رد")).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText("الرسالة");
    fireEvent.change(textarea, { target: { value: "شكراً جزيلاً لكم تم التأكد" } });

    const submitBtn = screen.getByRole("button", { name: /إرسال الرد/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        "/turbo/tickets/1234/reply",
        expect.any(FormData)
      );
    });
  });

  it("rates ticket when star icon is clicked", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTitle("تقييم 5 من 5 نجوم")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("تقييم 5 من 5 نجوم"));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        "/turbo/tickets/1234/rate",
        { rate: 5 }
      );
      expect(mockToastSuccess).toHaveBeenCalledWith("تم تقييم التذكرة بنجاح");
    });
  });

  it("shows error view with retry button when API fails", async () => {
    mockApiGet.mockRejectedValue(new Error("شبكة الاتصال مقطوعة"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("خطأ في تحميل التذكرة")).toBeInTheDocument();
      expect(screen.getByText("إعادة المحاولة")).toBeInTheDocument();
    });
  });
});
