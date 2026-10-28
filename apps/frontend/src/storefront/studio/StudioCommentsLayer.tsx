import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChatBubbleLeftEllipsisIcon,
  ChatBubbleLeftIcon,
  QueueListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { StudioComment, StudioCommentAnchor } from "./StudioTypes";
import {
  computeCommentAnchor,
  countOpenComments,
  STUDIO_ANONYMOUS_AUTHOR,
  type StudioSectionRect,
} from "./utils/studioComments";

/**
 * CMT-1 — طبقة التعليقات على الكانفس (محرر المتجر فقط).
 * زر «تعليق» يفعّل وضع التعليق → كليك على قسم → مربع تعليق مثبّت على القسم + شارة عدد.
 * الطبقة لا تُرندر أبداً في المتجر العام: لا يستوردها أي مسار عام.
 */

export interface StudioCommentSectionTarget {
  key: string;
  label: string;
}

export interface StudioCommentDraftInput {
  sectionKey: string | null;
  anchor?: StudioCommentAnchor;
  text: string;
}

interface StudioCommentsLayerProps {
  pageKey: string;
  sections: StudioCommentSectionTarget[];
  comments: StudioComment[];
  canComment?: boolean;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
  onOpenPanel: () => void;
  onAddComment: (input: StudioCommentDraftInput) => void;
}

interface CommentDraftTarget {
  sectionKey: string | null;
  anchor?: StudioCommentAnchor;
}

const EMPTY_RECT: StudioSectionRect = { top: 0, left: 0, width: 0, height: 0 };

const getPinPosition = (
  rect: StudioSectionRect,
  anchor?: StudioCommentAnchor,
): { top: number; left: number } => {
  const x = anchor && Number.isFinite(anchor.x) ? Math.min(100, Math.max(0, anchor.x)) : 92;
  const y = anchor && Number.isFinite(anchor.y) ? Math.min(100, Math.max(0, anchor.y)) : 6;
  return {
    top: Math.round(rect.top + (rect.height * y) / 100),
    left: Math.round(rect.left + (rect.width * x) / 100),
  };
};

export const StudioCommentsLayer: React.FC<StudioCommentsLayerProps> = ({
  pageKey,
  sections,
  comments,
  canComment = true,
  isActive,
  onToggleActive,
  onOpenPanel,
  onAddComment,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<CommentDraftTarget | null>(null);
  const [text, setText] = useState<string>("");
  const [rects, setRects] = useState<Record<string, StudioSectionRect>>({});

  const pageComments = useMemo(
    () =>
      Array.isArray(comments)
        ? comments.filter((comment) => comment.pageKey === pageKey)
        : [],
    [comments, pageKey],
  );
  const openComments = useMemo(
    () => pageComments.filter((comment) => !comment.resolved),
    [pageComments],
  );
  const openCount = useMemo(
    () => countOpenComments(comments, pageKey),
    [comments, pageKey],
  );
  const sectionLabelByKey = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((section) => map.set(section.key, section.label));
    return map;
  }, [sections]);

  const measureSections = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const base = root.getBoundingClientRect();
    const next: Record<string, StudioSectionRect> = {};
    sections.forEach((section) => {
      const matches = root.parentElement
        ? root.parentElement.querySelectorAll<HTMLElement>(
            "[data-studio-touch-section], [data-section-key]",
          )
        : null;
      let element: HTMLElement | null = null;
      if (matches) {
        for (let index = 0; index < matches.length; index += 1) {
          const node = matches[index];
          if (!node) continue;
          const nodeKey =
            node.getAttribute("data-studio-touch-section") ||
            node.getAttribute("data-section-key");
          if (nodeKey === section.key) {
            element = node;
            break;
          }
        }
      }
      if (!element) return;
      const rect = element.getBoundingClientRect();
      next[section.key] = {
        top: rect.top - base.top,
        left: rect.left - base.left,
        width: rect.width,
        height: rect.height,
      };
    });
    setRects(next);
  }, [sections]);

  useEffect(() => {
    measureSections();
    if (typeof window === "undefined") return undefined;
    const frame =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(measureSections)
        : undefined;
    window.addEventListener("resize", measureSections);
    return () => {
      if (typeof frame === "number" && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("resize", measureSections);
    };
  }, [measureSections, pageComments.length, isActive]);

  useEffect(() => {
    if (!isActive) setDraft(null);
  }, [isActive]);

  useEffect(() => {
    if (!draft || typeof document === "undefined") return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDraft(null);
        setText("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [draft]);

  useEffect(() => {
    if (!isActive || !canComment) return undefined;
    if (typeof document === "undefined") return undefined;

    const handleCanvasClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || typeof target.closest !== "function") return;
      if (target.closest('[data-studio-comments-ui="true"]')) return;

      const section = target.closest<HTMLElement>(
        "[data-studio-touch-section], [data-section-key]",
      );
      const sectionKey = section
        ? section.getAttribute("data-studio-touch-section") ||
          section.getAttribute("data-section-key")
        : null;
      if (!section || !sectionKey) return;

      // منع تحديد/تحريك القسم أثناء وضع التعليق (الحدث في مرحلة capture).
      event.preventDefault();
      event.stopPropagation();
      const rect = section.getBoundingClientRect();
      setDraft({
        sectionKey,
        anchor: computeCommentAnchor(event, rect),
      });
      setText("");
    };

    document.addEventListener("click", handleCanvasClick, true);
    return () => document.removeEventListener("click", handleCanvasClick, true);
  }, [isActive, canComment]);

  const handleToggle = () => {
    if (!canComment) return;
    onToggleActive(!isActive);
  };

  const handleOpenPageDraft = () => {
    setDraft({ sectionKey: null, anchor: undefined });
    setText("");
  };

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const value = text.trim();
    if (!value || !draft || !canComment) return;
    onAddComment({
      sectionKey: draft.sectionKey,
      anchor: draft.anchor,
      text: value,
    });
    setText("");
    setDraft(null);
  };

  const draftLabel = draft?.sectionKey
    ? sectionLabelByKey.get(draft.sectionKey) || draft.sectionKey
    : "الصفحة كاملة";
  const draftRect = draft?.sectionKey
    ? rects[draft.sectionKey] || EMPTY_RECT
    : EMPTY_RECT;
  const draftTop = draft?.sectionKey ? Math.round(draftRect.top + 8) : 56;
  const draftLeft = draft?.sectionKey
    ? Math.max(8, Math.round(draftRect.left + Math.max(draftRect.width - 300, 0)))
    : 56;

  return (
    <div
      ref={rootRef}
      data-studio-comments-ui="true"
      data-studio-comment-layer="true"
      data-comment-page={pageKey}
      className="pointer-events-none absolute inset-0 z-40"
    >
      {/* شريط الأدوات العائم */}
      <div className="pointer-events-auto absolute top-2 start-2 flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-1 rounded-full border border-[#333742] bg-[#181a20]/95 p-1 text-[11px] text-[#e8eaee] shadow-xl ring-1 ring-black/40 backdrop-blur">
          <button
            type="button"
            data-testid="studio-comment-toggle"
            data-studio-comment-item="toggle"
            onClick={handleToggle}
            aria-pressed={isActive}
            disabled={!canComment}
            title={
              canComment
                ? "وضع التعليق: اضغط على قسم لإضافة تعليق"
                : "ليس لديك صلاحية إضافة تعليقات"
            }
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition-colors ${
              isActive
                ? "bg-[#2b6cf6] text-white shadow"
                : "bg-transparent text-[#c3c7cd] hover:bg-[#23262d] hover:text-white"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
            {isActive ? "إلغاء وضع التعليق" : "تعليق"}
          </button>

          <span
            data-testid="studio-comment-badge"
            data-count={openCount}
            title={`${openCount} تعليق مفتوح`}
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold ${
              openCount > 0
                ? "bg-[#f59e0b] text-[#1b1c20]"
                : "bg-[#2a2d34] text-[#8b919b]"
            }`}
          >
            {openCount}
          </span>

          <button
            type="button"
            data-testid="studio-comments-open-panel"
            onClick={onOpenPanel}
            title="كل التعليقات (مفتوح/محلول)"
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[#c3c7cd] transition-colors hover:bg-[#23262d] hover:text-white"
          >
            <QueueListIcon className="h-3.5 w-3.5" />
            كل التعليقات
          </button>
        </div>

        {isActive && canComment && (
          <div
            data-testid="studio-comment-mode-hint"
            className="flex items-center gap-1 rounded-lg border border-[#2b6cf6]/40 bg-[#2b6cf6]/15 px-2 py-1 text-[10px] font-medium text-[#bcd0ff] shadow"
          >
            <ChatBubbleLeftEllipsisIcon className="h-3 w-3" />
            اضغط على أي قسم لإضافة تعليق
            <button
              type="button"
              data-testid="studio-comment-page-target"
              onClick={handleOpenPageDraft}
              className="rounded bg-[#2b6cf6] px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-[#1d5ce6]"
            >
              علّق على الصفحة
            </button>
          </div>
        )}
      </div>

      {/* دبابيس التعليقات المفتوحة على الأقسام */}
      {openComments.map((comment) => {
        if (!comment.sectionKey) return null;
        const position = getPinPosition(
          rects[comment.sectionKey] || EMPTY_RECT,
          comment.anchor,
        );
        const author = comment.author || STUDIO_ANONYMOUS_AUTHOR;
        return (
          <button
            key={comment.id}
            type="button"
            data-testid={`studio-comment-pin-${comment.id}`}
            data-studio-comment-item="pin"
            data-comment-id={comment.id}
            data-comment-section={comment.sectionKey}
            onClick={onOpenPanel}
            title={`${author}: ${comment.text}`}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            className="pointer-events-auto absolute z-40 flex max-w-[190px] -translate-x-1/2 items-center gap-1 rounded-full border border-[#f59e0b] bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold text-[#7c2d12] shadow-lg transition-transform hover:scale-105"
          >
            <ChatBubbleLeftIcon className="h-3 w-3" />
            <span className="truncate">{comment.text}</span>
          </button>
        );
      })}

      {/* مربع تعليق مثبّت على القسم */}
      {draft && (
        <form
          onSubmit={handleSubmit}
          data-testid="studio-comment-form"
          data-studio-comment-item="form"
          style={{ top: `${draftTop}px`, left: `${draftLeft}px` }}
          className="pointer-events-auto absolute z-50 w-[300px] max-w-[calc(100%-1rem)] rounded-xl border border-[#333742] bg-[#181a20]/97 p-2.5 text-[11px] text-[#e8eaee] shadow-2xl ring-1 ring-black/40 backdrop-blur-md"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="truncate font-semibold text-[#c3c7cd]">
              تعليق على:{" "}
              <span data-testid="studio-comment-form-target" className="text-white">
                {draftLabel}
              </span>
            </span>
            <button
              type="button"
              data-testid="studio-comment-cancel"
              onClick={() => {
                setDraft(null);
                setText("");
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#808791] hover:bg-[#202226] hover:text-white"
              title="إلغاء (Esc)"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <textarea
            data-testid="studio-comment-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={2000}
            autoFocus
            placeholder="اكتب ملاحظتك على هذا القسم..."
            className="w-full resize-none rounded-lg border border-[#333742] bg-[#121418] p-2 text-[11px] text-white placeholder-[#6c727d] focus:border-[#2b6cf6] focus:outline-none focus:ring-1 focus:ring-[#2b6cf6]"
          />

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="text-[9px] text-[#6c727d]">الاسم فقط — بدون بريد أو هاتف</span>
            <button
              type="submit"
              data-testid="studio-comment-submit"
              disabled={!text.trim() || !canComment}
              className="rounded-lg bg-[#2b6cf6] px-2.5 py-1 text-[11px] font-bold text-white shadow transition-colors hover:bg-[#1d5ce6] disabled:cursor-not-allowed disabled:opacity-40"
            >
              إضافة التعليق
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
