import React from "react";
import { render, screen, act } from "@testing-library/react";
import { VideoBlock } from "../explanations/VideoBlock";

const YOUTUBE_URL = "https://www.youtube.com/watch?v=1dR5payL6XA";

const emitYouTubeError = () => {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.youtube-nocookie.com",
        data: JSON.stringify({ event: "onError", info: 100 }),
      }),
    );
  });
};

describe("VideoBlock — unavailable YouTube video", () => {
  // SLUG-404-style incident: every explanation video was removed on YouTube and
  // the modal rendered a black player with the English «Video unavailable».
  it("replaces the dead player with an Arabic notice when YouTube reports onError", () => {
    render(<VideoBlock videoUrl={YOUTUBE_URL} title="الافليت والدروب شيبنج" />);

    expect(screen.getByTitle("الافليت والدروب شيبنج")).toBeInTheDocument();

    emitYouTubeError();

    expect(screen.queryByTitle("الافليت والدروب شيبنج")).not.toBeInTheDocument();
    expect(screen.getByText(/الفيديو التوضيحي مش متاح حاليًا/)).toBeInTheDocument();
    expect(screen.getByText(/الشرح المكتوب تحت كامل/)).toBeInTheDocument();
  });

  it("ignores onError messages that do not come from a YouTube origin", () => {
    render(<VideoBlock videoUrl={YOUTUBE_URL} title="شرح" />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://evil.example.com",
          data: JSON.stringify({ event: "onError", info: 100 }),
        }),
      );
    });

    expect(screen.getByTitle("شرح")).toBeInTheDocument();
    expect(screen.queryByText(/الفيديو التوضيحي مش متاح حاليًا/)).not.toBeInTheDocument();
  });

  it("requests the jsapi-enabled embed so the player reports its errors", () => {
    render(<VideoBlock videoUrl={YOUTUBE_URL} title="شرح" />);
    expect(screen.getByTitle("شرح")).toHaveAttribute(
      "src",
      expect.stringContaining("enablejsapi=1"),
    );
  });
});
