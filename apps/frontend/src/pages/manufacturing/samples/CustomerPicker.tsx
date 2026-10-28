import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, X, Check, Loader2, User, Phone, AlertCircle } from 'lucide-react';
import { manufacturingApi } from '../manufacturingApi';
import { QuickCustomerModal } from './QuickCustomerModal';

export interface CustomerPickerProps {
  value: string | null;
  displayName?: string;
  onChange: (customer: { id: string; name: string; phone?: string } | null) => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
}

export const CustomerPicker: React.FC<CustomerPickerProps> = ({
  value,
  displayName,
  onChange,
  onError,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [crmDisabledMessage, setCrmDisabledMessage] = useState<string | null>(null);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setCrmDisabledMessage(null);
      try {
        const list = await manufacturingApi.getCustomersList(query.trim() || undefined, { throwOnError: true });
        setResults(list || []);
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message || '';
        if (status === 403 || msg.includes('crm-basic') || msg.includes('تطبيق')) {
          const warning = 'تطبيق العملاء (CRM) غير مفعّل لهذه الشركة';
          setCrmDisabledMessage(warning);
          onError?.(warning);
        } else {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, onError]);

  const handleSelect = (customer: { id: string; name: string; phone?: string }) => {
    onChange(customer);
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleQuickCustomerCreated = (customer: { id: string; name: string; phone?: string }) => {
    onChange(customer);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Customer View or Search Input */}
      {value ? (
        <div className="flex items-center justify-between px-3 py-2 text-xs rounded-lg border border-primary/40 bg-primary/5 text-foreground">
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold">{displayName || 'عميل مسجل'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono border border-primary/20">
                مربوط
              </span>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="فك ربط العميل"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث بالاسم أو الهاتف لاختيار عميل مسجل..."
            className="w-full pr-9 pl-8 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:opacity-50"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5" />
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute left-3 top-2.5" />
          ) : query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground absolute left-2.5 top-2.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !value && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col">
          {/* Quick Add Button Header */}
          <div className="p-2 border-b border-border/80 bg-muted/30 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">العملاء المسجلين</span>
            <button
              type="button"
              onClick={() => {
                setIsQuickModalOpen(true);
                setIsOpen(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ إضافة عميل</span>
            </button>
          </div>

          {/* CRM Disabled Notice */}
          {crmDisabledMessage && (
            <div className="p-3 text-xs bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{crmDisabledMessage}</span>
            </div>
          )}

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-border/40 flex-1">
            {loading && results.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>جارٍ البحث في سجل العملاء...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <p>لا يوجد عميل مسجل مطابق للبحث.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="mt-2 text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إضافة «{query || 'عميل جديد'}» الآن</span>
                </button>
              </div>
            ) : (
              results.map((c, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full text-right px-3.5 py-2.5 text-xs flex items-center justify-between transition ${
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                        {c.name.charAt(0) || <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        {c.phone && (
                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {value === c.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Quick Customer Modal */}
      <QuickCustomerModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onCreated={handleQuickCustomerCreated}
      />
    </div>
  );
};
