import React, { useId } from "react";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../../../components/ui/sheet";

export function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[13px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">
        {label}
        {required ? <span className="mr-1 text-rose-500">*</span> : null}
      </label>
      <div className="relative">{children}</div>
      {error ? <p className="text-xs font-bold text-rose-500 px-1">{error}</p> : null}
    </div>
  );
}

export function ResponsiveOverlay({
  mobile,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  bodyClassName,
}: {
  mobile: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bodyClassName?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();

  if (!open) {
    return null;
  }

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[96vh] rounded-t-2xl border-t border-border/40 bg-white px-0 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-0 shadow-lg dark:bg-card"
          dir="rtl"
        >
          <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-muted/60" />
          <SheetHeader className="px-6 pb-4 pt-6 text-right">
            <SheetTitle className="text-right text-2xl font-black tracking-tight">{title}</SheetTitle>
            {description ? (
              <SheetDescription className="text-right text-sm font-medium text-muted-foreground/80">
                {description}
              </SheetDescription>
            ) : null}
          </SheetHeader>
          <div className={cn("overflow-y-auto px-6 py-4", bodyClassName)}>{children}</div>
          {footer ? (
            <div className="mt-2 border-t border-border/40 bg-muted/10 px-6 py-6 flex gap-3">
              {footer}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className={cn(
          "max-w-4xl w-full rounded-xl border border-border/40 bg-white shadow-lg dark:bg-card max-h-[90vh] flex flex-col overflow-hidden",
          bodyClassName
        )}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-start justify-between border-b border-border/40 p-8">
          <div>
            <h2 id={titleId} className="text-3xl font-black tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm font-medium text-muted-foreground/70">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
        {footer ? (
          <div className="border-t border-border/40 bg-muted/10 p-8 flex justify-end gap-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
