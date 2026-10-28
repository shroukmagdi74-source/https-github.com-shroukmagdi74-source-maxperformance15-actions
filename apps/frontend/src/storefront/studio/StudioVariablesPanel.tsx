import React, { useCallback, useMemo, useState } from "react";
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  STUDIO_VARIABLE_DEFINITIONS,
  STUDIO_VARIABLE_GROUPS,
  buildStudioVariablesCss,
  getCustomStudioVariableNames,
  normalizeStudioVariables,
  normalizeStudioVariableName,
  parseStudioVariablesJson,
  resolveStudioVariables,
  serializeStudioVariablesJson,
  type StudioVariableDefinition,
  type StudioVariableValues,
} from "./utils/studioVariables";

export interface StudioVariablesPanelProps {
  /** Stored overrides (`designTokens.variables`). */
  variables?: Record<string, unknown> | null;
  /** Receives the next overrides map — one call = one undo step. */
  onChange: (next: StudioVariableValues) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

const COLOR_SAFE_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const toColorInputValue = (value: string | undefined, fallback: string): string => {
  if (value && COLOR_SAFE_RE.test(value)) return value;
  if (fallback && COLOR_SAFE_RE.test(fallback)) return fallback;
  return "#000000";
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    if (typeof document !== "undefined") {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const copied =
        typeof document.execCommand === "function" ? document.execCommand("copy") : false;
      document.body.removeChild(area);
      return copied;
    }
  } catch {
    // ignore — caller surfaces the failure
  }
  return false;
}

const VariableRow: React.FC<{
  definition: StudioVariableDefinition;
  value: string;
  isOverridden: boolean;
  draft?: string;
  readOnly: boolean;
  onEdit: (name: string, value: string) => void;
  onReset: (name: string) => void;
}> = ({ definition, value, isOverridden, draft, readOnly, onEdit, onReset }) => {
  const displayValue = draft ?? value;
  const inputId = `studio-var-input-${definition.name}`;
  return (
    <div
      data-testid={`studio-variable-row-${definition.name}`}
      className="flex items-center gap-2 rounded-lg border border-[#2b2d35] bg-[#1f222b] px-2 py-1.5"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <label htmlFor={inputId} className="truncate text-[10.5px] font-semibold text-[#e8eaee]">
          {definition.label}
        </label>
        <span className="truncate font-mono text-[9px] text-[#8f96a3]" dir="ltr">
          --sf-{definition.name}
        </span>
      </div>

      {definition.kind === "color" && (
        <input
          type="color"
          aria-label={`${definition.label} — منتقي اللون`}
          data-testid={`studio-var-color-${definition.name}`}
          value={toColorInputValue(value, definition.defaultValue)}
          disabled={readOnly}
          onChange={(event) => onEdit(definition.name, event.target.value)}
          className="h-6 w-7 shrink-0 cursor-pointer rounded border border-[#3a3d47] bg-transparent p-0.5 disabled:opacity-40"
        />
      )}

      <input
        id={inputId}
        data-testid={inputId}
        type="text"
        dir="ltr"
        spellCheck={false}
        value={displayValue}
        disabled={readOnly}
        onChange={(event) => onEdit(definition.name, event.target.value)}
        onBlur={(event) => {
          if (!event.target.value.trim()) onReset(definition.name);
        }}
        className="w-[104px] shrink-0 rounded-md border border-[#3a3d47] bg-[#15161a] px-1.5 py-1 font-mono text-[10px] text-[#e8eaee] outline-none focus:border-[#2b6cf6] disabled:opacity-40"
      />

      <button
        type="button"
        title="إرجاع الافتراضي"
        aria-label={`إرجاع ${definition.label} للافتراضي`}
        data-testid={`studio-var-reset-${definition.name}`}
        disabled={readOnly || !isOverridden}
        onClick={() => onReset(definition.name)}
        className={`shrink-0 rounded-md p-1 transition-colors ${
          isOverridden
            ? "text-[#60a5fa] hover:bg-[#2b6cf6]/20"
            : "text-[#4b505c] cursor-default"
        } disabled:opacity-40`}
      >
        <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/**
 * TOKENS-1 — Variables manager panel.
 *
 * Every control writes `--sf-<name>` overrides through a single `onChange` call, so the
 * page-level `<style>` re-renders immediately and every section referencing the variable
 * updates at once (one undo step, coalesced by the studio history hook).
 */
export const StudioVariablesPanel: React.FC<StudioVariablesPanelProps> = ({
  variables,
  onChange,
  onClose,
  readOnly = false,
}) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);

  const overrides = useMemo(() => normalizeStudioVariables(variables), [variables]);
  const resolved = useMemo(() => resolveStudioVariables(variables), [variables]);
  const css = useMemo(() => buildStudioVariablesCss(variables), [variables]);
  const customNames = useMemo(() => getCustomStudioVariableNames(variables), [variables]);
  const overriddenCount = Object.keys(overrides).length;

  const commit = useCallback(
    (name: string, rawValue: string) => {
      const next: StudioVariableValues = { ...overrides };
      const normalizedName = normalizeStudioVariableName(name);
      if (!normalizedName) return;
      const trimmed = rawValue.trim();
      const definition = STUDIO_VARIABLE_DEFINITIONS.find((item) => item.name === normalizedName);
      if (!trimmed || (definition && trimmed === definition.defaultValue)) {
        delete next[normalizedName];
      } else {
        next[normalizedName] = trimmed;
      }
      onChange(next);
    },
    [onChange, overrides]
  );

  const handleEdit = useCallback(
    (name: string, value: string) => {
      setDrafts((prev) => ({ ...prev, [name]: value }));
      if (!value.trim()) return;
      commit(name, value);
    },
    [commit]
  );

  const handleReset = useCallback(
    (name: string) => {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      commit(name, "");
    },
    [commit]
  );

  const handleCopyCss = useCallback(async () => {
    const ok = await copyToClipboard(css);
    if (ok) {
      setCopied(true);
      toast.success("تم نسخ متغيرات CSS إلى الحافظة");
      if (typeof window !== "undefined") {
        window.setTimeout(() => setCopied(false), 1800);
      }
    } else {
      toast.error("تعذّر النسخ — استخدم زر تصدير JSON");
    }
  }, [css]);

  const handleCopyJson = useCallback(async () => {
    const ok = await copyToClipboard(serializeStudioVariablesJson(variables));
    if (ok) toast.success("تم نسخ JSON المتغيرات");
    else toast.error("تعذّر نسخ JSON");
  }, [variables]);

  const handleExportJson = useCallback(() => {
    const json = serializeStudioVariablesJson(variables);
    try {
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "storefront-design-variables.json";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير متغيرات التصميم (JSON)");
    } catch {
      void copyToClipboard(json).then((ok) => {
        if (ok) toast.success("تم نسخ JSON المتغيرات بدل التنزيل");
        else toast.error("تعذّر تصدير JSON");
      });
    }
  }, [variables]);

  const handleImport = useCallback(() => {
    const result = parseStudioVariablesJson(importText);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    setImportError("");
    setDrafts({});
    onChange(result.variables);
    setShowImport(false);
    setImportText("");
    toast.success(`تم استيراد ${Object.keys(result.variables).length} متغيرًا`);
  }, [importText, onChange]);

  const handleResetAll = useCallback(() => {
    setDrafts({});
    onChange({});
  }, [onChange]);

  return (
    <div
      data-testid="studio-variables-panel"
      dir="rtl"
      className="flex h-full w-[340px] max-w-[85vw] shrink-0 flex-col border-e border-[#0c0d0f] bg-[#1a1b20] text-[#e8eaee] select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[#2b2d35] bg-[#141519] px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2b6cf6]/20 text-[#60a5fa]">
            <SwatchIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-bold text-white">متغيرات التصميم</h2>
            <p className="truncate text-[10px] text-[#9ba0a8]">
              {overriddenCount > 0 ? `${overriddenCount} متغير مخصص` : "القيم الافتراضية للتوكِنز"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            data-testid="studio-variables-close"
            onClick={onClose}
            aria-label="إغلاق متغيرات التصميم"
            className="rounded-md p-1 text-[#9ba0a8] hover:bg-[#252830] hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#2b2d35] px-3 py-2">
        <button
          type="button"
          data-testid="studio-variables-copy-css"
          onClick={() => void handleCopyCss()}
          className="flex items-center gap-1 rounded-md border border-[#2b6cf6]/50 bg-[#2b6cf6]/15 px-2 py-1 text-[10px] font-bold text-[#8fb6ff] hover:bg-[#2b6cf6]/25"
        >
          <ClipboardDocumentCheckIcon className="h-3.5 w-3.5" />
          {copied ? "تم النسخ ✓" : "نسخ CSS"}
        </button>
        <button
          type="button"
          data-testid="studio-variables-export-json"
          onClick={handleExportJson}
          disabled={readOnly}
          className="flex items-center gap-1 rounded-md border border-[#3a3d47] px-2 py-1 text-[10px] font-bold text-[#c9cfda] hover:bg-[#252830] disabled:opacity-40"
        >
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          تصدير JSON
        </button>
        <button
          type="button"
          data-testid="studio-variables-import-toggle"
          onClick={() => {
            setShowImport((prev) => !prev);
            setImportError("");
          }}
          disabled={readOnly}
          className="flex items-center gap-1 rounded-md border border-[#3a3d47] px-2 py-1 text-[10px] font-bold text-[#c9cfda] hover:bg-[#252830] disabled:opacity-40"
        >
          <ArrowUpTrayIcon className="h-3.5 w-3.5" />
          استيراد JSON
        </button>
        <button
          type="button"
          data-testid="studio-variables-copy-json"
          onClick={() => void handleCopyJson()}
          className="rounded-md border border-[#3a3d47] px-2 py-1 text-[10px] font-bold text-[#c9cfda] hover:bg-[#252830]"
        >
          نسخ JSON
        </button>
        <button
          type="button"
          data-testid="studio-variables-reset-all"
          onClick={handleResetAll}
          disabled={readOnly || overriddenCount === 0}
          className="rounded-md border border-[#3a3d47] px-2 py-1 text-[10px] font-bold text-[#f0a5a5] hover:bg-[#3a2323] disabled:opacity-40"
        >
          إرجاع الكل
        </button>
      </div>

      {/* Import box */}
      {showImport && (
        <div className="border-b border-[#2b2d35] bg-[#141519] px-3 py-2">
          <textarea
            data-testid="studio-variables-import-input"
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value);
              setImportError("");
            }}
            placeholder={'{ "variables": { "brand": "#123456" } }'}
            dir="ltr"
            rows={4}
            className="w-full resize-y rounded-md border border-[#3a3d47] bg-[#15161a] px-2 py-1.5 font-mono text-[10px] text-[#e8eaee] outline-none focus:border-[#2b6cf6]"
          />
          {importError && (
            <p data-testid="studio-variables-import-error" className="mt-1 text-[10px] text-[#f87171]">
              {importError}
            </p>
          )}
          <button
            type="button"
            data-testid="studio-variables-import-submit"
            onClick={handleImport}
            disabled={readOnly}
            className="mt-1.5 w-full rounded-md bg-[#2b6cf6] py-1.5 text-[10.5px] font-bold text-white hover:bg-[#1f5ae0] disabled:opacity-40"
          >
            تطبيق الاستيراد
          </button>
        </div>
      )}

      {/* Groups */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-2.5">
        <p className="text-[10px] leading-relaxed text-[#9ba0a8]">
          استخدم أي متغير في أي حقل تصميم عبر{" "}
          <code className="rounded bg-[#252830] px-1 font-mono text-[9.5px] text-[#8fb6ff]" dir="ltr">
            var(--sf-brand)
          </code>{" "}
          — تعديل القيمة هنا يحدّث كل الأقسام فورًا.
        </p>

        {STUDIO_VARIABLE_GROUPS.map((group) => {
          const definitions = STUDIO_VARIABLE_DEFINITIONS.filter(
            (definition) => definition.group === group.id
          );
          return (
            <section
              key={group.id}
              data-testid={`studio-variables-group-${group.id}`}
              className="space-y-1.5"
            >
              <header className="flex items-baseline justify-between">
                <h3 className="text-[11px] font-bold text-[#e8eaee]">{group.label}</h3>
                <span className="text-[9px] text-[#7d838f]">{group.hint}</span>
              </header>
              <div className="space-y-1">
                {definitions.map((definition) => (
                  <VariableRow
                    key={definition.name}
                    definition={definition}
                    value={resolved[definition.name] ?? definition.defaultValue}
                    isOverridden={overrides[definition.name] !== undefined}
                    draft={drafts[definition.name]}
                    readOnly={readOnly}
                    onEdit={handleEdit}
                    onReset={handleReset}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {customNames.length > 0 && (
          <section data-testid="studio-variables-group-custom" className="space-y-1.5">
            <header className="flex items-baseline justify-between">
              <h3 className="text-[11px] font-bold text-[#e8eaee]">متغيرات إضافية (مستوردة)</h3>
              <span className="text-[9px] text-[#7d838f]">custom</span>
            </header>
            <div className="space-y-1">
              {customNames.map((name) => (
                <VariableRow
                  key={name}
                  definition={{
                    name,
                    label: name,
                    group: "colors",
                    kind: "length",
                    defaultValue: resolved[name] ?? "",
                  }}
                  value={resolved[name] ?? ""}
                  isOverridden
                  draft={drafts[name]}
                  readOnly={readOnly}
                  onEdit={handleEdit}
                  onReset={handleReset}
                />
              ))}
            </div>
          </section>
        )}

        {/* Generated CSS preview */}
        <section data-testid="studio-variables-css-section" className="space-y-1">
          <h3 className="text-[11px] font-bold text-[#e8eaee]">CSS المولّد</h3>
          <pre
            data-testid="studio-variables-css-preview"
            dir="ltr"
            className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-[#2b2d35] bg-[#111216] p-2 font-mono text-[9px] leading-relaxed text-[#9fd0a8]"
          >
            {css}
          </pre>
        </section>
      </div>

      {/* Footer note */}
      <div className="border-t border-[#2b2d35] bg-[#141519] px-3 py-1.5">
        <p className="text-[9px] text-[#7d838f]">
          المتغيرات محفوظة مع الثيم — تبديل القالب لا يمسح تخصيصاتك.
        </p>
      </div>
    </div>
  );
};

export default StudioVariablesPanel;
