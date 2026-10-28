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
  Trash2,
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
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { resolveTemplateSection } from "@/data/templateSectionRegistry";
import {
  extractVariableNumbers,
  type MetaTemplate,
  statusBadge,
  statusIcon,
} from "../types";
import { MetaTemplateMessagePreview } from "./MetaTemplateMessagePreview";
import { MetaTemplateVarPlayground } from "./MetaTemplateVarPlayground";

interface MetaTemplateDesktopRowProps {
  groupName: string;
  groupTemplates: MetaTemplate[];
  isExpanded: boolean;
  onToggleGroup: () => void;
  isSelected: boolean;
  onToggleRow: () => void;
  varPreviewOpen: Record<string, boolean>;
  onToggleVarPreview: (variantKey: string) => void;
  varPreviewValues: Record<string, string>;
  onVarPreviewChange: (key: string, value: string) => void;
  substituteVars: (text: string, key: string) => string;
  onViewTemplate: (tpl: MetaTemplate) => void;
  onEditTemplate: (tpl: MetaTemplate) => void;
  onDuplicateTemplate: (tpl: MetaTemplate) => void;
  onDeleteTemplate: () => void;
}

export const MetaTemplateDesktopRow: React.FC<
  MetaTemplateDesktopRowProps
> = ({
  groupName,
  groupTemplates,
  isExpanded,
  onToggleGroup,
  isSelected,
  onToggleRow,
  varPreviewOpen,
  onToggleVarPreview,
  varPreviewValues,
  onVarPreviewChange,
  substituteVars,
  onViewTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) => {
  const uniqueStatuses = [...new Set(groupTemplates.map((t) => t.status))];
  const bestStatus = uniqueStatuses.includes("APPROVED")
    ? "APPROVED"
    : uniqueStatuses[0] ?? "PENDING";
  const StatusIcon = statusIcon[bestStatus] || AlertTriangle;
  const section = resolveTemplateSection(
    groupName,
    groupTemplates[0]?.category
  );

  return (
    <React.Fragment>
      {/* Group parent row */}
      <TableRow
        className={`cursor-pointer transition-colors hover:bg-[var(--color-muted)]/70 ${
          isSelected ? "bg-[color:var(--color-primary)]/[0.04]" : ""
        }`}
        onClick={onToggleGroup}
        aria-expanded={isExpanded}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleRow}
            aria-label={`تحديد قالب ${groupName}`}
            className="translate-y-[2px]"
          />
        </TableCell>
        <TableCell>
          {isExpanded ? (
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
              )
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
                <TooltipContent side="top">المزيد من الإجراءات</TooltipContent>
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
                  onClick={onDeleteTemplate}
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

      {/* Expanded sub-rows for languages */}
      {isExpanded &&
        groupTemplates.map((t) => {
          const headerComp = t.components?.find((c) => c.type === "HEADER");
          const bodyComp = t.components?.find((c) => c.type === "BODY");
          const footerComp = t.components?.find((c) => c.type === "FOOTER");
          const buttonsComp = t.components?.find((c) => c.type === "BUTTONS");
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
                  <span className="font-medium font-mono">{t.language}</span>
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
                    <ExternalLink className="size-3" /> افتح في Meta Business
                  </a>
                )}
              </TableCell>
              <TableCell colSpan={3}>
                <MetaTemplateMessagePreview
                  template={t}
                  variantKey={variantKey}
                  substituteVars={substituteVars}
                />

                <MetaTemplateVarPlayground
                  variantKey={variantKey}
                  varNumbers={varNumbers}
                  isOpen={isPreviewOpen}
                  onToggle={() => onToggleVarPreview(variantKey)}
                  varPreviewValues={varPreviewValues}
                  onVarPreviewChange={onVarPreviewChange}
                  isDesktop={true}
                />
              </TableCell>
            </TableRow>
          );
        })}
    </React.Fragment>
  );
};
