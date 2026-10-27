// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import {
  stripBaileysButtonBox,
  sanitizeInteractiveUrl,
  shouldShowDateSeparator,
} from "../message-bubble/messageBubbleUtils";
import { MessageStatusIcon } from "../message-bubble/MessageStatusIcon";
import { MessageDateSeparator } from "../message-bubble/MessageDateSeparator";
import { MessageReactionsPill } from "../message-bubble/MessageReactionsPill";
import { MessageCorrectionEditor } from "../message-bubble/MessageCorrectionEditor";
import { TemplateMessageContent } from "../message-bubble/TemplateMessageContent";
import { InteractivePollContent } from "../message-bubble/InteractivePollContent";
import type { Message } from "../../../../hooks/useWhatsAppQueries";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("messageBubbleUtils", () => {
  it("strips Baileys button box and footer properly", () => {
    const raw = "مرحباً بك في سوان\n┌───────\n[زر]";
    expect(stripBaileysButtonBox(raw)).toBe("مرحباً بك في سوان");

    const withFooter = "نص الرسالة\n_كود الخصم_\n┌───";
    expect(stripBaileysButtonBox(withFooter, "كود الخصم")).toBe("نص الرسالة");
  });

  it("sanitizes interactive urls", () => {
    expect(sanitizeInteractiveUrl("https://swan.maxp.online")).toBe("https://swan.maxp.online");
    expect(sanitizeInteractiveUrl("tel:01012345678")).toBe("tel:01012345678");
    expect(sanitizeInteractiveUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeInteractiveUrl(null)).toBeNull();
  });

  it("checks date separator requirement", () => {
    const msg1: Message = {
      id: "1",
      messageId: "m1",
      sessionId: "s1",
      chatId: "c1",
      fromMe: true,
      content: "msg 1",
      timestamp: "2026-10-25T10:00:00Z",
      status: "SENT",
      isGroup: false,
    };
    const msg2: Message = {
      ...msg1,
      id: "2",
      messageId: "m2",
      timestamp: "2026-10-26T10:00:00Z",
    };
    expect(shouldShowDateSeparator(msg1, undefined)).toBe(true);
    expect(shouldShowDateSeparator(msg2, msg1)).toBe(true);
    expect(shouldShowDateSeparator(msg1, msg1)).toBe(false);
  });
});

describe("MessageStatusIcon", () => {
  it("renders status icons without crashing", () => {
    const { container: sentCont } = render(<MessageStatusIcon status="SENT" />);
    expect(sentCont.querySelector("svg")).toBeInTheDocument();

    const { container: readCont } = render(<MessageStatusIcon status="READ" />);
    expect(readCont.querySelector(".text-sky-500")).toBeInTheDocument();

    const { container: errCont } = render(<MessageStatusIcon status="ERROR" />);
    expect(errCont.querySelector(".text-rose-500")).toBeInTheDocument();
  });
});

describe("MessageDateSeparator", () => {
  it("renders formatted date separator", () => {
    render(<MessageDateSeparator timestamp="2026-10-20T12:00:00Z" />);
    expect(screen.getByText("20/10/2026")).toBeInTheDocument();
  });
});

describe("MessageReactionsPill", () => {
  it("renders reactions counts and handles click", () => {
    const onPillClick = vi.fn();
    const pillRef = { current: null };

    render(
      <MessageReactionsPill
        reactionCounts={{ "❤️": 3, "👍": 1 }}
        totalReactionCount={4}
        myReaction="❤️"
        reactorDescriptions={["أنت: ❤️", "العميل: 👍"]}
        isFromMe={true}
        onPillClick={onPillClick}
        onPillKeyDown={vi.fn()}
        pillRef={pillRef}
      />
    );

    expect(screen.getByText("❤️")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("👍")).toBeInTheDocument();

    const pill = screen.getByRole("button");
    fireEvent.click(pill);
    expect(onPillClick).toHaveBeenCalled();
  });
});

describe("MessageCorrectionEditor", () => {
  it("renders correction editor for AI messages and submits", () => {
    const setCorrectionText = vi.fn();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <MessageCorrectionEditor
        isEditing={true}
        isAI={true}
        isFromMe={true}
        correctionText="تصحيح الرد"
        setCorrectionText={setCorrectionText}
        saving={false}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("تصحيح رد الوكيل:")).toBeInTheDocument();
    const saveBtn = screen.getByText("حفظ وتصحيح");
    fireEvent.click(saveBtn);
    expect(onSubmit).toHaveBeenCalled();

    const cancelBtn = screen.getByText("إلغاء");
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("TemplateMessageContent", () => {
  it("renders template badge and text", () => {
    const msg: Message = {
      id: "1",
      messageId: "m1",
      sessionId: "s1",
      chatId: "c1",
      fromMe: true,
      content: "أهلاً بك في متجرنا",
      timestamp: "2026-10-27T10:00:00Z",
      status: "SENT",
      isGroup: false,
      messageType: "TEMPLATE",
      interactiveData: JSON.stringify({ templateName: "welcome_offer" }),
    };

    render(
      <TemplateMessageContent
        message={msg}
        effectiveMediaUrl={null}
        onOpenPreview={vi.fn()}
        renderButtonsBlock={() => <div data-testid="btns">Buttons</div>}
      />
    );

    expect(screen.getByText("welcome_offer")).toBeInTheDocument();
    expect(screen.getByText("أهلاً بك في متجرنا")).toBeInTheDocument();
    expect(screen.getByTestId("btns")).toBeInTheDocument();
  });
});

describe("InteractivePollContent", () => {
  it("renders poll options with percentages", () => {
    const pollMsg: Message = {
      id: "p1",
      messageId: "pm1",
      sessionId: "s1",
      chatId: "c1",
      fromMe: false,
      timestamp: "2026-10-27T10:00:00Z",
      status: "READ",
      isGroup: false,
      messageType: "POLL",
      interactiveData: JSON.stringify({
        name: "ما هو مقاسك المفضل؟",
        values: ["Small", "Medium", "Large"],
        votes: [{ name: "Medium", voters: ["user1", "user2"] }],
      }),
    };

    render(
      <InteractivePollContent
        message={pollMsg}
        copiedCode={null}
        onCopyCode={vi.fn()}
        renderButtonsBlock={() => null}
      />
    );

    expect(screen.getByText("ما هو مقاسك المفضل؟")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });
});
