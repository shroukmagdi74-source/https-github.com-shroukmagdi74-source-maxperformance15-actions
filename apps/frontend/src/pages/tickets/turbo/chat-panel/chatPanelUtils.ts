import type { StatusBadgeInfo } from "./types";

/**
 * استخراج كافة روابط الصور والمرفقات من التذكرة أو الرد أياً كان شكلها في استجابة Turbo
 */
export const extractMediaUrls = (item: any): string[] => {
  const urls: string[] = [];
  if (!item) return urls;

  const normalizeUrl = (raw: any): string | null => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) {
      return s;
    }
    if (s.startsWith("/")) {
      return `https://backoffice.turbo-eg.com${s}`;
    }
    return `https://backoffice.turbo-eg.com/${s}`;
  };

  const addUrl = (val: any) => {
    if (!val) return;
    if (typeof val === "string") {
      const u = normalizeUrl(val);
      if (u && !urls.includes(u)) urls.push(u);
    } else if (typeof val === "object") {
      const u = normalizeUrl(val.url || val.file_url || val.path || val.media_url || val.src);
      if (u && !urls.includes(u)) urls.push(u);
    }
  };

  addUrl(item.image);
  addUrl(item.media_url);
  addUrl(item.file);
  addUrl(item.file_url);
  addUrl(item.attachment);
  addUrl(item.attachment_url);

  const mediaList = Array.isArray(item.media)
    ? item.media
    : Array.isArray(item.attachments)
    ? item.attachments
    : Array.isArray(item.images)
    ? item.images
    : [];

  mediaList.forEach(addUrl);
  return urls;
};

export const getStatusBadge = (status: any): StatusBadgeInfo => {
  let val = "";
  let label = "";

  if (status && typeof status === "object") {
    val = String(status.value || "").toLowerCase().trim();
    label = status.label || "";
  } else if (status !== undefined && status !== null) {
    val = String(status).toLowerCase().trim();
  }

  if (val === "0" || val === "open" || val === "new") {
    return {
      label: label || "جديدة",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    };
  }
  if (val === "3" || val === "on_hold" || val === "hold" || val === "pending") {
    return {
      label: label || "معلقة",
      className:
        "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
    };
  }
  if (val === "1" || val === "in_progress" || val === "processing") {
    return {
      label: label || "قيد المعالجة",
      className:
        "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
    };
  }
  if (val === "2" || val === "closed" || val === "resolved" || val === "solved") {
    return {
      label: label || "مغلقة",
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    };
  }

  if (label) {
    return {
      label,
      className:
        "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20",
    };
  }

  return {
    label: "غير محدد",
    className:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
  };
};
