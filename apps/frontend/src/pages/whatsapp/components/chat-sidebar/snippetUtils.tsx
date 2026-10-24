import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';

export function formatMessageSnippet(content: string): string {
  if (!content) return '';
  const trimmed = content.trim();

  // Clean raw WhatsApp template identifiers / system tokens (zero emojis)
  if (/^order_created/i.test(trimmed)) {
    return 'تم إنشاء الطلب بنجاح';
  }
  if (/^order_confirm/i.test(trimmed)) {
    return 'تأكيد الطلب';
  }
  if (/^order_ship/i.test(trimmed)) {
    return 'تم شحن طلبك';
  }
  if (/^order_deliver/i.test(trimmed)) {
    return 'تم تسليم الطلب';
  }
  if (/^order_cancel/i.test(trimmed)) {
    return 'تم إلغاء الطلب';
  }
  if (/^abandoned_cart/i.test(trimmed)) {
    return 'تذكير بالسلة المتروكة';
  }
  if (/^welcome/i.test(trimmed)) {
    return 'رسالة ترحيب';
  }
  if (/^otp/i.test(trimmed) || /^verification/i.test(trimmed)) {
    return 'رمز التفعيل';
  }

  // If it's a technical slug with suffix like msix...
  if (/^[a-z0-9_]{8,}$/i.test(trimmed) && (trimmed.includes('_') || /msix/i.test(trimmed))) {
    const readable = trimmed
      .replace(/msix[a-z0-9]+/gi, '')
      .replace(/_[0-9a-f]{6,}/gi, '')
      .replace(/_/g, ' ')
      .trim();
    return readable ? readable : 'قالب واتساب';
  }

  return trimmed;
}

export function getLastMessagePreview(contact: Contact): string {
  if (contact.lastMessage?.content) {
    return formatMessageSnippet(contact.lastMessage.content);
  }

  switch (contact.lastMessage?.messageType) {
    case 'IMAGE':
      return 'صورة';
    case 'STICKER':
      return 'ملصق';
    case 'VIDEO':
      return 'فيديو';
    case 'AUDIO':
    case 'VOICE':
      return 'رسالة صوتية';
    case 'DOCUMENT':
    case 'FILE':
      return 'ملف';
    case 'LOCATION':
      return 'موقع';
    default:
      return '....';
  }
}

export function extractOrderCode(content: string | null | undefined): string | null {
  if (!content) return null;
  const match = content.match(/ORD-\d{6}-\d{3}(?:-[A-Za-z0-9]+)*/i);
  return match ? match[0] : null;
}

export function getPreviewWithoutOrderCode(
  content: string | null | undefined,
  orderCode: string,
): string {
  if (!content) return '';
  const cleaned = content
    .replace(new RegExp(orderCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return formatMessageSnippet(cleaned || 'طلب جديد');
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegex(normalizedQuery)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === normalizedQuery ? (
          <mark
            key={i}
            className="rounded-xs bg-[color:var(--color-primary)]/20 px-0.5 text-[color:var(--color-primary)]"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

export function formatTime(dateString: string | null, yesterdayText: string = 'أمس'): string {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return yesterdayText;
  }
  return format(date, 'dd/MM/yyyy');
}
