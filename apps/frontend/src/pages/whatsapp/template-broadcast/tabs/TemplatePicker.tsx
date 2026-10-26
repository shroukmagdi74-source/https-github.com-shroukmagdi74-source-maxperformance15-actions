import React, { useState, useRef, useEffect, useMemo, useId, useCallback } from 'react';
import { Search, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetaTemplate } from '../types';

export interface TemplatePickerProps {
  templates: MetaTemplate[];
  selectedTemplate: string;
  setSelectedTemplate: (name: string) => void;
  languageCode: string;
  setLanguageCode: (lang: string) => void;
  disabled?: boolean;
  className?: string;
}

interface IndexedTemplate {
  key: string;
  name: string;
  language: string;
  category?: string;
  haystack: string;
  raw: MetaTemplate;
}

const MAX_RENDERED = 100;

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  languageCode,
  setLanguageCode,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [listMaxHeight, setListMaxHeight] = useState<number>(224);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const listboxId = useId();
  const getOptionId = (idx: number) => `${listboxId}-option-${idx}`;

  // 1. Build text index (haystack) once per templates array change
  const indexedTemplates = useMemo<IndexedTemplate[]>(() => {
    return templates.map((t) => {
      const name = t.name || '';
      const language = t.language || '';
      const category = t.category || '';
      return {
        key: `${name}__${language}`,
        name,
        language,
        category,
        haystack: `${name} ${language} ${category}`.toLowerCase(),
        raw: t,
      };
    });
  }, [templates]);

  // 2. Resolve currently selected template for display
  const currentSelected = useMemo(() => {
    if (!selectedTemplate) return null;
    if (selectedKey) {
      const match = indexedTemplates.find((it) => it.key === selectedKey);
      if (match && match.name === selectedTemplate) {
        return match;
      }
    }
    if (languageCode) {
      const match = indexedTemplates.find(
        (it) => it.name === selectedTemplate && it.language === languageCode
      );
      if (match) return match;
    }
    return indexedTemplates.find((it) => it.name === selectedTemplate) || null;
  }, [indexedTemplates, selectedTemplate, languageCode, selectedKey]);

  // 3. Fast substring search over haystack
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return indexedTemplates;
    return indexedTemplates.filter((item) => item.haystack.includes(q));
  }, [indexedTemplates, search]);

  // 4. Cap rendered items at MAX_RENDERED for sub-100ms opening
  const renderedItems = useMemo(() => {
    return filteredTemplates.slice(0, MAX_RENDERED);
  }, [filteredTemplates]);

  // Dynamic placement and max-height calculation to prevent viewport overflow
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Full panel height estimate: search header (~45px) + default list (224px) + footer (~28px) + margins (~16px) ≈ 315px
    const ESTIMATED_PANEL_HEIGHT = 315;
    const shouldFlipUp = spaceBelow < ESTIMATED_PANEL_HEIGHT && spaceAbove > spaceBelow;
    const nextPlacement: 'bottom' | 'top' = shouldFlipUp ? 'top' : 'bottom';
    const availableSpace = shouldFlipUp ? spaceAbove : spaceBelow;

    // Dynamic max-height for list: min(22rem = 352px, availableSpace - search/footer safety margin ~90px)
    const maxH = Math.max(96, Math.min(352, Math.floor(availableSpace - 90)));

    setPlacement(nextPlacement);
    setListMaxHeight(maxH);
  }, []);

  // Reset activeIndex when search query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Manage focus and state when dropdown opens/closes
  useEffect(() => {
    if (open) {
      setSearch('');
      setActiveIndex(0);
      const raf = requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  // Recalculate position on resize and scroll
  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open, updatePosition]);

  // Handle clicking outside to close
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Scroll active option into view
  useEffect(() => {
    if (open && activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open, activeIndex]);

  const handleSelect = (item: IndexedTemplate) => {
    setSelectedKey(item.key);
    setSelectedTemplate(item.name);
    if (item.language) {
      setLanguageCode(item.language);
    }
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!open) {
      updatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updatePosition();
        setOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < renderedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, renderedItems.length - 1)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(Math.max(0, renderedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (renderedItems.length > 0 && activeIndex >= 0 && activeIndex < renderedItems.length) {
        handleSelect(renderedItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-card px-2.5 text-xs transition-colors shadow-xs',
          'hover:border-border hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
          open && 'border-primary ring-1 ring-primary/40',
          disabled && 'cursor-not-allowed opacity-50 bg-muted/40'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-start">
          {currentSelected ? (
            <>
              <span
                dir="ltr"
                style={{ unicodeBidi: 'plaintext' }}
                title={currentSelected.name}
                className="truncate font-medium text-foreground tpl-name-mono"
              >
                {currentSelected.name}
              </span>
              <span className="shrink-0 rounded border border-border/40 bg-muted/40 px-1 py-0.5 text-[10px] font-mono uppercase text-muted-foreground leading-none">
                {currentSelected.language}
              </span>
            </>
          ) : (
            <span className="truncate text-muted-foreground font-sans">
              اختر قالباً
            </span>
          )}
        </div>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground ms-2" />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={cn(
            'absolute start-0 z-50 w-full rounded-xl border border-border/70 bg-popover text-popover-foreground shadow-xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-100',
            placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {/* Search Box */}
          <div className="p-2 border-b border-border/40 bg-muted/20 shrink-0">
            <div className="relative">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم، اللغة، أو التصنيف..."
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0 && renderedItems[activeIndex]
                    ? getOptionId(activeIndex)
                    : undefined
                }
                className="h-7 w-full rounded-md border border-border/60 bg-background ps-8 pe-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 text-start"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    searchRef.current?.focus();
                  }}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="مسح البحث"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="قائمة قوالب واتساب"
            style={{ maxHeight: `${listMaxHeight}px` }}
            className="overflow-y-auto p-1 divide-y divide-border/20 flex-1"
          >
            {renderedItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                لا توجد قوالب مطابقة للبحث
              </div>
            ) : (
              renderedItems.map((item, index) => {
                const isSelected = currentSelected?.key === item.key;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={item.key}
                    id={getOptionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'group flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-start transition-colors select-none',
                      isActive && 'bg-muted text-foreground',
                      isSelected && 'bg-primary/10 text-primary font-medium',
                      isActive && isSelected && 'bg-primary/15 text-primary font-medium'
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span
                        dir="ltr"
                        style={{ unicodeBidi: 'plaintext' }}
                        title={item.name}
                        className="truncate font-medium text-foreground tpl-name-mono"
                      >
                        {item.name}
                      </span>
                      <span className="shrink-0 rounded border border-border/40 bg-muted/40 px-1 py-0.5 text-[10px] font-mono uppercase text-muted-foreground leading-none">
                        {item.language}
                      </span>
                      {item.category && (
                        <span className="shrink-0 rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground leading-none">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 text-primary shrink-0 ms-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Counter */}
          {filteredTemplates.length > 0 && (
            <div className="border-t border-border/40 bg-muted/20 px-3 py-1.5 text-center text-[10px] text-muted-foreground select-none shrink-0">
              {filteredTemplates.length > MAX_RENDERED
                ? `عرض ${MAX_RENDERED} من ${filteredTemplates.length} — اكتب للتصفية`
                : `${filteredTemplates.length} نتيجة`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
