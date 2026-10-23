import React from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Languages,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { resolveTemplateSection } from "@/data/templateSectionRegistry";
import {
  extractVariableNumbers,
  MetaTemplate,
  statusBadge,
  statusIcon,
} from "./types";

interface MetaTemplateTableProps {
  loading: boolean;
  selectedSessionId: string;
  groupedTemplates: Record<string, MetaTemplate[]>;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (name: string) => void;
  selectedRows: Set<string>;
  onToggleRow: (name: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onClearSelectedRows: () => void;
  varPreviewOpen: Record<string, boolean>;
  onToggleVarPreview: (variantKey: string) => void;
  varPreviewValues: Record<string, string>;
  onVarPreviewChange: (key: string, value: string) => void;
  substituteVars: (text: string, key: string) => string;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenLibrary: () => void;
  onViewTemplate: (tpl: MetaTemplate) => void;
  onEditTemplate: (tpl: MetaTemplate) => void;
  onDuplicateTemplate: (tpl: MetaTemplate) => void;
  onDeleteTemplate: (name: string) => void;
}

export const MetaTemplateTable: React.FC<MetaTemplateTableProps> = ({
  loading,
  selectedSessionId,
  groupedTemplates,
  expandedGroups,
  onToggleGroup,
  selectedRows,
  onToggleRow,
  onToggleAll,
  allSelected,
  someSelected,
  onClearSelectedRows,
  varPreviewOpen,
  onToggleVarPreview,
  varPreviewValues,
  onVarPreviewChange,
  substituteVars,
  onRefresh,
  onOpenCreate,
  onOpenLibrary,
  onViewTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2 rounded-xl border border-[color:var(--shell-control-border)] p-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-[color:var(--shell-control-border)] p-3"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const groupEntries = Object.entries(groupedTemplates);

  if (groupEntries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-inner dark:from-emerald-950/40 dark:to-emerald-900/20">
          <FileText className="size-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-[color:var(--color-foreground)]">
            {selectedSessionId ? "لا توجد قوالب بعد" : "اختر جلسة أولاً"}
          </p>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-[color:var(--color-muted-foreground)]">
            {selectedSessionId
              ? "القوالب هي رسائل معتمدة من Meta تقدر تبعت بيها حملات واتساب. ابدأ بإنشاء أول قالب أو اختار من المكتبة الجاهزة."
              : "اختر جلسة واتساب من القائمة أعلاه لعرض القوالب المسجلة في Meta Cloud API."}
          </p>
        </div>
        {selectedSessionId ? (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              onClick={onOpenCreate}
              className="h-10 rounded-full px-5 text-sm font-semibold shadow-sm hover:shadow-md"
            >
              <Plus className="size-4" /> أنشئ أول قالب
            </Button>
            <Button
              variant="outline"
              onClick={onOpenLibrary}
              className="h-10 rounded-full"
            >
              <FileText className="size-4" /> تصفّح المكتبة الجاهزة
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {/* Bulk action toolbar */}
      {selectedRows.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/[0.04] px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-3.5 text-[color:var(--color-primary)]" />
            <span className="font-medium">
              تم تحديد{" "}
              <span className="tabular-nums font-mono font-bold">
                {selectedRows.size}
              </span>{" "}
              قالب
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelectedRows}
              className="h-7 rounded-full px-2 text-xs"
            >
              إلغاء التحديد
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-7 rounded-full text-xs"
            >
              <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />{" "}
              تحديث المحدد
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              onClick={() => {
                const first = Array.from(selectedRows)[0];
                if (first) onDeleteTemplate(first);
              }}
            >
              <Trash2 className="size-3" /> حذف المحدد ({selectedRows.size})
            </Button>
          </div>
        </div>
      ) : null}

      {/* Mobile card view */}
      <div className="space-y-2 md:hidden">
        {groupEntries.map(([groupName, groupTemplates]) => {
          const expanded = expandedGroups[groupName] === true;
          const uniqueStatuses = [
            ...new Set(groupTemplates.map((t) => t.status)),
          ];
          const bestStatus = uniqueStatuses.includes("APPROVED")
            ? "APPROVED"
            : uniqueStatuses[0] ?? "PENDING";
          const StatusIcon = statusIcon[bestStatus] || AlertTriangle;
          const isSelected = selectedRows.has(groupName);
          const section = resolveTemplateSection(
            groupName,
            groupTemplates[0]?.category,
          );

          return (
            <div
              key={groupName}
              className={`rounded-xl border bg-[color:var(--color-card)] p-3 transition-all ${
                isSelected
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/[0.04] shadow-sm"
                  : "border-[color:var(--shell-control-border)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleRow(groupName)}
                  aria-label={`تحديد قالب ${groupName}`}
                  className="mt-1"
                />
                <button
                  type="button"
                  onClick={() => onToggleGroup(groupName)}
                  className="min-w-0 flex-1 text-start"
                  aria-expanded={expanded}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" dir="ltr">
                        {groupName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={statusBadge[bestStatus] || ""}
                        >
                          <StatusIcon className="ml-1 size-3.5 inline" />
                          {bestStatus}
                        </Badge>
                        <span className="rounded-full bg-[color:var(--color-muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-muted-foreground)]">
                          {groupTemplates[0]?.category}
                        </span>
                        <span className="rounded-full bg-[color:var(--color-muted)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-muted-foreground)]">
                          {section.label}
                        </span>
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronDown className="size-4 shrink-0 text-[color:var(--color-muted-foreground)]" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-[color:var(--color-muted-foreground)]" />
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {[...new Set(groupTemplates.map((t) => t.language))].map(
                      (lang) => (
                        <span
                          key={lang}
                          className="rounded bg-[color:var(--color-muted)] px-1.5 py-0.5 text-[10px] font-mono text-[color:var(--color-muted-foreground)]"
                        >
                          {lang}
                        </span>
                      ),
                    )}
                  </div>
                </button>
              </div>

              {expanded ? (
                <div className="mt-3 space-y-3 border-t border-[color:var(--shell-control-border)] pt-3">
                  {groupTemplates.map((t) => {
                    const headerComp = t.components?.find(
                      (c) => c.type === "HEADER",
                    );
                    const bodyComp = t.components?.find(
                      (c) => c.type === "BODY",
                    );
                    const footerComp = t.components?.find(
                      (c) => c.type === "FOOTER",
                    );
                    const buttonsComp = t.components?.find(
                      (c) => c.type === "BUTTONS",
                    );
                    const variantKey = `${groupName}::${t.language}`;
                    const allText = [
                      headerComp?.text,
                      bodyComp?.text,
                      footerComp?.text,
                      buttonsComp?.buttons?.[0]?.url,
                    ]
                      .filter(Boolean)
                      .join(" ");
                    const varNumbers = extractVariableNumbers(allText);
                    const isPreviewOpen = varPreviewOpen[variantKey] === true;

                    return (
                      <div key={t.id ?? t.language} className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-[color:var(--color-muted-foreground)]">
                            {t.language} · ID: {t.id?.slice(-8) ?? "-"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${statusBadge[t.status] || ""}`}
                          >
                            {t.status}
                          </Badge>
                        </div>
                        {/* WhatsApp-style inline preview */}
                        <div
                          className="rounded-lg border border-emerald-200/60 bg-white px-3 py-2 text-sm shadow-sm dark:border-emerald-900/40 dark:bg-[#0b141a]"
                          dir={
                            t.language === "ar" || t.language === "ur"
                              ? "rtl"
                              : "ltr"
                          }
                        >
                          {headerComp?.text ? (
                            <p className="font-semibold text-[#111b21] dark:text-white">
                              {substituteVars(headerComp.text, variantKey)}
                            </p>
                          ) : null}
                          {bodyComp?.text ? (
                            <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#111b21] dark:text-white">
                              {substituteVars(bodyComp.text, variantKey)
                                .split(/(\{\{\d+\}\})/g)
                                .map((part, idx) =>
                                  /^\{\{\d+\}\}$/.test(part) ? (
                                    <span
                                      key={idx}
                                      className="mx-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                                    >
                                      {part}
                                    </span>
                                  ) : (
                                    <span key={idx}>{part}</span>
                                  ),
                                )}
                            </p>
                          ) : null}
                          {footerComp?.text ? (
                            <p className="mt-1 text-[11px] text-[#667781] dark:text-[#aebac1]">
                              {substituteVars(footerComp.text, variantKey)}
                            </p>
                          ) : null}
                          {buttonsComp?.buttons?.length ? (
                            <div className="mt-2 flex flex-col gap-1 border-t border-[#e9edef] pt-1 dark:border-[#222d34]">
                              {buttonsComp.buttons.map((b, idx) => (
                                <div
                                  key={idx}
                                  className="text-center text-xs font-medium text-[#00a884] dark:text-[#00d294]"
                                >
                                  {b.text || `زر ${idx + 1}`}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {t.rejected_reason && (
                          <p className="text-[11px] text-red-600 dark:text-red-400">
                            {t.rejected_reason}
                          </p>
                        )}
                        {t.status === "REJECTED" && (
                          <a
                            href="https://business.facebook.com/latest/whatsapp_manager/manage_templates"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <ExternalLink className="size-3" /> افتح في Meta
                            Business
                          </a>
                        )}
                        {/* Variable playground */}
                        {varNumbers.length > 0 ? (
                          <div className="rounded-lg border border-dashed border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/40 p-2">
                            <button
                              type="button"
                              onClick={() => onToggleVarPreview(variantKey)}
                              aria-expanded={isPreviewOpen}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                            >
                              {isPreviewOpen ? (
                                <ChevronDown className="size-3" />
                              ) : (
                                <ChevronRight className="size-3" />
                              )}
                              <span>تجربة المتغيرات</span>
                              <span className="rounded-full bg-[color:var(--color-card)]/60 px-1.5 text-[10px] font-bold tabular-nums font-mono">
                                {varNumbers.length}
                              </span>
                            </button>
                            {isPreviewOpen ? (
                              <div className="mt-2 flex flex-col gap-1.5">
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
                                          onVarPreviewChange(
                                            previewKey,
                                            e.target.value,
                                          )
                                        }
                                        placeholder={`قيمة ${n}`}
                                        aria-label={`قيمة المتغير ${n}`}
                                        className="h-9 flex-1 text-sm"
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tmpl = groupTemplates[0];
                        if (tmpl) onViewTemplate(tmpl);
                      }}
                      className="h-9 flex-1 rounded-full text-xs"
                    >
                      <Eye className="size-3.5" /> عرض
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tmpl = groupTemplates[0];
                        if (tmpl) onEditTemplate(tmpl);
                      }}
                      className="h-9 flex-1 rounded-full text-xs"
                    >
                      <Pencil className="size-3.5" /> تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteTemplate(groupName)}
                      aria-label="حذف القالب"
                      className="size-9 rounded-full text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={onToggleAll}
                  aria-label="تحديد كل القوالب الظاهرة"
                  className="translate-y-[2px]"
                />
              </TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>اللغات</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupEntries.map(([groupName, groupTemplates]) => {
              const expanded = expandedGroups[groupName] === true;
              const uniqueStatuses = [
                ...new Set(groupTemplates.map((t) => t.status)),
              ];
              const bestStatus = uniqueStatuses.includes("APPROVED")
                ? "APPROVED"
                : uniqueStatuses[0] ?? "PENDING";
              const StatusIcon = statusIcon[bestStatus] || AlertTriangle;
              const isSelected = selectedRows.has(groupName);
              const section = resolveTemplateSection(
                groupName,
                groupTemplates[0]?.category,
              );

              return (
                <React.Fragment key={groupName}>
                  <TableRow
                    className={`cursor-pointer transition-colors hover:bg-[var(--color-muted)]/70 ${isSelected ? "bg-[color:var(--color-primary)]/[0.04]" : ""}`}
                    onClick={() => onToggleGroup(groupName)}
                    aria-expanded={expanded}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleRow(groupName)}
                        aria-label={`تحديد قالب ${groupName}`}
                        className="translate-y-[2px]"
                      />
                    </TableCell>
                    <TableCell>
                      {expanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium font-mono text-xs sm:text-sm">
                      {groupName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadge[bestStatus] || ""}
                      >
                        <StatusIcon className="ml-1 size-3.5 inline" />
                        {bestStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{groupTemplates[0]?.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${section.badge}`}
                        title={section.description || section.label}
                      >
                        {section.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(groupTemplates.map((t) => t.language))].map(
                          (lang) => (
                            <Badge
                              key={lang}
                              variant="secondary"
                              className="text-[10px] font-mono"
                            >
                              {lang}
                            </Badge>
                          ),
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="معاينة سريعة"
                              onClick={() => {
                                const tmpl = groupTemplates[0];
                                if (tmpl) onViewTemplate(tmpl);
                              }}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">معاينة سريعة</TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="المزيد من الإجراءات"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              المزيد من الإجراءات
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={4}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                const tmpl = groupTemplates[0];
                                if (tmpl) onEditTemplate(tmpl);
                              }}
                            >
                              <Pencil className="ml-2 size-4" />
                              تعديل القالب
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const tmpl = groupTemplates[0];
                                if (tmpl) onViewTemplate(tmpl);
                              }}
                            >
                              <FileText className="ml-2 size-4" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const tmpl = groupTemplates[0];
                                if (tmpl) onDuplicateTemplate(tmpl);
                              }}
                            >
                              <Copy className="ml-2 size-4" />
                              تكرار القالب
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteTemplate(groupName)}
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            >
                              <Trash2 className="ml-2 size-4" />
                              حذف القالب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded &&
                    groupTemplates.map((t) => {
                      const headerComp = t.components?.find(
                        (c) => c.type === "HEADER",
                      );
                      const bodyComp = t.components?.find(
                        (c) => c.type === "BODY",
                      );
                      const footerComp = t.components?.find(
                        (c) => c.type === "FOOTER",
                      );
                      const buttonsComp = t.components?.find(
                        (c) => c.type === "BUTTONS",
                      );
                      const variantKey = `${groupName}::${t.language}`;
                      const allText = [
                        headerComp?.text,
                        bodyComp?.text,
                        footerComp?.text,
                        buttonsComp?.buttons?.[0]?.url,
                      ]
                        .filter(Boolean)
                        .join(" ");
                      const varNumbers = extractVariableNumbers(allText);
                      const isPreviewOpen = varPreviewOpen[variantKey] === true;

                      return (
                        <TableRow
                          key={t.name + t.language}
                          className="bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)]"
                        >
                          <TableCell></TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              <Languages className="size-3.5 text-[color:var(--color-muted-foreground)]" />
                              <span className="font-medium font-mono">
                                {t.language}
                              </span>
                              <span className="text-[10px] tabular-nums font-mono text-[color:var(--color-muted-foreground)]">
                                ID: {t.id || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusBadge[t.status] || ""}
                            >
                              <StatusIcon className="ml-1 size-3.5 inline" />
                              {t.status}
                            </Badge>
                            {t.rejected_reason && (
                              <p className="mt-1 text-[10px] text-red-600 dark:text-red-400">
                                {t.rejected_reason}
                              </p>
                            )}
                            {t.status === "REJECTED" && (
                              <a
                                href="https://business.facebook.com/latest/whatsapp_manager/manage_templates"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline dark:text-blue-400"
                              >
                                <ExternalLink className="size-3" /> افتح في Meta
                                Business
                              </a>
                            )}
                          </TableCell>
                          <TableCell colSpan={3}>
                            <div
                              className="rounded-lg border border-emerald-200/60 bg-white px-3 py-2 shadow-sm dark:border-emerald-900/40 dark:bg-[#0b141a]"
                              dir={
                                t.language === "ar" || t.language === "ur"
                                  ? "rtl"
                                  : "ltr"
                              }
                            >
                              {headerComp?.text ? (
                                <p className="text-sm font-semibold text-[#111b21] dark:text-white">
                                  {substituteVars(headerComp.text, variantKey)}
                                </p>
                              ) : headerComp?.format &&
                                headerComp.format !== "TEXT" ? (
                                <div className="mb-2 flex h-20 items-center justify-center rounded bg-emerald-50 text-[10px] uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                  {headerComp.format} media
                                </div>
                              ) : null}
                              {bodyComp?.text ? (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#111b21] dark:text-white">
                                  {substituteVars(bodyComp.text, variantKey)
                                    .split(/(\{\{\d+\}\})/g)
                                    .map((part, idx) =>
                                      /^\{\{\d+\}\}$/.test(part) ? (
                                        <span
                                          key={idx}
                                          className="mx-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                                        >
                                          {part}
                                        </span>
                                      ) : (
                                        <span key={idx}>{part}</span>
                                      ),
                                    )}
                                </p>
                              ) : null}
                              {footerComp?.text ? (
                                <p className="mt-1 text-[11px] text-[#667781] dark:text-[#aebac1]">
                                  {substituteVars(footerComp.text, variantKey)}
                                </p>
                              ) : null}
                              {buttonsComp?.buttons?.length ? (
                                <div className="mt-2 flex flex-col gap-1 border-t border-[#e9edef] pt-1 dark:border-[#222d34]">
                                  {buttonsComp.buttons.map((b, idx) => (
                                    <div
                                      key={idx}
                                      className="text-center text-xs font-medium text-[#00a884] dark:text-[#00d294]"
                                    >
                                      {b.text || `زر ${idx + 1}`}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {varNumbers.length > 0 ? (
                              <div className="mt-2 rounded-lg border border-dashed border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/40 p-2">
                                <button
                                  type="button"
                                  onClick={() => onToggleVarPreview(variantKey)}
                                  aria-expanded={isPreviewOpen}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                                >
                                  {isPreviewOpen ? (
                                    <ChevronDown className="size-3" />
                                  ) : (
                                    <ChevronRight className="size-3" />
                                  )}
                                  <span>تجربة المتغيرات</span>
                                  <span className="rounded-full bg-[color:var(--color-card)]/60 px-1.5 text-[10px] font-bold tabular-nums font-mono">
                                    {varNumbers.length}
                                  </span>
                                </button>
                                {isPreviewOpen ? (
                                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                                            value={
                                              varPreviewValues[previewKey] ?? ""
                                            }
                                            onChange={(e) =>
                                              onVarPreviewChange(
                                                previewKey,
                                                e.target.value,
                                              )
                                            }
                                            placeholder={`قيمة ${n}`}
                                            aria-label={`قيمة المتغير ${n}`}
                                            className="h-7 flex-1 text-xs"
                                          />
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
