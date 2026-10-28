/**
 * TOKENS-1 — Studio design variables manager (core, framework-free).
 *
 * Single source of truth for the storefront studio "Variables" feature:
 *  - canonical `--sf-<name>` design variables (colors / spacing / radius / shadows / font scale)
 *  - safe normalization of merchant overrides (no CSS injection, no undefined values)
 *  - CSS generation (`:root { --sf-brand: … }`) injected page-wide by `StudioVariablesStyle`
 *  - `var(--sf-x)` reference resolution with a safe fallback for unknown variables
 *  - JSON import/export + theme-switch preservation (MERCHANT_CONTENT_KEYS lesson)
 */

export type StudioVariableGroupId = "colors" | "spacing" | "radius" | "shadows" | "fontScale";

export type StudioVariableKind = "color" | "length" | "shadow";

export interface StudioVariableDefinition {
  /** Variable name without the `--sf-` prefix (e.g. `brand`). */
  name: string;
  /** Human label (Arabic UI). */
  label: string;
  group: StudioVariableGroupId;
  kind: StudioVariableKind;
  /** Canonical value used when the merchant has no override. */
  defaultValue: string;
}

export interface StudioVariableGroupDefinition {
  id: StudioVariableGroupId;
  label: string;
  hint: string;
}

/** Merchant overrides: variable name (without prefix) → CSS value. */
export type StudioVariableValues = Record<string, string>;

export const STUDIO_VARIABLE_CSS_PREFIX = "--sf-";

/** Used whenever a `var(--sf-*)` reference cannot be resolved. Never `undefined`. */
export const SAFE_VARIABLE_FALLBACK = "initial";

export const STUDIO_VARIABLE_GROUPS: StudioVariableGroupDefinition[] = [
  { id: "colors", label: "الألوان", hint: "brand / text / bg / border / success / warn" },
  { id: "spacing", label: "المسافات", hint: "xs … 2xl" },
  { id: "radius", label: "الانحناءات (Radius)", hint: "sm / md / lg / pill" },
  { id: "shadows", label: "الظلال", hint: "soft / card / elevated" },
  { id: "fontScale", label: "مقياس الخطوط", hint: "xs … 2xl" },
];

export const STUDIO_VARIABLE_DEFINITIONS: StudioVariableDefinition[] = [
  // Colors
  { name: "brand", label: "اللون الأساسي", group: "colors", kind: "color", defaultValue: "#2b6cf6" },
  { name: "text", label: "لون النص", group: "colors", kind: "color", defaultValue: "#0f172a" },
  { name: "bg", label: "لون الخلفية", group: "colors", kind: "color", defaultValue: "#ffffff" },
  { name: "border", label: "لون الحدود", group: "colors", kind: "color", defaultValue: "#e5e7eb" },
  { name: "success", label: "لون النجاح", group: "colors", kind: "color", defaultValue: "#16a34a" },
  { name: "warn", label: "لون التحذير", group: "colors", kind: "color", defaultValue: "#f59e0b" },
  // Spacing
  { name: "space-xs", label: "مسافة xs", group: "spacing", kind: "length", defaultValue: "4px" },
  { name: "space-sm", label: "مسافة sm", group: "spacing", kind: "length", defaultValue: "8px" },
  { name: "space-md", label: "مسافة md", group: "spacing", kind: "length", defaultValue: "16px" },
  { name: "space-lg", label: "مسافة lg", group: "spacing", kind: "length", defaultValue: "24px" },
  { name: "space-xl", label: "مسافة xl", group: "spacing", kind: "length", defaultValue: "32px" },
  { name: "space-2xl", label: "مسافة 2xl", group: "spacing", kind: "length", defaultValue: "48px" },
  // Radius
  { name: "radius-sm", label: "انحناء sm", group: "radius", kind: "length", defaultValue: "6px" },
  { name: "radius-md", label: "انحناء md", group: "radius", kind: "length", defaultValue: "12px" },
  { name: "radius-lg", label: "انحناء lg", group: "radius", kind: "length", defaultValue: "20px" },
  { name: "radius-pill", label: "انحناء كبسولة", group: "radius", kind: "length", defaultValue: "999px" },
  // Shadows
  {
    name: "shadow-soft",
    label: "ظل ناعم",
    group: "shadows",
    kind: "shadow",
    defaultValue: "0 1px 2px rgba(15, 23, 42, 0.06)",
  },
  {
    name: "shadow-card",
    label: "ظل بطاقة",
    group: "shadows",
    kind: "shadow",
    defaultValue: "0 8px 24px rgba(15, 23, 42, 0.10)",
  },
  {
    name: "shadow-elevated",
    label: "ظل مرتفع",
    group: "shadows",
    kind: "shadow",
    defaultValue: "0 18px 48px rgba(15, 23, 42, 0.18)",
  },
  // Font scale
  { name: "text-xs", label: "نص xs", group: "fontScale", kind: "length", defaultValue: "12px" },
  { name: "text-sm", label: "نص sm", group: "fontScale", kind: "length", defaultValue: "14px" },
  { name: "text-md", label: "نص md", group: "fontScale", kind: "length", defaultValue: "16px" },
  { name: "text-lg", label: "نص lg", group: "fontScale", kind: "length", defaultValue: "20px" },
  { name: "text-xl", label: "نص xl", group: "fontScale", kind: "length", defaultValue: "28px" },
  { name: "text-2xl", label: "نص 2xl", group: "fontScale", kind: "length", defaultValue: "36px" },
];

export const DEFAULT_STUDIO_VARIABLES: StudioVariableValues = STUDIO_VARIABLE_DEFINITIONS.reduce(
  (acc, definition) => {
    acc[definition.name] = definition.defaultValue;
    return acc;
  },
  {} as StudioVariableValues
);

const KNOWN_VARIABLE_NAMES = new Set(STUDIO_VARIABLE_DEFINITIONS.map((definition) => definition.name));

/** `var(--sf-x)` / `var(--sf-x, fallback)` (one nesting level inside the fallback). */
const SF_VAR_REFERENCE_RE = /var\(\s*(--sf-[a-zA-Z0-9-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g;

const VARIABLE_NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** Rejects anything that could break out of a declaration or inject markup. */
const UNSAFE_CSS_VALUE_RE = /[<>{};\\]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isKnownStudioVariable(name: string): boolean {
  return KNOWN_VARIABLE_NAMES.has(name);
}

export function getStudioVariableDefinitions(group?: StudioVariableGroupId): StudioVariableDefinition[] {
  if (!group) return STUDIO_VARIABLE_DEFINITIONS;
  return STUDIO_VARIABLE_DEFINITIONS.filter((definition) => definition.group === group);
}

/** `--sf-brand` / `--brand` / ` Brand ` → `brand` (or `null` when invalid). */
export function normalizeStudioVariableName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let name = raw.trim().toLowerCase();
  if (!name) return null;
  if (name.startsWith(STUDIO_VARIABLE_CSS_PREFIX)) {
    name = name.slice(STUDIO_VARIABLE_CSS_PREFIX.length);
  } else if (name.startsWith("--")) {
    name = name.slice(2);
  }
  name = name.replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!name || !VARIABLE_NAME_RE.test(name)) return null;
  return name;
}

/** Returns a safe CSS value string, or `null` when the value is empty/unsafe. */
export function sanitizeStudioVariableValue(raw: unknown): string | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;
  if (UNSAFE_CSS_VALUE_RE.test(value)) return null;
  if (/\bundefined\b|\bnull\b/i.test(value)) return null;
  return value;
}

/**
 * Normalizes merchant overrides into a clean map.
 * Accepts either a raw map or `{ variables: { … } }`; strips prefixes, drops invalid entries.
 */
export function normalizeStudioVariables(input: unknown): StudioVariableValues {
  const source = isRecord(input) && isRecord(input["variables"]) ? input["variables"] : input;
  if (!isRecord(source)) return {};
  const normalized: StudioVariableValues = {};
  for (const [rawName, rawValue] of Object.entries(source)) {
    const name = normalizeStudioVariableName(rawName);
    if (!name) continue;
    const value = sanitizeStudioVariableValue(rawValue);
    if (!value) continue;
    normalized[name] = value;
  }
  return normalized;
}

/** Full variable map: canonical defaults overridden by the merchant's clean overrides. */
export function resolveStudioVariables(input?: unknown): StudioVariableValues {
  return { ...DEFAULT_STUDIO_VARIABLES, ...normalizeStudioVariables(input) };
}

/** Extra (non-canonical) variable names present in the merchant overrides. */
export function getCustomStudioVariableNames(input?: unknown): string[] {
  return Object.keys(normalizeStudioVariables(input))
    .filter((name) => !KNOWN_VARIABLE_NAMES.has(name))
    .sort();
}

/**
 * Builds the page-level CSS block. Always defines every canonical variable, so
 * consumers never see an undefined custom property.
 */
export function buildStudioVariablesCss(input?: unknown, selector = ":root"): string {
  const resolved = resolveStudioVariables(input);
  const orderedNames = [
    ...STUDIO_VARIABLE_DEFINITIONS.map((definition) => definition.name),
    ...Object.keys(resolved)
      .filter((name) => !KNOWN_VARIABLE_NAMES.has(name))
      .sort(),
  ];
  const lines = orderedNames.map((name) => `  ${STUDIO_VARIABLE_CSS_PREFIX}${name}: ${resolved[name]};`);
  return [`${selector} {`, ...lines, "}"].join("\n");
}

/**
 * Resolves every `var(--sf-*)` reference to its concrete value.
 * Unknown variables use the inline fallback when present, otherwise `initial`.
 * Never emits `undefined`.
 */
export function resolveStudioVariableValue(value: string, input?: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "";
  const resolved = resolveStudioVariables(input);
  let output = value;
  for (let pass = 0; pass < 5; pass += 1) {
    let changed = false;
    output = output.replace(SF_VAR_REFERENCE_RE, (_match, cssName: string, fallback?: string) => {
      changed = true;
      const name = cssName.slice(STUDIO_VARIABLE_CSS_PREFIX.length);
      const concrete = resolved[name];
      if (concrete) return concrete;
      const inlineFallback = typeof fallback === "string" ? fallback.trim() : "";
      return inlineFallback || SAFE_VARIABLE_FALLBACK;
    });
    if (!changed) break;
  }
  return output;
}

/** Resolves `var(--sf-*)` inside a full CSS payload and scrubs accidental JS placeholders. */
export function resolveStudioVariablesInCss(cssText: string, input?: unknown): string {
  if (typeof cssText !== "string" || cssText.length === 0) return "";
  return resolveStudioVariableValue(cssText, input)
    .replace(/\bundefined\b/g, SAFE_VARIABLE_FALLBACK)
    .replace(/\bNaN\b/g, SAFE_VARIABLE_FALLBACK);
}

/** Applies the variables to a single design field value (`color`, `background`, `border`, `boxShadow`, …). */
export function applyStudioVariablesToValue(value: unknown, input?: unknown): unknown {
  if (typeof value !== "string" || !value.includes("var(--sf-")) return value;
  return resolveStudioVariableValue(value, input);
}

export type StudioVariablesParseResult =
  | { ok: true; variables: StudioVariableValues }
  | { ok: false; error: string };

/** Parses an imported JSON payload (raw map or `{ variables: { … } }`). */
export function parseStudioVariablesJson(raw: string): StudioVariablesParseResult {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "ألصق JSON المتغيرات أولًا" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSON غير صالح — تحقق من الأقواس والفواصل" };
  }
  if (!isRecord(parsed)) {
    return { ok: false, error: "الصيغة غير مدعومة — المتوقع كائن مثل { \"brand\": \"#123456\" }" };
  }
  const variables = normalizeStudioVariables(parsed);
  if (Object.keys(variables).length === 0) {
    return { ok: false, error: "لا توجد متغيرات صالحة في هذا الملف" };
  }
  return { ok: true, variables };
}

/** Pretty JSON export (round-trips through `parseStudioVariablesJson`). */
export function serializeStudioVariablesJson(input?: unknown): string {
  return JSON.stringify({ variables: resolveStudioVariables(input) }, null, 2);
}

/**
 * Extracts the clean overrides from design tokens.
 *
 * Canonical location is `designTokens.variables`, mirrored into
 * `designTokens.global.variables` because the backend theme-switch merge only
 * preserves the MERCHANT_CONTENT_KEYS whitelist (`global` among them) — this is
 * what keeps merchant variables alive across theme changes without a backend change.
 */
export function getStudioVariablesFromTokens(
  tokens: Record<string, unknown> | null | undefined
): StudioVariableValues {
  const source = isRecord(tokens) ? tokens : undefined;
  const explicit = normalizeStudioVariables(source?.["variables"]);
  const globalTokens =
    source && isRecord(source["global"]) ? source["global"] : undefined;
  const mirrored = normalizeStudioVariables(globalTokens?.["variables"]);
  return { ...mirrored, ...explicit };
}

/** Writes the overrides to both the explicit key and the backend-preserved `global` bucket. */
export function applyStudioVariablesToTokens(
  currentTokens: Record<string, unknown> | null | undefined,
  nextVariables: unknown
): Record<string, unknown> {
  const current = isRecord(currentTokens) ? currentTokens : {};
  const clean = normalizeStudioVariables(nextVariables);
  const currentGlobal = isRecord(current["global"]) ? { ...current["global"] } : {};
  const nextGlobal: Record<string, unknown> = { ...currentGlobal, variables: clean };
  if (Object.keys(clean).length === 0) {
    delete nextGlobal["variables"];
  }
  return { ...current, variables: clean, global: nextGlobal };
}

/**
 * Theme switching must never destroy merchant-authored variables
 * (same lesson as MERCHANT_CONTENT_KEYS on the backend).
 */
export function preserveStudioVariablesOnThemeChange(
  currentTokens: Record<string, unknown> | null | undefined,
  nextTokens: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const next: Record<string, unknown> = isRecord(nextTokens) ? { ...nextTokens } : {};
  const currentVariables = getStudioVariablesFromTokens(currentTokens);
  if (Object.keys(currentVariables).length === 0) return next;
  const merged = { ...getStudioVariablesFromTokens(next), ...currentVariables };
  const nextGlobal = isRecord(next["global"]) ? { ...next["global"] } : {};
  next["variables"] = merged;
  next["global"] = { ...nextGlobal, variables: merged };
  return next;
}
