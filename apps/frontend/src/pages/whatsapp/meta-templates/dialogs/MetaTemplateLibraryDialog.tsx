import React from "react";
import { FileText, Plus, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { templateLibrary } from "@/data/metaTemplateLibrary";
import { CATEGORY_STYLE } from "../types";

interface MetaTemplateLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  librarySearch: string;
  onSearchChange: (query: string) => void;
  domainFilter: "ALL" | "ORDERS" | "LOYALTY" | "CART" | "MARKETING" | "AUTH";
  onDomainFilterChange: (
    filter: "ALL" | "ORDERS" | "LOYALTY" | "CART" | "MARKETING" | "AUTH",
  ) => void;
  libraryByCategory: Record<string, typeof templateLibrary>;
  filteredLibraryCount: number;
  onApplyTemplate: (tpl: (typeof templateLibrary)[number]) => void;
}

export const MetaTemplateLibraryDialog: React.FC<MetaTemplateLibraryDialogProps> = ({
  open,
  onOpenChange,
  librarySearch,
  onSearchChange,
  domainFilter,
  onDomainFilterChange,
  libraryByCategory,
  filteredLibraryCount,
  onApplyTemplate,
}) => {
  const domainPills: Array<{
    id: "ALL" | "ORDERS" | "LOYALTY" | "CART" | "MARKETING" | "AUTH";
    label: string;
  }> = [
    { id: "ALL", label: "الكل" },
    { id: "ORDERS", label: "دورة الطلبات" },
    { id: "LOYALTY", label: "الولاء والمكافآت" },
    { id: "CART", label: "السلات المتروكة" },
    { id: "MARKETING", label: "تسويق وعروض" },
    { id: "AUTH", label: "المصادقة و OTP" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-sm text-white">
              <FileText className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">قوالب جاهزة</DialogTitle>
              <DialogDescription>
                اختر قالباً لبدء الإنشاء. يتم تعبئة الحقول تلقائياً — يمكنك
                تعديلها قبل الإرسال.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
          <Input
            value={librarySearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، الوصف، التصنيف..."
            className="h-11 px-9 rounded-2xl border-[color:var(--shell-control-border)] bg-[var(--color-muted)] transition-all duration-200 focus:scale-[1.01]"
          />
          {librarySearch && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted-foreground)] transition-all duration-200 hover:scale-110 hover:text-[color:var(--color-foreground)]"
              aria-label="مسح البحث"
            >
              <XCircle className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {domainPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => onDomainFilterChange(pill.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                domainFilter === pill.id
                  ? "bg-[color:var(--color-primary)] text-white shadow-sm"
                  : "border border-[color:var(--shell-control-border)] bg-[var(--color-muted)] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[420px] space-y-6 overflow-y-auto">
          {filteredLibraryCount === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Search className="size-10 text-[color:var(--color-muted-foreground)]" />
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                لا توجد نتائج للبحث
              </p>
              <button
                onClick={() => onSearchChange("")}
                className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                مسح البحث
              </button>
            </div>
          ) : (
            Object.entries(libraryByCategory).map(([category, templates]) => {
              const style = CATEGORY_STYLE[category] || CATEGORY_STYLE.UTILITY;
              const IconComponent = style.icon;

              return (
                <section key={category}>
                  <div
                    className={`sticky top-0 z-10 mb-3 flex items-center gap-2 rounded-2xl p-2.5 ${style.sectionBg} backdrop-blur-sm`}
                  >
                    <span className="flex size-8 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-[var(--shell-overlay-bg)] text-primary">
                      <IconComponent className="size-4" />
                    </span>
                    <span
                      className={`bg-gradient-to-r ${style.gradient} bg-clip-text text-sm font-bold text-transparent`}
                    >
                      {category === "AUTHENTICATION"
                        ? "المصادقة"
                        : category === "MARKETING"
                          ? "تسويق"
                          : "خدمات"}
                    </span>
                    <span className="mr-auto text-[11px] tabular-nums font-mono text-[color:var(--color-muted-foreground)]">
                      {templates.length} قالب
                    </span>
                  </div>
                  <div className="space-y-2">
                    {templates.map((libTpl) => (
                      <button
                        key={libTpl.id}
                        type="button"
                        onClick={() => onApplyTemplate(libTpl)}
                        className="group w-full rounded-2xl border border-[color:var(--shell-control-border)] bg-[var(--color-muted)] p-4 text-right transition-all duration-200 hover:scale-[1.01] hover:border-[color:var(--color-primary)] hover:shadow-md hover:bg-[var(--shell-overlay-bg)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium font-mono">
                                {libTpl.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${style.badge}`}
                              >
                                {libTpl.category}
                              </Badge>
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-[color:var(--color-muted-foreground)]">
                              {libTpl.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <div className="flex -space-x-1">
                                {libTpl.languages.slice(0, 4).map((l) => (
                                  <span
                                    key={l.code}
                                    className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--color-muted)] bg-[var(--shell-overlay-bg)] text-[9px] font-medium uppercase font-mono text-[color:var(--color-muted-foreground)] shadow-sm"
                                  >
                                    {l.code}
                                  </span>
                                ))}
                                {libTpl.languages.length > 4 && (
                                  <span className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--color-muted)] bg-[var(--color-muted)] text-[9px] tabular-nums font-mono text-[color:var(--color-muted-foreground)]">
                                    +{libTpl.languages.length - 4}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] tabular-nums font-mono text-[color:var(--color-muted-foreground)]">
                                {libTpl.languages.length}{" "}
                                {libTpl.languages.length > 1 ? "لغات" : "لغة"}
                              </span>
                              <span className="mx-1 text-[10px] text-[color:var(--color-muted-foreground)]">
                                ·
                              </span>
                              {libTpl.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[var(--shell-overlay-bg)] px-2 py-0.5 text-[10px] text-[color:var(--color-muted-foreground)]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="shrink-0 self-center rounded-xl border border-[color:var(--shell-control-border)] bg-[var(--shell-overlay-bg)] p-2 transition-all duration-200 group-hover:scale-110 group-hover:border-[color:var(--color-primary)]">
                            <Plus className="size-4 text-[color:var(--color-muted-foreground)] transition-colors group-hover:text-[var(--color-primary)]" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
