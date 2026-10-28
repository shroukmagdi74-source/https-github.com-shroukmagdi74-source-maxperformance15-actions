import React from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { resolveTemplateSection } from "@/data/templateSectionRegistry";
import {
  extractVariableNumbers,
  type MetaTemplate,
  statusBadge,
  statusIcon,
} from "../types";
import { MetaTemplateMessagePreview } from "./MetaTemplateMessagePreview";
import { MetaTemplateVarPlayground } from "./MetaTemplateVarPlayground";

interface MetaTemplateMobileCardProps {
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
  onDeleteTemplate: () => void;
}

export const MetaTemplateMobileCard: React.FC<
  MetaTemplateMobileCardProps
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
    <div
      className={`rounded-xl border bg-[color:var(--color-card)] p-3 transition-all ${
        isSelected
          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/[0.04] shadow-sm"
          : "border-[color:var(--shell-control-border)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleRow}
          aria-label={`تحديد قالب ${groupName}`}
          className="mt-1"
        />
        <button
          type="button"
          onClick={onToggleGroup}
          className="min-w-0 flex-1 text-start"
          aria-expanded={isExpanded}
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
            {isExpanded ? (
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
              )
            )}
          </div>
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-3 space-y-3 border-t border-[color:var(--shell-control-border)] pt-3">
          {groupTemplates.map((t) => {
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

                <MetaTemplateMessagePreview
                  template={t}
                  variantKey={variantKey}
                  substituteVars={substituteVars}
                />

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
                    <ExternalLink className="size-3" /> افتح في Meta Business
                  </a>
                )}

                <MetaTemplateVarPlayground
                  variantKey={variantKey}
                  varNumbers={varNumbers}
                  isOpen={isPreviewOpen}
                  onToggle={() => onToggleVarPreview(variantKey)}
                  varPreviewValues={varPreviewValues}
                  onVarPreviewChange={onVarPreviewChange}
                  isDesktop={false}
                />
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
              onClick={onDeleteTemplate}
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
};
