// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { VoiceNotePlayer } from "./VoiceNotePlayer";

afterEach(() => {
  cleanup();
});

describe("VoiceNotePlayer", () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it("renders with initial play button and timestamps", () => {
    render(
      <VoiceNotePlayer
        src="https://maxp.online/uploads/chat-media/2026-09-26/sample.mp4"
        messageId="msg-123"
        isCustomer={true}
      />
    );

    const playBtn = screen.getByLabelText("تشغيل الصوت");
    expect(playBtn).toBeDefined();
    expect(screen.getByText(/0:00/)).toBeDefined();
  });

  it("cleans legacy /webhooks/uploads/ URL in audio src", () => {
    const { container } = render(
      <VoiceNotePlayer
        src="https://maxp.online/webhooks/uploads/chat-media/2026-09-26/sample.mp4"
        messageId="msg-123"
      />
    );

    const audio = container.querySelector("audio");
    expect(audio?.getAttribute("src")).toBe(
      "https://maxp.online/uploads/chat-media/2026-09-26/sample.mp4"
    );
  });

  it("triggers play and broadcasts maxp:stop-other-audios event on tap", async () => {
    let capturedEvent: CustomEvent | null = null;
    const listener = (e: Event) => {
      capturedEvent = e as CustomEvent;
    };
    window.addEventListener("maxp:stop-other-audios", listener);

    render(
      <VoiceNotePlayer
        src="https://maxp.online/uploads/chat-media/2026-09-26/sample.mp4"
        messageId="msg-123"
        isCustomer={false}
      />
    );

    const playBtn = screen.getByLabelText("تشغيل الصوت");
    fireEvent.click(playBtn);

    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(capturedEvent).not.toBeNull();
    expect((capturedEvent as any)?.detail?.id).toBe("msg-123");

    window.removeEventListener("maxp:stop-other-audios", listener);
  });

  it("stops playing when another voice note starts (receives custom event)", async () => {
    const { container } = render(
      <VoiceNotePlayer
        src="https://maxp.online/uploads/chat-media/2026-09-26/sample.mp4"
        messageId="msg-123"
      />
    );

    // Simulate clicking play so audio starts and paused becomes false
    const playBtn = screen.getByLabelText("تشغيل الصوت");
    fireEvent.click(playBtn);

    const audio = container.querySelector("audio");
    if (audio) {
      Object.defineProperty(audio, "paused", {
        value: false,
        configurable: true,
        writable: true,
      });
    }

    // Simulate another audio starting
    window.dispatchEvent(
      new CustomEvent("maxp:stop-other-audios", {
        detail: { id: "msg-999" },
      })
    );

    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
