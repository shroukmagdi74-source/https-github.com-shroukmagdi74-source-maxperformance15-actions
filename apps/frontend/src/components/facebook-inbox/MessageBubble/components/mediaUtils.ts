import { MediaKind, MessageAttachment } from "./types";
export {
  buildProxyImageUrl,
  getInboxExternalImageUrl,
  getInboxMessageMediaUrl,
} from "@/utils/imageUrl";

export const MEDIA_URL_TOKEN_PATTERN =
  /\s*\|(IMAGE|FILE|VIDEO|AUDIO)_URL\|[^\s|]+/gi;

export const ATTACHMENT_PLACEHOLDER_PREFIX = /^\s*\[attachment\]\s*/i;

export const GENERIC_ATTACHMENT_LABELS = new Set([
  "[attachment]",
  "attachment",
  "مرفق",
  "ملف",
  "صورة",
  "فيديو",
  "صوت",
]);

export const normalizeAttachmentType = (type?: string): string =>
  (type || "").trim().toLowerCase();

export const isPotentialMediaPath = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    /^(https?:\/\/|\/|uploads\/|assets\/|data:|blob:|api\/)/i.test(trimmed) ||
    /proxy-image/i.test(trimmed) ||
    /scontent.*?\.fbcdn\.net/i.test(trimmed) ||
    /cdn\.fbsbx\.com/i.test(trimmed) ||
    /cdninstagram\.com/i.test(trimmed) ||
    /^\/?uploads\/chat-media\//i.test(trimmed) ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|mp4|mov|webm|m4a|mp3|ogg|opus|wav|pdf)(\?.*)?$/i.test(
      trimmed
    )
  );
};

export const extractMediaTokenUrl = (
  value: string | null | undefined,
  kind: MediaKind
): string => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const token = kind.toUpperCase();
  const match = value.match(new RegExp(`\\|${token}_URL\\|([^\\s|]+)`, "i"));
  return match?.[1]?.trim() || "";
};

export const getDirectMediaUrl = (
  kind: MediaKind,
  ...values: Array<string | null | undefined>
): string => {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    const tokenUrl = extractMediaTokenUrl(value, kind);
    if (tokenUrl) {
      return tokenUrl;
    }

    const trimmed = value.trim();
    if (isPotentialMediaPath(trimmed)) {
      return trimmed;
    }
  }

  return "";
};

export const getAttachmentRawUrl = (attachment: MessageAttachment): string => {
  const candidates = [
    attachment.url,
    attachment.file_url,
    attachment.image_data?.url,
    attachment.payload?.url,
    attachment.payload?.image_url,
    attachment.image_url,
  ];

  // Prioritize local archived files (/uploads/ or /assets/) over expiring Facebook CDN links
  const localCandidate = candidates.find(
    (c) =>
      typeof c === "string" &&
      (c.startsWith("/uploads/") ||
        c.includes("/uploads/chat-media/") ||
        c.startsWith("/assets/"))
  );
  if (localCandidate) {
    return localCandidate.trim();
  }

  return (
    candidates.find((candidate) => typeof candidate === "string" && candidate.trim())
      ?.trim() || ""
  );
};

export const getAttachmentMediaUrl = (
  attachment: MessageAttachment,
  kind: MediaKind
): string => {
  const attachmentType = normalizeAttachmentType(attachment.type);
  const mimeType = normalizeAttachmentType(attachment.mime_type);
  const rawUrl = getAttachmentRawUrl(attachment);

  if (!rawUrl) {
    return "";
  }

  if (kind === "image") {
    const isImage =
      ["image", "animated_image", "sticker"].includes(attachmentType) ||
      mimeType.startsWith("image/") ||
      Boolean(attachment.image_data?.url);
    return isImage ? rawUrl : "";
  }

  if (kind === "video") {
    return attachmentType === "video" || mimeType.startsWith("video/")
      ? rawUrl
      : "";
  }

  if (kind === "audio") {
    const isAudioUrl =
      /\.(mp3|m4a|aac|ogg|oga|opus|wav|weba|webm)(\?.*)?$/i.test(rawUrl) ||
      /audioclip/i.test(rawUrl);
    return attachmentType === "audio" ||
      attachmentType === "voice" ||
      attachmentType === "audio_clip" ||
      mimeType.startsWith("audio/") ||
      isAudioUrl
      ? rawUrl
      : "";
  }

  return attachmentType === "file" || (!attachmentType && !mimeType)
    ? rawUrl
    : "";
};

export const uniqueUrls = (urls: string[]): string[] => {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const normalized = url.trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

export const getDisplayTextContent = (
  content: string,
  options: {
    hasRenderedMedia: boolean;
  }
): string => {
  if (!content) {
    return "";
  }

  // Strip leading internal Meta template slugs
  const strippedTemplate = content
    .replace(/^(?:Template:\s*)?[a-z0-9_]{10,}(?:\r?\n)+/i, "")
    .trim();

  const withoutMediaTokens = strippedTemplate
    .replace(MEDIA_URL_TOKEN_PATTERN, "")
    .trim();
  const hasQueuePlaceholders = /\[\d+\]|\[attachment\]/i.test(
    withoutMediaTokens
  );
  const withoutAttachmentPlaceholders = hasQueuePlaceholders
    ? withoutMediaTokens
        .replace(/\[\d+\]\s*/g, "")
        .replace(/\[attachment\]\s*/gi, "")
        .replace(/\s*\|\s*/g, " ")
        .trim()
    : withoutMediaTokens;
  const withoutAttachmentPrefix = withoutAttachmentPlaceholders
    .replace(ATTACHMENT_PLACEHOLDER_PREFIX, "")
    .trim();

  if (!withoutAttachmentPrefix) {
    return "";
  }

  // Never display internal proxy-image URLs as text
  if (
    withoutAttachmentPrefix.includes("proxy-image") ||
    /^\/?api\/v1\/proxy-image/i.test(withoutAttachmentPrefix)
  ) {
    return "";
  }

  if (
    options.hasRenderedMedia &&
    (isPotentialMediaPath(withoutAttachmentPrefix) ||
      withoutAttachmentPrefix.includes("proxy-image") ||
      /^\/?api\//i.test(withoutAttachmentPrefix) ||
      GENERIC_ATTACHMENT_LABELS.has(withoutAttachmentPrefix.toLowerCase()))
  ) {
    return "";
  }

  return withoutAttachmentPrefix;
};

export const formatTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const diffDays = Math.floor(
    (today.getTime() - msgDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = messageDate.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    calendar: "gregory",
  });

  if (diffDays === 0) {
    return timeStr;
  } else if (diffDays === 1) {
    return `أمس ${timeStr}`;
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString("ar-EG", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    });
  } else {
    return messageDate.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    });
  }
};

export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
