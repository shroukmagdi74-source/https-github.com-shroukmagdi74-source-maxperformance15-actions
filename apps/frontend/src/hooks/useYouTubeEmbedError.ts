import { useEffect, useRef, useState } from "react";

const YOUTUBE_ORIGIN_RE = /^https:\/\/(www\.)?youtube(-nocookie)?\.com$/;

/**
 * Tracks whether a YouTube embed failed to become playable.
 *
 * A removed / private / embedding-disabled video keeps rendering a black player
 * with the English «Video unavailable» banner. With `enablejsapi=1` in the embed
 * URL the player reports those cases as an `onError` message, which lets the
 * caller replace the dead frame with a localised notice (the written content
 * stays the source of truth).
 */
export const useYouTubeEmbedError = (embedUrl: string | null | undefined) => {
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setFailed(false);
    if (!embedUrl || typeof window === "undefined") return;

    const onMessage = (event: MessageEvent) => {
      if (!YOUTUBE_ORIGIN_RE.test(event.origin || "")) return;
      let payload: unknown = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }
      if (
        payload &&
        typeof payload === "object" &&
        (payload as { event?: string }).event === "onError"
      ) {
        setFailed(true);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embedUrl]);

  /** The player only broadcasts once the parent says it is listening. */
  const handshake = () => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: iframeRef.current.id }),
        "*",
      );
    } catch {
      // cross-origin / jsdom — the error listener stays the only signal
    }
  };

  return { failed, iframeRef, handshake };
};
