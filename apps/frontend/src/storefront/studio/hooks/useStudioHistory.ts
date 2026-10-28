import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  describeStudioHistoryStep,
  STUDIO_HISTORY_MAX_STEPS,
  type StudioHistoryStepView,
} from "../utils/studioHistoryTimeline";

export interface UseStudioHistoryOptions<T> {
  /** @deprecated use `maxSteps` — kept so older call sites keep compiling. */
  maxHistory?: number;
  /** Hard cap of recorded steps (oldest dropped first). Defaults to 50 (UNDO-1). */
  maxSteps?: number;
  onChange?: (present: T) => void;
  coalesceMs?: number;
}

export type { StudioHistoryStepView };

/** One recorded operation: `state` is the snapshot AFTER it, `before` the one BEFORE. */
interface HistoryStep<T> {
  id: number;
  label: string;
  at: number;
  state: T;
  before: T;
}

interface HistoryTimeline<T> {
  /** State before the first retained step (initial load / oldest retained predecessor). */
  base: T;
  entries: HistoryStep<T>[];
  /** Index of the applied step, -1 = `base` (nothing applied). */
  cursor: number;
}

function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalizeJson).join(",")}]`;
  }
  const keys = Object.keys(obj).filter((k) => k !== "themeId").sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`);
  return `{${pairs.join(",")}}`;
}

export function areTokensEquivalent(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  try {
    return canonicalizeJson(a) === canonicalizeJson(b);
  } catch {
    return false;
  }
}

export function useStudioHistory<T>(initialPresent: T, options?: UseStudioHistoryOptions<T>) {
  const maxSteps = Math.max(
    2,
    Math.floor(options?.maxSteps ?? options?.maxHistory ?? STUDIO_HISTORY_MAX_STEPS)
  );
  const coalesceMs = options?.coalesceMs ?? 800;
  const onChangeRef = useRef(options?.onChange);
  onChangeRef.current = options?.onChange;
  const lastSetTimeRef = useRef<number>(0);
  const nextStepIdRef = useRef<number>(1);

  const [timeline, setTimeline] = useState<HistoryTimeline<T>>({
    base: initialPresent,
    entries: [],
    cursor: -1,
  });

  const timelineRef = useRef(timeline);
  timelineRef.current = timeline;

  const lastRecordedRef = useRef<string>(JSON.stringify(initialPresent));

  const presentOf = (tl: HistoryTimeline<T>): T =>
    tl.cursor >= 0 && tl.cursor < tl.entries.length ? tl.entries[tl.cursor].state : tl.base;

  // Re-sync if initialPresent changes from an external source (such as discard or initial load)
  useEffect(() => {
    const externalStr = JSON.stringify(initialPresent);
    if (externalStr === lastRecordedRef.current) return;

    const current = timelineRef.current;
    const currentPresent = presentOf(current);

    // If tokens are equivalent (e.g. server echoed save with themeId or key re-ordering),
    // preserve past/future undo history and do not wipe history!
    if (areTokensEquivalent(initialPresent, currentPresent)) {
      lastRecordedRef.current = externalStr;
      let syncedTimeline: HistoryTimeline<T>;
      if (current.cursor >= 0) {
        const entries = current.entries.slice();
        entries[current.cursor] = { ...entries[current.cursor], state: initialPresent };
        syncedTimeline = { ...current, entries };
      } else {
        syncedTimeline = { ...current, base: initialPresent };
      }
      timelineRef.current = syncedTimeline;
      setTimeline(syncedTimeline);
      return;
    }

    // Truly external reset (such as user clicking "Discard" or fresh settings load)
    lastRecordedRef.current = externalStr;
    const resetTimeline: HistoryTimeline<T> = {
      base: initialPresent,
      entries: [],
      cursor: -1,
    };
    timelineRef.current = resetTimeline;
    setTimeline(resetTimeline);
  }, [initialPresent]);

  const set = useCallback(
    (newPresent: T | ((curr: T) => T), recordHistory = true, label?: string) => {
      const curr = timelineRef.current;
      const currentPresent = presentOf(curr);
      const resolved =
        typeof newPresent === "function" ? (newPresent as (c: T) => T)(currentPresent) : newPresent;
      const resolvedStr = JSON.stringify(resolved);

      if (resolvedStr === lastRecordedRef.current) {
        return;
      }

      lastRecordedRef.current = resolvedStr;
      const now = Date.now();
      const shouldCoalesce =
        coalesceMs > 0 && now - lastSetTimeRef.current < coalesceMs && curr.cursor >= 0;
      lastSetTimeRef.current = now;

      let nextTimeline: HistoryTimeline<T>;

      if (!recordHistory) {
        // Live preview only (no new undo step), the redo branch is preserved.
        if (curr.cursor >= 0) {
          const entries = curr.entries.slice();
          entries[curr.cursor] = { ...entries[curr.cursor], state: resolved, at: now };
          nextTimeline = { ...curr, entries };
        } else {
          nextTimeline = { ...curr, base: resolved };
        }
      } else if (shouldCoalesce) {
        // Coalesce rapid edits (e.g. typing) into a single undo step.
        const entries = curr.entries.slice(0, curr.cursor + 1);
        const currentEntry = entries[curr.cursor];
        entries[curr.cursor] = {
          ...currentEntry,
          state: resolved,
          at: now,
          label: label ?? currentEntry.label,
        };
        nextTimeline = { ...curr, entries };
      } else {
        const resolvedLabel = label ?? describeStudioHistoryStep(currentPresent, resolved);
        let entries = curr.entries.slice(0, curr.cursor + 1);
        entries.push({
          id: nextStepIdRef.current,
          label: resolvedLabel,
          at: now,
          state: resolved,
          before: currentPresent,
        });
        nextStepIdRef.current += 1;

        let base = curr.base;
        let cursor = entries.length - 1;
        if (entries.length > maxSteps) {
          entries = entries.slice(entries.length - maxSteps);
          cursor = entries.length - 1;
          base = entries[0].before;
        }
        nextTimeline = { base, entries, cursor };
      }

      timelineRef.current = nextTimeline;
      setTimeline(nextTimeline);
      onChangeRef.current?.(resolved);
    },
    [maxSteps, coalesceMs]
  );

  const undo = useCallback(() => {
    const curr = timelineRef.current;
    if (curr.cursor < 0) return undefined;

    const leaving = curr.entries[curr.cursor];
    const nextCursor = curr.cursor - 1;
    const previous = nextCursor >= 0 ? curr.entries[nextCursor].state : leaving.before;

    lastRecordedRef.current = JSON.stringify(previous);
    lastSetTimeRef.current = 0; // reset coalesce timer on undo

    const nextTimeline: HistoryTimeline<T> = {
      base: nextCursor >= 0 ? curr.base : previous,
      entries: curr.entries,
      cursor: nextCursor,
    };

    timelineRef.current = nextTimeline;
    setTimeline(nextTimeline);
    onChangeRef.current?.(previous);
    return previous;
  }, []);

  const redo = useCallback(() => {
    const curr = timelineRef.current;
    if (curr.cursor >= curr.entries.length - 1) return undefined;

    const nextCursor = curr.cursor + 1;
    const next = curr.entries[nextCursor].state;
    lastRecordedRef.current = JSON.stringify(next);
    lastSetTimeRef.current = 0; // reset coalesce timer on redo

    const nextTimeline: HistoryTimeline<T> = {
      base: curr.base,
      entries: curr.entries,
      cursor: nextCursor,
    };

    timelineRef.current = nextTimeline;
    setTimeline(nextTimeline);
    onChangeRef.current?.(next);
    return next;
  }, []);

  /** Jump straight to a recorded step (by step id, index accepted as a fallback). */
  const jumpToStep = useCallback((stepIdOrIndex: number) => {
    const curr = timelineRef.current;
    if (curr.entries.length === 0) return undefined;

    let index = curr.entries.findIndex((step) => step.id === stepIdOrIndex);
    if (index < 0) index = stepIdOrIndex;
    if (!Number.isInteger(index) || index < 0 || index >= curr.entries.length) return undefined;

    const target = curr.entries[index].state;
    if (index === curr.cursor) return target;

    lastRecordedRef.current = JSON.stringify(target);
    lastSetTimeRef.current = 0;

    const nextTimeline: HistoryTimeline<T> = { ...curr, cursor: index };
    timelineRef.current = nextTimeline;
    setTimeline(nextTimeline);
    onChangeRef.current?.(target);
    return target;
  }, []);

  const steps = useMemo<StudioHistoryStepView[]>(
    () =>
      timeline.entries.map((step, index) => ({
        id: step.id,
        index,
        label: step.label,
        at: step.at,
        isCurrent: index === timeline.cursor,
        isFuture: index > timeline.cursor,
      })),
    [timeline]
  );

  const present = presentOf(timeline);
  const canUndo = timeline.cursor >= 0;
  const canRedo = timeline.cursor < timeline.entries.length - 1;

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    steps,
    stepCount: timeline.entries.length,
    currentStepIndex: timeline.cursor,
    maxSteps,
    jumpToStep,
  };
}
