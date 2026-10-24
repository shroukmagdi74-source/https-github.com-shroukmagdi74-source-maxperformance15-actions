import React, { useState, useRef, useCallback, useEffect } from "react";

export interface UseStudioTouchDragOptions {
  sections: any[];
  sectionKeys: string[];
  activePageKey: string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
}

export interface UseStudioTouchDragReturn {
  isTouchDragging: boolean;
  activeTouchDragIndex: number | null;
  activeTouchDragKey: string | null;
  touchDropTargetSlot: number | null;
  touchDragOffsetY: number;
  handleTouchPointerDown: (e: React.PointerEvent, index: number, sectionKey: string) => void;
  cancelTouchDrag: () => void;
}

interface TouchDragSession {
  startX: number;
  startY: number;
  fromIndex: number;
  sectionKey: string;
  pointerId: number;
  handleEl?: HTMLElement | null;
  active: boolean;
}

/**
 * Computes drop target slot based on pointer clientY.
 * In real browsers, compares clientY against the vertical center (midpoint) of each section element.
 * In headless JSDOM environments where getBoundingClientRect() returns 0s, falls back to delta Y.
 */
export function computeTouchDropSlot(
  clientY: number,
  startY: number,
  fromIndex: number,
  totalItems: number,
  container?: HTMLElement | null
): number {
  if (totalItems <= 1) return 0;

  const root = container || (typeof document !== "undefined" ? document : null);
  if (!root) return fromIndex;

  const sectionElements = Array.from(
    root.querySelectorAll<HTMLElement>(
      "[data-studio-sortable-section='true'], [data-studio-touch-section]"
    )
  );

  // If we found DOM elements with valid layout height (> 0)
  const hasLayout = sectionElements.some((el) => el.getBoundingClientRect().height > 0);

  if (hasLayout && sectionElements.length > 0) {
    let targetSlot = sectionElements.length - 1;
    for (let i = 0; i < sectionElements.length; i++) {
      const el = sectionElements[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        targetSlot = i;
        break;
      }
    }
    return Math.max(0, Math.min(totalItems - 1, targetSlot));
  }

  // Fallback for JSDOM / headless testing without layout geometry
  const dy = clientY - startY;
  const threshold = 15; // 15px shift
  if (Math.abs(dy) >= threshold) {
    const direction = dy > 0 ? 1 : -1;
    return Math.max(0, Math.min(totalItems - 1, fromIndex + direction));
  }

  return fromIndex;
}

export function useStudioTouchDrag({
  sections,
  sectionKeys,
  onReorder,
  disabled = false,
}: UseStudioTouchDragOptions): UseStudioTouchDragReturn {
  const [isTouchDragging, setIsTouchDragging] = useState<boolean>(false);
  const [activeTouchDragIndex, setActiveTouchDragIndex] = useState<number | null>(null);
  const [activeTouchDragKey, setActiveTouchDragKey] = useState<string | null>(null);
  const [touchDropTargetSlot, setTouchDropTargetSlot] = useState<number | null>(null);
  const [touchDragOffsetY, setTouchDragOffsetY] = useState<number>(0);

  const sessionRef = useRef<TouchDragSession | null>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;
  const sectionKeysRef = useRef(sectionKeys);
  sectionKeysRef.current = sectionKeys;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const cleanupListeners = useCallback(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
      document.removeEventListener("pointercancel", handleGlobalPointerUp);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, []);

  const cancelTouchDrag = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    cleanupListeners();

    if (session?.handleEl && typeof session.handleEl.releasePointerCapture === "function") {
      try {
        session.handleEl.releasePointerCapture(session.pointerId);
      } catch {
        // Safe catch for detached elements or JSDOM
      }
    }

    setIsTouchDragging(false);
    setActiveTouchDragIndex(null);
    setActiveTouchDragKey(null);
    setTouchDropTargetSlot(null);
    setTouchDragOffsetY(0);
  }, [cleanupListeners]);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Requirement 5: Escape cancels touch drag and restores original position
      if (e.key === "Escape") {
        cancelTouchDrag();
      }
    },
    [cancelTouchDrag]
  );

  const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
    const session = sessionRef.current;
    if (!session) return;

    const clientX = typeof e.clientX === "number" && !isNaN(e.clientX) ? e.clientX : 0;
    const clientY = typeof e.clientY === "number" && !isNaN(e.clientY) ? e.clientY : 0;

    const dx = clientX - session.startX;
    const dy = clientY - session.startY;
    const distance = Math.hypot(dx, dy);

    // Requirement 3: 8px threshold before starting drag to preserve natural touch scrolling
    if (!session.active) {
      if (distance < 8) {
        // Below 8px: normal scroll, do not activate drag
        return;
      }
      session.active = true;
      setIsTouchDragging(true);
      setActiveTouchDragIndex(session.fromIndex);
      setActiveTouchDragKey(session.sectionKey);
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    setTouchDragOffsetY(dy);

    const slot = computeTouchDropSlot(
      clientY,
      session.startY,
      session.fromIndex,
      sectionKeysRef.current.length
    );
    setTouchDropTargetSlot(slot);
  }, []);

  const handleGlobalPointerUp = useCallback(
    (e: PointerEvent) => {
      const session = sessionRef.current;
      sessionRef.current = null;
      cleanupListeners();

      if (session?.handleEl && typeof session.handleEl.releasePointerCapture === "function") {
        try {
          session.handleEl.releasePointerCapture(session.pointerId);
        } catch {
          // Safe catch
        }
      }

      if (session && session.active) {
        const clientY = typeof e.clientY === "number" && !isNaN(e.clientY) ? e.clientY : 0;
        const finalSlot = computeTouchDropSlot(
          clientY,
          session.startY,
          session.fromIndex,
          sectionKeysRef.current.length
        );

        if (typeof finalSlot === "number" && finalSlot !== session.fromIndex) {
          onReorderRef.current(session.fromIndex, finalSlot);
        }
      }

      setIsTouchDragging(false);
      setActiveTouchDragIndex(null);
      setActiveTouchDragKey(null);
      setTouchDropTargetSlot(null);
      setTouchDragOffsetY(0);
    },
    [cleanupListeners]
  );

  const handleTouchPointerDown = useCallback(
    (e: React.PointerEvent, index: number, sectionKey: string) => {
      if (disabled) return;

      // Requirement 6: Desktop mouse path remains completely unaffected!
      // If pointerType is mouse, ignore it so dnd-kit can handle it natively.
      if (e.pointerType === "mouse") {
        return;
      }

      const handleEl = e.currentTarget as HTMLElement;
      const pointerId = e.pointerId;

      // Requirement 1: Pointer capture on handle
      try {
        if (typeof handleEl.setPointerCapture === "function") {
          handleEl.setPointerCapture(pointerId);
        }
      } catch {
        // Safe catch
      }

      const clientX = typeof e.clientX === "number" && !isNaN(e.clientX) ? e.clientX : 0;
      const clientY = typeof e.clientY === "number" && !isNaN(e.clientY) ? e.clientY : 0;

      sessionRef.current = {
        startX: clientX,
        startY: clientY,
        fromIndex: index,
        sectionKey,
        pointerId,
        handleEl,
        active: false,
      };

      if (typeof window !== "undefined") {
        window.addEventListener("pointermove", handleGlobalPointerMove, { passive: false });
        window.addEventListener("pointerup", handleGlobalPointerUp);
        window.addEventListener("pointercancel", handleGlobalPointerUp);
        window.addEventListener("keydown", handleGlobalKeyDown);
      }
      if (typeof document !== "undefined") {
        document.addEventListener("pointermove", handleGlobalPointerMove, { passive: false });
        document.addEventListener("pointerup", handleGlobalPointerUp);
        document.addEventListener("pointercancel", handleGlobalPointerUp);
        document.addEventListener("keydown", handleGlobalKeyDown);
      }
    },
    [disabled, handleGlobalPointerMove, handleGlobalPointerUp, handleGlobalKeyDown]
  );

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  // Requirement 2: Ensure any handle with data-studio-drag-handle has touch-action: none
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handles = document.querySelectorAll<HTMLElement>("[data-studio-drag-handle]");
    handles.forEach((h) => {
      h.style.touchAction = "none";
    });
  });

  return {
    isTouchDragging,
    activeTouchDragIndex,
    activeTouchDragKey,
    touchDropTargetSlot,
    touchDragOffsetY,
    handleTouchPointerDown,
    cancelTouchDrag,
  };
}
