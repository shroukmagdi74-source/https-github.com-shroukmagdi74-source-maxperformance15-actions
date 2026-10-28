import React, { useMemo } from "react";
import {
  ArrowUturnLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  MapPinIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { StudioComment } from "./StudioTypes";
import {
  formatStudioCommentDate,
  getPageComments,
  isCommentOnDeletedSection,
} from "./utils/studioComments";

/**
 * CMT-1 — بانل كل التعليقات (مفتوح/محلول) داخل المحرر فقط.
 * «انتقل للقسم» + حل/إعادة فتح/حذف. التعليقات المرتبطة بأقسام محذوفة لا تكسر الصفحة
 * وتظهر بوسم «معلّق على قسم محذوف».
 */

interface StudioCommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: StudioComment[];
  activePageKey: string;
  pageSectionKeys?: Record<string, string[]>;
  sectionLabels?: Record<string, string>;
  canEdit?: boolean;
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (comment: StudioComment) => void;
}

interface CommentRowProps {
  comment: StudioComment;
  label: string | null;
  orphan: boolean;
  canEdit: boolean;
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (comment: StudioComment) => void;
}

const CommentRow: React.FC<CommentRowProps> = ({
  comment,
  label,
  orphan,
  canEdit,
  onResolve,
  onReopen,
  onDelete,
  onNavigate,
}) => {
  const createdAt = formatStudioCommentDate(comment.createdAt);
  return (
    <li
      data-testid={`studio-comment-item-${comment.id}`}
      data-studio-comment-item="row"
      data-comment-id={comment.id}
      data-comment-resolved={comment.resolved ? "true" : "false"}
      className={`rounded-xl border p-2.5 text-[11px] shadow-sm ${
        comment.resolved
          ? "border-[#2a2d34] bg-[#1b1d22]/80 text-[#9aa0a9]"
          : "border-[#333742] bg-[#1f2229] text-[#e8eaee]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words leading-relaxed">
          {comment.text}
        </p>
        <span className="shrink-0 rounded-full bg-[#2a2d34] px-1.5 py-0.5 text-[9px] text-[#b9bec7]">
          {comment.author}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-[#7d838d]">
        {createdAt && <span>{createdAt}</span>}
        <span>•</span>
        <span>{comment.pageKey}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
        {orphan ? (
          <span
            data-testid={`studio-comment-orphan-${comment.id}`}
            className="rounded-md border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#fbbf24]"
          >
            معلّق على قسم محذوف
          </span>
        ) : comment.sectionKey ? (
          <button
            type="button"
            data-testid={`studio-comment-goto-${comment.id}`}
            onClick={() => onNavigate(comment)}
            className="flex items-center gap-1 rounded-md border border-[#333742] bg-[#23262d] px-1.5 py-0.5 text-[10px] font-semibold text-[#c3c7cd] transition-colors hover:bg-[#2b2f38] hover:text-white"
            title="انتقل للقسم في الكانفس"
          >
            <MapPinIcon className="h-3 w-3" />
            {label || comment.sectionKey}
          </button>
        ) : (
          <span className="rounded-md border border-[#333742] bg-[#23262d] px-1.5 py-0.5 text-[10px] text-[#9aa0a9]">
            تعليق على الصفحة
          </span>
        )}

        <div className="flex items-center gap-1">
          {canEdit &&
            (comment.resolved ? (
              <button
                type="button"
                data-testid={`studio-comment-reopen-${comment.id}`}
                onClick={() => onReopen(comment.id)}
                className="flex items-center gap-1 rounded-md border border-[#333742] bg-[#23262d] px-1.5 py-0.5 text-[10px] font-semibold text-[#c3c7cd] transition-colors hover:bg-[#2b2f38] hover:text-white"
                title="إعادة فتح التعليق"
              >
                <ArrowUturnLeftIcon className="h-3 w-3" />
                إعادة فتح
              </button>
            ) : (
              <button
                type="button"
                data-testid={`studio-comment-resolve-${comment.id}`}
                onClick={() => onResolve(comment.id)}
                className="flex items-center gap-1 rounded-md border border-[#22c55e]/40 bg-[#22c55e]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#4ade80] transition-colors hover:bg-[#22c55e]/20"
                title="حل التعليق"
              >
                <CheckIcon className="h-3 w-3" />
                حل
              </button>
            ))}

          {canEdit && (
            <button
              type="button"
              data-testid={`studio-comment-delete-${comment.id}`}
              onClick={() => onDelete(comment.id)}
              className="flex items-center justify-center rounded-md border border-[#333742] bg-[#23262d] p-1 text-[#9aa0a9] transition-colors hover:border-[#ef4444]/50 hover:bg-[#ef4444]/10 hover:text-[#f87171]"
              title="حذف التعليق"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export const StudioCommentsPanel: React.FC<StudioCommentsPanelProps> = ({
  isOpen,
  onClose,
  comments,
  activePageKey,
  pageSectionKeys,
  sectionLabels,
  canEdit = true,
  onResolve,
  onReopen,
  onDelete,
  onNavigate,
}) => {
  const pageComments = useMemo(
    () => getPageComments(comments, activePageKey),
    [comments, activePageKey],
  );
  const openComments = useMemo(
    () => pageComments.filter((comment) => !comment.resolved),
    [pageComments],
  );
  const resolvedComments = useMemo(
    () => pageComments.filter((comment) => comment.resolved),
    [pageComments],
  );
  const currentPageKeys = pageSectionKeys ? pageSectionKeys[activePageKey] : undefined;

  if (!isOpen) return null;

  const renderRow = (comment: StudioComment) => {
    const orphan = isCommentOnDeletedSection(comment, currentPageKeys);
    const label = comment.sectionKey
      ? sectionLabels?.[`${comment.pageKey}::${comment.sectionKey}`] || null
      : null;
    return (
      <CommentRow
        key={comment.id}
        comment={comment}
        label={label}
        orphan={orphan}
        canEdit={canEdit}
        onResolve={onResolve}
        onReopen={onReopen}
        onDelete={onDelete}
        onNavigate={onNavigate}
      />
    );
  };

  return (
    <aside
      data-testid="studio-comments-panel"
      data-studio-comment-item="panel"
      aria-label="كل التعليقات"
      className="absolute top-14 bottom-3 end-3 z-[120] flex w-[340px] max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-[#333742] bg-[#17191f]/97 text-[#e8eaee] shadow-2xl ring-1 ring-black/50 backdrop-blur-md"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[#2a2d34] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#7fa6ff]">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <h2 className="text-xs font-bold">التعليقات</h2>
            <p className="text-[10px] text-[#7d838d]">
              {openComments.length} مفتوح · {resolvedComments.length} محلول
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="studio-comments-panel-close"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[#808791] transition-colors hover:bg-[#202226] hover:text-white"
          title="إغلاق"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-2.5 [scrollbar-width:thin]">
        <section data-testid="studio-comments-open-group">
          <h3 className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-[#8b919b]">
            مفتوح
            <span
              data-testid="studio-comments-open-count"
              className="rounded-full bg-[#f59e0b]/20 px-1.5 text-[10px] font-bold text-[#fbbf24]"
            >
              {openComments.length}
            </span>
          </h3>
          {openComments.length > 0 ? (
            <ul data-testid="studio-comments-open-list" className="space-y-1.5">
              {openComments.map((comment) => renderRow(comment))}
            </ul>
          ) : (
            <p
              data-testid="studio-comments-empty-open"
              className="rounded-lg border border-dashed border-[#2a2d34] px-2 py-3 text-center text-[10px] text-[#6c727d]"
            >
              لا توجد تعليقات مفتوحة
            </p>
          )}
        </section>

        <section data-testid="studio-comments-resolved-group">
          <h3 className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-[#8b919b]">
            محلول
            <span
              data-testid="studio-comments-resolved-count"
              className="rounded-full bg-[#22c55e]/15 px-1.5 text-[10px] font-bold text-[#4ade80]"
            >
              {resolvedComments.length}
            </span>
          </h3>
          {resolvedComments.length > 0 ? (
            <ul data-testid="studio-comments-resolved-list" className="space-y-1.5">
              {resolvedComments.map((comment) => renderRow(comment))}
            </ul>
          ) : (
            <p
              data-testid="studio-comments-empty-resolved"
              className="rounded-lg border border-dashed border-[#2a2d34] px-2 py-3 text-center text-[10px] text-[#6c727d]"
            >
              لا توجد تعليقات محلولة
            </p>
          )}
        </section>
      </div>

      <footer className="border-t border-[#2a2d34] px-3 py-1.5 text-[9px] text-[#6c727d]">
        التعليقات محفوظة مع إعدادات الصفحة — لا تظهر للزائر في المتجر العام.
      </footer>
    </aside>
  );
};
