import React, { useState, useEffect, useRef } from 'react';
import { History, RotateCcw, X, Cpu, Check, Link2, ExternalLink, ChevronDown } from 'lucide-react';
import { SpecialistAgent } from './specialists';
import { copyCopilotSessionLink, openCopilotSessionInNewTab } from './copilotLinkUtils';
import { apiClient } from '../../services/apiClient';
import { cn } from '@/lib/utils';

/**
 * عدّاد المسودات المعلقة — يظهر بجوار اسم الوكيل حتى لا تموت مسودة اعتماد
 * منسية في الطابور من غير ما التاجر يشوفها (يظهر العدد عند فتح المساعد).
 */
const PendingApprovalsBadge: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ approvals?: unknown[]; count?: number }>('/agent-approvals?status=pending')
      .then((res) => {
        if (cancelled) return;
        const approvals = res.data?.approvals;
        setCount(Array.isArray(approvals) ? approvals.length : res.data?.count ?? 0);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null || count <= 0) return null;
  const label = `${count} مسودة اعتماد معلقة`;
  return (
    <span
      className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold font-mono tabular-nums text-amber-600 dark:text-amber-400"
      title={label}
      aria-label={label}
    >
      {count}
    </span>
  );
};

interface CopilotHeaderProps {
  selectedAgent: SpecialistAgent;
  onSelectAgent?: (agent: SpecialistAgent) => void;
  specialists?: SpecialistAgent[];
  contextReason?: string | null;
  pageContextLabel: string;
  showSessionsList: boolean;
  onToggleSessionsList: () => void;
  onNewSession: () => void;
  onClose: () => void;
  activeSessionId?: string | null;
}

export const CopilotHeader: React.FC<CopilotHeaderProps> = ({
  selectedAgent,
  onSelectAgent,
  specialists,
  contextReason,
  pageContextLabel,
  showSessionsList,
  onToggleSessionsList,
  onNewSession,
  onClose,
  activeSessionId,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isAgentMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsAgentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAgentMenuOpen]);

  const handleCopyCurrentSession = async () => {
    if (!activeSessionId) return;
    const ok = await copyCopilotSessionLink(activeSessionId);
    if (ok) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 1800);
    }
  };

  const canSwitchAgent = Boolean(specialists && specialists.length > 1 && onSelectAgent);

  return (
    <header className="relative flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/60 bg-card/95 text-foreground backdrop-blur-md select-none">
      <div className="flex items-center gap-2 min-w-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            if (canSwitchAgent) {
              setIsAgentMenuOpen((prev) => !prev);
            }
          }}
          disabled={!canSwitchAgent}
          className={cn(
            "flex items-center gap-2.5 p-1 rounded-xl text-right transition-colors min-w-0",
            canSwitchAgent ? "cursor-pointer hover:bg-muted/50 active:scale-[0.99]" : "cursor-default"
          )}
          title={canSwitchAgent ? "اضغط لاختيار أو تبديل الوكيل" : undefined}
          aria-label={canSwitchAgent ? "اضغط لاختيار أو تبديل الوكيل" : undefined}
        >
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-2xs text-sm shrink-0">
            {selectedAgent.icon || <Cpu className="size-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">
                {selectedAgent.name}
              </h3>
              {canSwitchAgent && (
                <ChevronDown
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200 shrink-0",
                    isAgentMenuOpen ? "rotate-180 text-primary" : ""
                  )}
                />
              )}
              <PendingApprovalsBadge />
              {selectedAgent.isDefault && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.2 font-medium font-mono shrink-0">
                  لوحة التحكم
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{pageContextLabel}</span>
              {contextReason && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border/60 px-1.5 py-0.2 text-[9px] font-medium text-foreground">
                  <span className="size-1 rounded-full bg-emerald-500" />
                  {contextReason}
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleSessionsList}
          className={cn(
            "size-8 rounded-lg flex items-center justify-center transition-colors active:scale-95",
            showSessionsList
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
          )}
          title="سجل الجلسات السحابية"
          aria-label="سجل الجلسات السحابية"
        >
          <History className="size-4" />
        </button>

        <button
          type="button"
          onClick={onNewSession}
          className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors active:scale-95 cursor-pointer"
          title="بدء محادثة جديدة"
          aria-label="بدء محادثة جديدة"
        >
          <RotateCcw className="size-4" />
        </button>

        {activeSessionId && (
          <>
            <button
              type="button"
              onClick={handleCopyCurrentSession}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors active:scale-95 cursor-pointer"
              title="نسخ لينك الجلسة الحالية"
              aria-label="نسخ لينك الجلسة الحالية"
            >
              {hasCopied ? (
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Link2 className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => openCopilotSessionInNewTab(activeSessionId)}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors active:scale-95 cursor-pointer"
              title="افتح في تاب جديد"
              aria-label="افتح في تاب جديد"
            >
              <ExternalLink className="size-4" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors active:scale-95 mr-1 cursor-pointer"
          title="إغلاق (Esc)"
          aria-label="إغلاق المساعد"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Specialist Agent Switcher Dropdown */}
      {isAgentMenuOpen && canSwitchAgent && specialists && (
        <div
          ref={menuRef}
          className="absolute top-full right-3 left-3 sm:left-auto sm:w-84 mt-1 z-50 bg-popover text-popover-foreground border border-border shadow-2xl rounded-2xl p-2 animate-in fade-in-0 zoom-in-95 duration-150 max-h-88 overflow-y-auto backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 mb-1.5">
            <span className="text-[11px] font-semibold text-foreground/80">
              تبديل وكيل الذكاء الاصطناعي
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {specialists.length} وكيل متاح
            </span>
          </div>
          <div className="space-y-1">
            {specialists.map((agent) => {
              const isSelected = agent.id === selectedAgent.id || (agent.slug && agent.slug === selectedAgent.slug);
              return (
                <button
                  key={agent.id || agent.slug}
                  type="button"
                  onClick={() => {
                    onSelectAgent?.(agent);
                    setIsAgentMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-right text-xs transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold border border-primary/25 shadow-xs"
                      : "text-foreground hover:bg-muted/60 active:scale-[0.99]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{agent.icon || "🤖"}</span>
                    <div className="truncate text-right">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="truncate font-semibold">{agent.name}</span>
                        {agent.isDefault && (
                          <span className="text-[9px] bg-primary/15 text-primary border border-primary/25 rounded px-1.5 py-0.2 font-mono shrink-0">
                            لوحة التحكم
                          </span>
                        )}
                      </div>
                      {agent.badge && (
                        <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                          {agent.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default CopilotHeader;
