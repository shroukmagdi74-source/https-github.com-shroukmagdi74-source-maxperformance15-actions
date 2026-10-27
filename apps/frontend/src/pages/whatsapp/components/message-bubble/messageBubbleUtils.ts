import type { Message } from "../../../../hooks/useWhatsAppQueries";

export function stripBaileysButtonBox(content: string, footer?: string | null): string {
  if (!content) return content;
  let result = content;
  const boxIdx = result.indexOf("┌");
  if (boxIdx !== -1) {
    result = result.slice(0, boxIdx).replace(/\s*\n+$/, "");
  }
  if (footer) {
    const marker = `_${footer}_`;
    const fIdx = result.lastIndexOf(marker);
    if (fIdx !== -1) {
      result = result.slice(0, fIdx).replace(/\s*\n+$/, "");
    }
  }
  return result.trim();
}

export function sanitizeInteractiveUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export function shouldShowDateSeparator(
  currentMessage: Message,
  previousMessage: Message | undefined,
): boolean {
  if (!previousMessage) {
    return true;
  }

  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();
  return currentDate !== previousDate;
}
