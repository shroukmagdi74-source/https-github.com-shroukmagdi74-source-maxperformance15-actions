import React, { useMemo } from "react";
import { buildStudioVariablesCss } from "./utils/studioVariables";

export interface StudioVariablesStyleProps {
  /** Raw `designTokens.variables` payload (defaults are always emitted). */
  variables?: Record<string, unknown> | null;
}

/**
 * TOKENS-1 — Injects the merchant's `--sf-*` design variables at page level.
 *
 * Mounted once per document (studio canvas root + published storefront), so every
 * section that references `var(--sf-brand)` (or any other variable) re-renders with
 * the new value the moment the variable changes — no per-section edits required.
 */
export const StudioVariablesStyle: React.FC<StudioVariablesStyleProps> = ({ variables }) => {
  const css = useMemo(() => buildStudioVariablesCss(variables), [variables]);
  return (
    <style data-studio-variables="true" data-testid="studio-variables-style">
      {css}
    </style>
  );
};

export default StudioVariablesStyle;
