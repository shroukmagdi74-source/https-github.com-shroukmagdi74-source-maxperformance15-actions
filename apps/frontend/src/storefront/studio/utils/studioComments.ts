import type { StudioComment, StudioCommentAnchor } from "../StudioTypes";

/**
 * CMT-1 — تعليقات الكانفس.
 * التخزين: `designTokens.comments` داخل نفس settings blob (بدون backend/API/schema).
 * صفر PII: المؤلف اسم مستخدم فقط، وأي بريد/هاتف يُستبدل باسم فريق المتجر.
 */

export const STUDIO_COMMENTS_TOKEN_KEY = "comments";
export const MAX_STUDIO_COMMENT_LENGTH = 2000;
export const STUDIO_ANONYMOUS_AUTHOR = "فريق المتجر";

export interface StudioSectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface StudioCommentInput {
  pageKey: string;
  sectionKey?: string | null;
  anchor?: StudioCommentAnchor | null;
  text: string;
  author?: string | null;
  createdAt?: string;
  id?: string;
}

export interface AddStudioCommentResult {
  tokens: Record<string, unknown>;
  comment: StudioComment | null;
}

export interface CommentAuthorSource {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value * 10) / 10));

const normalizeText = (value: unknown): string =>
  typeof value === "string"
    ? value.trim().slice(0, MAX_STUDIO_COMMENT_LENGTH)
    : "";

const normalizePageKey = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** 0 PII: البريد أو رقم الهاتف لا يُحفظ كاسم مؤلف. */
export const sanitizeCommentAuthorName = (raw?: string | null): string => {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return STUDIO_ANONYMOUS_AUTHOR;
  const looksLikeEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
  const digits = value.replace(/\D/g, "");
  const looksLikePhone = /^[+\d][\d\s()\-.]{5,}$/.test(value) && digits.length >= 7;
  if (looksLikeEmail || looksLikePhone) return STUDIO_ANONYMOUS_AUTHOR;
  return value.slice(0, 60);
};

export const resolveCommentAuthorName = (user?: CommentAuthorSource | null): string => {
  if (!user) return STUDIO_ANONYMOUS_AUTHOR;
  const fullName = [user.firstName, user.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();
  const candidate = typeof user.name === "string" && user.name.trim() ? user.name : fullName;
  return sanitizeCommentAuthorName(candidate);
};

export const normalizeCommentAnchor = (
  anchor: unknown,
): StudioCommentAnchor | undefined => {
  if (!isRecord(anchor)) return undefined;
  const rawX = anchor["x"];
  const rawY = anchor["y"];
  const x = typeof rawX === "number" ? rawX : Number(rawX);
  const y = typeof rawY === "number" ? rawY : Number(rawY);
  if (!Number.isFinite(x) && !Number.isFinite(y)) return undefined;
  return {
    x: clampPercent(Number.isFinite(x) ? x : 50),
    y: clampPercent(Number.isFinite(y) ? y : 50),
  };
};

export function sanitizeStudioComment(raw: unknown): StudioComment | null {
  if (!isRecord(raw)) return null;
  const rawId = raw["id"];
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const text = normalizeText(raw["text"]);
  const pageKey = normalizePageKey(raw["pageKey"]);
  if (!id || !text || !pageKey) return null;

  const rawSectionKey = raw["sectionKey"];
  const sectionKey =
    typeof rawSectionKey === "string" && rawSectionKey.trim()
      ? rawSectionKey.trim()
      : null;
  const anchor = normalizeCommentAnchor(raw["anchor"]);
  const rawAuthor = raw["author"];
  const author = sanitizeCommentAuthorName(
    typeof rawAuthor === "string" ? rawAuthor : null,
  );
  const rawCreatedAt = raw["createdAt"];
  const createdAt =
    typeof rawCreatedAt === "string" && rawCreatedAt.trim()
      ? rawCreatedAt
      : new Date(0).toISOString();

  const comment: StudioComment = {
    id,
    pageKey,
    sectionKey,
    text,
    author,
    createdAt,
    resolved: raw["resolved"] === true,
  };
  if (anchor) comment.anchor = anchor;
  return comment;
}

export function readStudioComments(tokens: unknown): StudioComment[] {
  if (!isRecord(tokens)) return [];
  const rawComments = tokens[STUDIO_COMMENTS_TOKEN_KEY];
  if (!Array.isArray(rawComments)) return [];

  const seen = new Set<string>();
  const comments: StudioComment[] = [];
  rawComments.forEach((entry) => {
    const comment = sanitizeStudioComment(entry);
    if (!comment || seen.has(comment.id)) return;
    seen.add(comment.id);
    comments.push(comment);
  });
  return comments;
}

export function writeStudioComments(
  tokens: unknown,
  comments: StudioComment[],
): Record<string, unknown> {
  const base = isRecord(tokens) ? { ...tokens } : {};
  if (!Array.isArray(comments) || comments.length === 0) {
    delete base[STUDIO_COMMENTS_TOKEN_KEY];
    return base;
  }
  base[STUDIO_COMMENTS_TOKEN_KEY] = comments;
  return base;
}

let commentSequence = 0;

const createCommentId = (): string => {
  const cryptoRef =
    typeof globalThis !== "undefined"
      ? (globalThis as { crypto?: Crypto }).crypto
      : undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return `cmt_${cryptoRef.randomUUID()}`;
  }
  commentSequence += 1;
  return `cmt_${Date.now().toString(36)}_${commentSequence}`;
};

export function createStudioComment(input: StudioCommentInput): StudioComment | null {
  const text = normalizeText(input.text);
  const pageKey = normalizePageKey(input.pageKey);
  if (!text || !pageKey) return null;

  const rawSectionKey = input.sectionKey;
  const sectionKey =
    typeof rawSectionKey === "string" && rawSectionKey.trim()
      ? rawSectionKey.trim()
      : null;
  const anchor = normalizeCommentAnchor(input.anchor);

  const comment: StudioComment = {
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : createCommentId(),
    pageKey,
    sectionKey,
    text,
    author: sanitizeCommentAuthorName(input.author),
    createdAt:
      typeof input.createdAt === "string" && input.createdAt.trim()
        ? input.createdAt
        : new Date().toISOString(),
    resolved: false,
  };
  if (anchor) comment.anchor = anchor;
  return comment;
}

export function addStudioCommentToSettings(
  tokens: unknown,
  input: StudioCommentInput,
): AddStudioCommentResult {
  const comments = readStudioComments(tokens);
  const comment = createStudioComment(input);
  if (!comment) {
    return { tokens: writeStudioComments(tokens, comments), comment: null };
  }
  return {
    tokens: writeStudioComments(tokens, [...comments, comment]),
    comment,
  };
}

export function setStudioCommentResolvedInSettings(
  tokens: unknown,
  id: string,
  resolved: boolean,
): Record<string, unknown> {
  const targetId = typeof id === "string" ? id.trim() : "";
  const comments = readStudioComments(tokens).map((comment) =>
    comment.id === targetId ? { ...comment, resolved } : comment,
  );
  return writeStudioComments(tokens, comments);
}

export function deleteStudioCommentFromSettings(
  tokens: unknown,
  id: string,
): Record<string, unknown> {
  const targetId = typeof id === "string" ? id.trim() : "";
  const comments = readStudioComments(tokens).filter(
    (comment) => comment.id !== targetId,
  );
  return writeStudioComments(tokens, comments);
}

export function getPageComments(
  comments: StudioComment[],
  pageKey: string,
): StudioComment[] {
  const key = normalizePageKey(pageKey);
  if (!Array.isArray(comments) || !key) return [];
  return comments.filter((comment) => comment.pageKey === key);
}

export function countOpenComments(
  comments: StudioComment[],
  pageKey?: string,
): number {
  if (!Array.isArray(comments)) return 0;
  const scoped = typeof pageKey === "string" && pageKey.trim()
    ? getPageComments(comments, pageKey)
    : comments;
  return scoped.filter((comment) => !comment.resolved).length;
}

/** تعليق مرتبط بقسم اتشال من الصفحة (مايكسرش الرندر، بيتحول لـ«معلّق على قسم محذوف»). */
export function isCommentOnDeletedSection(
  comment: StudioComment,
  pageSectionKeys?: string[] | null,
): boolean {
  if (!comment || !comment.sectionKey) return false;
  if (!Array.isArray(pageSectionKeys)) return false;
  return !pageSectionKeys.includes(comment.sectionKey);
}

export function formatStudioCommentDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleString("ar-EG", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date.toISOString();
  }
}

export function computeCommentAnchor(
  point: { clientX: number; clientY: number },
  rect: { left: number; top: number; width: number; height: number },
): StudioCommentAnchor | undefined {
  if (!rect || rect.width <= 0 || rect.height <= 0) return undefined;
  return {
    x: clampPercent(((point.clientX - rect.left) / rect.width) * 100),
    y: clampPercent(((point.clientY - rect.top) / rect.height) * 100),
  };
}

/** إيجاد عنصر القسم في الكانفس بدون CSS.escape (مفاتيح الأقسام فيها رموز). */
export function findStudioSectionElement(
  sectionKey: string,
  scope?: ParentNode | null,
): HTMLElement | null {
  const key = typeof sectionKey === "string" ? sectionKey.trim() : "";
  if (!key) return null;
  const root: ParentNode | null =
    scope || (typeof document !== "undefined" ? document : null);
  if (!root || typeof root.querySelectorAll !== "function") return null;
  const nodes = root.querySelectorAll<HTMLElement>(
    "[data-studio-touch-section], [data-section-key]",
  );
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) continue;
    const nodeKey =
      node.getAttribute("data-studio-touch-section") ||
      node.getAttribute("data-section-key");
    if (nodeKey === key) return node;
  }
  return null;
}
