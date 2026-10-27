import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import {
  type StudioSearchMatch,
  searchSections,
  replaceSectionMatch,
  replaceAllSectionMatches,
} from "./utils/studioSearchReplace";

interface StudioSearchReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sections: any[];
  onUpdateSections: (nextSections: any[], actionLabel?: string) => void;
  onNavigateToSection: (sectionKey: string) => void;
}

export const StudioSearchReplacePanel: React.FC<StudioSearchReplacePanelProps> = ({
  isOpen,
  onClose,
  sections,
  onUpdateSections,
  onNavigateToSection,
}) => {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matches = React.useMemo(() => {
    return searchSections(sections, query);
  }, [sections, query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeMatchIndex >= matches.length) {
      setActiveMatchIndex(matches.length > 0 ? 0 : 0);
    }
  }, [matches.length, activeMatchIndex]);

  const activeMatch = matches[activeMatchIndex] || null;

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIdx);
    const m = matches[nextIdx];
    if (m) onNavigateToSection(m.sectionKey);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matches.length) % matches.length;
    setActiveMatchIndex(prevIdx);
    const m = matches[prevIdx];
    if (m) onNavigateToSection(m.sectionKey);
  };

  const handleReplaceOne = () => {
    if (!activeMatch) return;
    const { updatedSections, count } = replaceSectionMatch(sections, activeMatch, replacement);
    if (count > 0) {
      onUpdateSections(updatedSections, `استبدال "${query}"`);
    }
  };

  const handleReplaceAll = () => {
    if (!query.trim() || matches.length === 0) return;
    const { updatedSections, count } = replaceAllSectionMatches(sections, query, replacement);
    if (count > 0) {
      onUpdateSections(updatedSections, `استبدال الكل لـ "${query}"`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="search"
      aria-label="بحث واستبدال في نصوص الصفحة"
      data-testid="studio-search-replace-panel"
      className="absolute top-3 end-6 z-50 flex flex-col gap-2 rounded-xl border border-[#333742] bg-[#181a20]/95 p-3 text-xs text-[#e8eaee] shadow-2xl backdrop-blur-md ring-1 ring-black/40 w-[340px] sm:w-[380px] animate-in fade-in slide-in-from-top-2 duration-150 select-none"
      onKeyDown={handleKeyDown}
    >
      {/* Search Row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute start-2 top-2 h-3.5 w-3.5 text-[#808791]" />
          <input
            ref={searchInputRef}
            type="text"
            data-testid="studio-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveMatchIndex(0);
            }}
            placeholder="بحث في الصفحة... (Ctrl+F)"
            className="h-8 w-full rounded-lg border border-[#333742] bg-[#121418] ps-7 pe-2 text-xs text-white placeholder-[#6c727d] focus:border-[#2b6cf6] focus:outline-none focus:ring-1 focus:ring-[#2b6cf6]"
          />
        </div>

        {/* Counter Badge */}
        <span
          data-testid="search-match-count"
          className="flex h-8 items-center px-2 font-mono text-[11px] text-[#9ba0a8] whitespace-nowrap"
        >
          {query.trim()
            ? matches.length > 0
              ? `${activeMatchIndex + 1}/${matches.length}`
              : "0 نتائج"
            : ""}
        </span>

        {/* Navigation */}
        <button
          type="button"
          data-testid="search-prev-btn"
          onClick={handlePrev}
          disabled={matches.length === 0}
          className="flex h-8 w-7 items-center justify-center rounded-lg border border-[#333742] bg-[#22252c] text-[#c3c7cd] hover:bg-[#2b2f38] hover:text-white disabled:opacity-30 transition-colors"
          title="المطابقة السابقة (Shift+Enter)"
        >
          <ChevronUpIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          data-testid="search-next-btn"
          onClick={handleNext}
          disabled={matches.length === 0}
          className="flex h-8 w-7 items-center justify-center rounded-lg border border-[#333742] bg-[#22252c] text-[#c3c7cd] hover:bg-[#2b2f38] hover:text-white disabled:opacity-30 transition-colors"
          title="المطابقة التالية (Enter)"
        >
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          data-testid="search-close-btn"
          onClick={onClose}
          className="flex h-8 w-7 items-center justify-center rounded-lg text-[#808791] hover:bg-[#202226] hover:text-white transition-colors"
          title="إغلاق (Esc)"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Replace Row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <ArrowsRightLeftIcon className="pointer-events-none absolute start-2 top-2 h-3.5 w-3.5 text-[#808791]" />
          <input
            type="text"
            data-testid="studio-replace-input"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="استبدال بـ..."
            className="h-8 w-full rounded-lg border border-[#333742] bg-[#121418] ps-7 pe-2 text-xs text-white placeholder-[#6c727d] focus:border-[#2b6cf6] focus:outline-none focus:ring-1 focus:ring-[#2b6cf6]"
          />
        </div>

        <button
          type="button"
          data-testid="search-replace-btn"
          onClick={handleReplaceOne}
          disabled={matches.length === 0}
          className="h-8 rounded-lg border border-[#333742] bg-[#22252c] px-2 text-[11px] font-semibold text-[#e1e4ea] hover:bg-[#2b2f38] hover:text-white disabled:opacity-30 transition-colors whitespace-nowrap"
        >
          استبدال
        </button>

        <button
          type="button"
          data-testid="search-replace-all-btn"
          onClick={handleReplaceAll}
          disabled={matches.length === 0}
          className="h-8 rounded-lg bg-[#2b6cf6] px-2.5 text-[11px] font-bold text-white shadow hover:bg-[#1d5ce6] disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          استبدال الكل
        </button>
      </div>
    </div>
  );
};
