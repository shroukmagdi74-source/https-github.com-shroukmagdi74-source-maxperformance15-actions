import type { Chat } from "./types";

export interface CachedMediaItem {
  blobUrl: string;
  mimeType: string;
  timestamp: number;
}

// Media cache to avoid re-downloading the same media
export const mediaCache = new Map<string, CachedMediaItem>();
export const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minutes

// Cleanup old cache entries periodically (singleton, runs once)
let _cacheCleanupStarted = false;
if (typeof window !== "undefined" && !_cacheCleanupStarted) {
  _cacheCleanupStarted = true;
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, value] of mediaCache.entries()) {
        if (now - value.timestamp > CACHE_MAX_AGE) {
          try {
            URL.revokeObjectURL(value.blobUrl);
          } catch {
            // Ignore url revocation errors in test environments
          }
          mediaCache.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );
}

export const buildChatReferencePayload = (chat?: Chat | null) => {
  if (!chat) return {};

  return {
    chatId: chat.id,
    peerType: chat.peerType,
    accessHash: chat.accessHash,
    inputPeer: chat.inputPeer || undefined,
  };
};

export const buildChatReferenceQuery = (chat?: Chat | null) => {
  const payload = buildChatReferencePayload(chat);
  return {
    ...payload,
    inputPeer:
      payload.inputPeer && typeof payload.inputPeer === "object"
        ? JSON.stringify(payload.inputPeer)
        : payload.inputPeer,
  };
};

export const getMediaType = (media: any): string => {
  if (!media || typeof media !== "object") return "unknown";
  const type = media.type || "";
  if (type.includes("Photo") || type === "MessageMediaPhoto") return "image";
  if (type.includes("Video") || type === "MessageMediaVideo") return "video";
  if (type.includes("Document") || type === "MessageMediaDocument")
    return "document";
  if (type.includes("Audio") || type === "MessageMediaAudio") return "audio";
  if (type.includes("WebPage")) return "webpage";
  return "unknown";
};
