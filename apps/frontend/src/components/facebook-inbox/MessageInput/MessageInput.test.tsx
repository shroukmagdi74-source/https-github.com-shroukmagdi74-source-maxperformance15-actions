// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import MessageInput from "./MessageInput";

const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn();
const mockClearBlobUrl = vi.fn();

vi.mock("../../../hooks/useAudioRecorder", () => ({
  useAudioRecorder: () => ({
    status: "idle",
    startRecording: mockStartRecording,
    stopRecording: mockStopRecording,
    mediaBlobUrl: null,
    clearBlobUrl: mockClearBlobUrl,
    error: null,
  }),
}));

vi.mock("emoji-picker-react", () => ({
  default: function MockEmojiPicker() {
    return <div data-testid="emoji-picker" />;
  },
}));

vi.mock("../QuickReplyDropdown/QuickReplyDropdown", () => ({
  default: function MockQuickReplyDropdown() {
    return <div data-testid="quick-reply-dropdown" />;
  },
}));

describe("MessageInput - Modular Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders exactly one voice recording button when input is empty and onSendFile is provided", () => {
    render(
      <MessageInput
        onSendMessage={vi.fn()}
        onSendFile={vi.fn()}
      />
    );

    // There should be only one button with title "تسجيل رسالة صوتية"
    const micButtons = screen.getAllByTitle("تسجيل رسالة صوتية");
    expect(micButtons).toHaveLength(1);

    // Click to start recording
    fireEvent.click(micButtons[0]);
    expect(mockStartRecording).toHaveBeenCalledTimes(1);
  });

  it("switches to send button when message text is entered", () => {
    render(
      <MessageInput
        onSendMessage={vi.fn()}
        onSendFile={vi.fn()}
      />
    );

    // Initially 1 mic button
    expect(screen.queryAllByTitle("تسجيل رسالة صوتية")).toHaveLength(1);
    expect(screen.queryByTitle("إرسال")).toBeNull();

    // Type a message
    const textarea = screen.getByPlaceholderText(/اكتب رسالة/i);
    fireEvent.change(textarea, { target: { value: "مرحبا" } });

    // Mic button is gone, send button is visible
    expect(screen.queryByTitle("تسجيل رسالة صوتية")).toBeNull();
    expect(screen.getByTitle("إرسال")).toBeDefined();
  });

  it("renders desktop and mobile tools when callbacks provided", () => {
    const onOpenImg = vi.fn();
    const onOpenTxt = vi.fn();
    const onOpenProd = vi.fn();

    render(
      <MessageInput
        onSendMessage={vi.fn()}
        onOpenImageGallery={onOpenImg}
        onOpenTextGallery={onOpenTxt}
        onOpenProductPicker={onOpenProd}
      />
    );

    expect(screen.getByTitle("حافظة النصوص المحفوظة")).toBeDefined();
    expect(screen.getByTitle("حافظة الصور المحفوظة")).toBeDefined();
    expect(screen.getByTitle("اختيار منتج من المتجر")).toBeDefined();

    fireEvent.click(screen.getByTitle("حافظة النصوص المحفوظة"));
    expect(onOpenTxt).toHaveBeenCalled();
  });

  it("renders reply preview banner when replyTo is set and handles cancel", () => {
    const onCancel = vi.fn();
    render(
      <MessageInput
        onSendMessage={vi.fn()}
        replyTo={{
          senderName: "أحمد علي",
          content: "هل المنتج متوفر؟",
        }}
        onCancelReply={onCancel}
      />
    );

    expect(screen.getByText(/الرد على أحمد علي:/)).toBeDefined();
    expect(screen.getByText("هل المنتج متوفر؟")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "إلغاء الرد" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
