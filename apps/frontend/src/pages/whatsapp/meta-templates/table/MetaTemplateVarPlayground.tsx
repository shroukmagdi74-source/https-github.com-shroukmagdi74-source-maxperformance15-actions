import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MetaTemplateVarPlaygroundProps {
  variantKey: string;
  varNumbers: string[];
  isOpen: boolean;
  onToggle: () => void;
  varPreviewValues: Record<string, string>;
  onVarPreviewChange: (key: string, value: string) => void;
  isDesktop?: boolean;
}

export const MetaTemplateVarPlayground: React.FC<
  MetaTemplateVarPlaygroundProps
> = ({
  variantKey,
  varNumbers,
  isOpen,
  onToggle,
  varPreviewValues,
  onVarPreviewChange,
  isDesktop = false,
}) => {
  if (varNumbers.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-dashed border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/40 p-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
      >
        {isOpen ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        <span>تجربة المتغيرات</span>
        <span className="rounded-full bg-[color:var(--color-card)]/60 px-1.5 text-[10px] font-bold tabular-nums font-mono">
          {varNumbers.length}
        </span>
      </button>

      {isOpen ? (
        <div
          className={`mt-2 ${
            isDesktop
              ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
              : "flex flex-col gap-1.5"
          }`}
        >
          {varNumbers.map((v) => {
            const n = v.replace(/\D/g, "");
            const previewKey = `${variantKey}::${n}`;
            return (
              <label
                key={n}
                className="flex items-center gap-2 rounded-md bg-[color:var(--color-card)] px-2 py-1.5 text-xs"
              >
                <span className="min-w-[28px] rounded bg-amber-100 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                  {`{{${n}}}`}
                </span>
                <Input
                  value={varPreviewValues[previewKey] ?? ""}
                  onChange={(e) =>
                    onVarPreviewChange(previewKey, e.target.value)
                  }
                  placeholder={`قيمة ${n}`}
                  aria-label={`قيمة المتغير ${n}`}
                  className={`${isDesktop ? "h-7 flex-1 text-xs" : "h-9 flex-1 text-sm"}`}
                />
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
