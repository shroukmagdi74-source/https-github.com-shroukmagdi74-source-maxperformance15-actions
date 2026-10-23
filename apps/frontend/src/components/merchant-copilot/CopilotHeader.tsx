import React, { useState, useEffect } from 'react';
import { History, RotateCcw, X, Cpu, Check, Link2, ExternalLink } from 'lucide-react';
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
  contextReason,
  pageContextLabel,
  showSessionsList,
  onToggleSessionsList,
  onNewSession,
  onClose,
  activeSessionId,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyCurrentSession = async () => {
    if (!activeSessionId) return;
    const ok = await copyCopilotSessionLink(activeSessionId);
    if (ok) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 1800);
    }
  };

  return (
    <header className="relative flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/60 bg-card/95 text-foreground backdrop-blur-md select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 p-1 rounded-xl text-right">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-2xs text-sm shrink-0">
            {selectedAgent.icon || <Cpu className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                {selectedAgent.name}
              </h3>
              <PendingApprovalsBadge />
              {selectedAgent.isDefault && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.2 font-medium font-mono">
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
        </div>
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
    </header>
  );
};

export default CopilotHeader;
