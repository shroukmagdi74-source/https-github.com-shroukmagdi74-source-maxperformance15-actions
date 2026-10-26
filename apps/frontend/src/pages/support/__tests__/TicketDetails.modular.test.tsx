// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  getStatusText,
  getCategoryText,
  formatFileSize,
  AdminTicketsSidebar,
  UserTicketHeader,
  UserChatMessages,
  UserReplyForm,
  UserRatingCard,
  Ticket,
} from "../ticket-details";

afterEach(() => {
  cleanup();
});

const mockTicket: Ticket = {
  _id: "ticket-123",
  ticketId: "TCK-1001",
  subject: "مشكلة في تسجيل الدخول",
  description: "لا أستطيع الوصول للوحة التحكم",
  category: "technical",
  priority: "high",
  status: "open",
  createdAt: "2026-10-26T10:00:00.000Z",
  updatedAt: "2026-10-26T11:00:00.000Z",
  userId: {
    _id: "user-1",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    role: "merchant",
  },
  messages: [
    {
      _id: "msg-1",
      senderType: "user",
      sender: {
        id: "user-1",
        name: "أحمد محمد",
        email: "ahmed@example.com",
        role: "merchant",
      },
      content: "أحتاج لمساعدة عاجلة في الدخول",
      attachments: [],
      createdAt: "2026-10-26T10:05:00.000Z",
    },
    {
      _id: "msg-2",
      senderType: "admin",
      sender: {
        id: "admin-1",
        name: "فريق الدعم",
        email: "support@example.com",
        role: "admin",
      },
      content: "تم التحقق وسنقوم بحل المشكلة خلال دقائق",
      attachments: [],
      createdAt: "2026-10-26T10:15:00.000Z",
    },
  ],
};

describe("TicketDetails Modular Components (Batch 566)", () => {
  describe("Helper Functions", () => {
    it("getStatusText returns correct localized status strings", () => {
      expect(getStatusText("open")).toBe("مفتوح");
      expect(getStatusText("in_progress")).toBe("قيد المعالجة");
      expect(getStatusText("closed")).toBe("مغلق");
      expect(getStatusText("unknown")).toBe("unknown");
    });

    it("getCategoryText maps categories to Arabic names", () => {
      expect(getCategoryText("technical")).toBe("تقني");
      expect(getCategoryText("billing")).toBe("فواتير");
      expect(getCategoryText("inquiry")).toBe("استفسار");
    });

    it("formatFileSize formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
    });
  });

  describe("AdminTicketsSidebar Component", () => {
    it("renders ticket list and triggers search input change", () => {
      const setSearchMock = vi.fn();
      const onSelectMock = vi.fn();

      render(
        <AdminTicketsSidebar
          allTickets={[mockTicket]}
          filteredTickets={[mockTicket]}
          ticketsSearchQuery=""
          setTicketsSearchQuery={setSearchMock}
          activeTicketId="TCK-1001"
          onSelectTicket={onSelectMock}
        />
      );

      expect(screen.getByText("التذاكر")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("بحث في التذاكر...")).toBeInTheDocument();
      expect(screen.getByText("مشكلة في تسجيل الدخول")).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText("بحث في التذاكر...");
      fireEvent.change(searchInput, { target: { value: "دخول" } });
      expect(setSearchMock).toHaveBeenCalledWith("دخول");
    });
  });

  describe("UserTicketHeader Component", () => {
    it("renders ticket details and handles back navigation", () => {
      const backMock = vi.fn();

      render(
        <UserTicketHeader
          ticket={mockTicket}
          onBack={backMock}
        />
      );

      expect(screen.getByText("مشكلة في تسجيل الدخول")).toBeInTheDocument();
      expect(screen.getByText("#TCK-1001")).toBeInTheDocument();
      expect(screen.getByText("مفتوح")).toBeInTheDocument();

      const backBtn = screen.getByText("العودة إلى التذاكر");
      fireEvent.click(backBtn);
      expect(backMock).toHaveBeenCalled();
    });
  });

  describe("UserChatMessages Component", () => {
    it("renders message bubbles with correct sender types and content", () => {
      const dummyRef = { current: null };

      render(
        <UserChatMessages
          ticket={mockTicket}
          messagesEndRef={dummyRef}
          formatFileSize={formatFileSize}
        />
      );

      expect(screen.getByText("المحادثة (2)")).toBeInTheDocument();
      expect(screen.getByText("أحتاج لمساعدة عاجلة في الدخول")).toBeInTheDocument();
      expect(screen.getByText("تم التحقق وسنقوم بحل المشكلة خلال دقائق")).toBeInTheDocument();
      expect(screen.getByText("فريق الدعم")).toBeInTheDocument();
    });
  });

  describe("UserReplyForm Component", () => {
    it("allows typing and submitting reply messages", () => {
      const setMessageMock = vi.fn();
      const sendMock = vi.fn((e) => e.preventDefault());
      const uploadMock = vi.fn();
      const removeMock = vi.fn();

      render(
        <UserReplyForm
          messageContent="شكراً جزيلاً"
          setMessageContent={setMessageMock}
          error={null}
          sendingMessage={false}
          attachments={[]}
          handleSendMessage={sendMock}
          handleFileUpload={uploadMock}
          removeAttachment={removeMock}
        />
      );

      expect(screen.getByText("إضافة رد")).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText("اكتب ردك هنا...");
      fireEvent.change(textarea, { target: { value: "تعديل الرد" } });
      expect(setMessageMock).toHaveBeenCalledWith("تعديل الرد");

      const submitBtn = screen.getByText("إرسال");
      fireEvent.click(submitBtn);
      expect(sendMock).toHaveBeenCalled();
    });
  });

  describe("UserRatingCard Component", () => {
    it("allows selecting star rating and entering feedback", () => {
      const setRatingMock = vi.fn();
      const setFeedbackMock = vi.fn();
      const submitMock = vi.fn();
      const skipMock = vi.fn();

      render(
        <UserRatingCard
          rating={4}
          setRating={setRatingMock}
          feedback=""
          setFeedback={setFeedbackMock}
          submittingRating={false}
          onSkip={skipMock}
          onSubmit={submitMock}
        />
      );

      expect(screen.getByText("تقييم الخدمة")).toBeInTheDocument();

      const starButtons = screen.getAllByRole("button", { name: /تقييم \d من 5/i });
      expect(starButtons.length).toBe(5);
      fireEvent.click(starButtons[4]);
      expect(setRatingMock).toHaveBeenCalledWith(5);

      const skipBtn = screen.getByText("تخطي");
      fireEvent.click(skipBtn);
      expect(skipMock).toHaveBeenCalled();

      const submitBtn = screen.getByText("إرسال التقييم");
      fireEvent.click(submitBtn);
      expect(submitMock).toHaveBeenCalled();
    });
  });
});
