// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import {
  DEFAULT_STUDIO_VARIABLES,
  SAFE_VARIABLE_FALLBACK,
  STUDIO_VARIABLE_DEFINITIONS,
  STUDIO_VARIABLE_GROUPS,
  applyStudioVariablesToTokens,
  buildStudioVariablesCss,
  getCustomStudioVariableNames,
  getStudioVariablesFromTokens,
  normalizeStudioVariables,
  parseStudioVariablesJson,
  preserveStudioVariablesOnThemeChange,
  resolveStudioVariableValue,
  resolveStudioVariables,
  resolveStudioVariablesInCss,
  serializeStudioVariablesJson,
} from "../studio/utils/studioVariables";
import { useStudioHistory } from "../studio/hooks/useStudioHistory";
import { StudioVariablesPanel } from "../studio/StudioVariablesPanel";
import { StudioVariablesStyle } from "../studio/StudioVariablesStyle";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const TWO_SECTIONS_CSS = [
  ".hero { background-color: var(--sf-brand); }",
  ".card { border-color: var(--sf-brand); }",
].join("\n");

describe("TOKENS-1 — Studio design variables manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Canonical variable catalog", () => {
    it("defines every required group with unique --sf names and defaults", () => {
      const groupIds = STUDIO_VARIABLE_GROUPS.map((group) => group.id);
      expect(groupIds).toEqual(["colors", "spacing", "radius", "shadows", "fontScale"]);

      const colorNames = STUDIO_VARIABLE_DEFINITIONS.filter((d) => d.group === "colors").map(
        (d) => d.name
      );
      expect(colorNames).toEqual(["brand", "text", "bg", "border", "success", "warn"]);

      const spacingNames = STUDIO_VARIABLE_DEFINITIONS.filter(
        (d) => d.group === "spacing"
      ).map((d) => d.name);
      expect(spacingNames).toEqual([
        "space-xs",
        "space-sm",
        "space-md",
        "space-lg",
        "space-xl",
        "space-2xl",
      ]);
      expect(STUDIO_VARIABLE_DEFINITIONS.some((d) => d.group === "radius")).toBe(true);
      expect(STUDIO_VARIABLE_DEFINITIONS.some((d) => d.group === "shadows")).toBe(true);
      expect(
        STUDIO_VARIABLE_DEFINITIONS.filter((d) => d.group === "fontScale")
      ).toHaveLength(6);

      const names = STUDIO_VARIABLE_DEFINITIONS.map((d) => d.name);
      expect(new Set(names).size).toBe(names.length);
      expect(DEFAULT_STUDIO_VARIABLES.brand).toBe("#2b6cf6");
      expect(DEFAULT_STUDIO_VARIABLES["space-md"]).toBe("16px");
    });
  });

  describe("2. Override normalization", () => {
    it("strips --sf/-- prefixes, trims values and rejects empty or unsafe CSS", () => {
      const normalized = normalizeStudioVariables({
        "--sf-brand": "  #123456  ",
        border: "red; background: url(javascript:alert(1))",
        bg: "   ",
        "space-md": 20,
        "Bad Name!": "#ffffff",
        text: null,
      });
      expect(normalized).toEqual({ brand: "#123456", "space-md": "20" });
      expect(resolveStudioVariables({ brand: "#123456" }).brand).toBe("#123456");
      // Unset variables fall back to the canonical default, never undefined.
      expect(resolveStudioVariables({ brand: "#123456" })["space-md"]).toBe("16px");
    });
  });

  describe("3. Generated CSS block", () => {
    it("emits :root with all defaults plus the override and no undefined values", () => {
      const css = buildStudioVariablesCss({ brand: "#123456" });
      expect(css.startsWith(":root {")).toBe(true);
      expect(css).toContain("--sf-brand: #123456;");
      expect(css).toContain("--sf-text: #0f172a;");
      expect(css).toContain("--sf-space-md: 16px;");
      expect(css).toContain("--sf-radius-lg: 20px;");
      expect(css).toContain("--sf-shadow-card:");
      expect(css).toContain("--sf-text-2xl: 36px;");
      expect(css).not.toContain("undefined");
      expect(css).not.toContain("null");
      expect(css.trim().endsWith("}")).toBe(true);
    });

    it("round-trips imported custom variables through serialization", () => {
      const json = serializeStudioVariablesJson({ brand: "#123456", "my-glow": "0 0 4px red" });
      const parsed = parseStudioVariablesJson(json);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.variables.brand).toBe("#123456");
        expect(parsed.variables["my-glow"]).toBe("0 0 4px red");
        expect(getCustomStudioVariableNames(parsed.variables)).toEqual(["my-glow"]);
      }
    });
  });

  describe("4. Live propagation across sections", () => {
    it("updates BOTH sections referencing --sf-brand after a single variable edit", () => {
      const first = resolveStudioVariablesInCss(TWO_SECTIONS_CSS, { brand: "#123456" });
      expect(first.match(/#123456/g)).toHaveLength(2);
      expect(first).not.toContain("var(--sf-brand)");

      const afterEdit = resolveStudioVariablesInCss(TWO_SECTIONS_CSS, { brand: "#654321" });
      expect(afterEdit.match(/#654321/g)).toHaveLength(2);
      expect(afterEdit).not.toContain("#123456");

      // Single source of truth: the variable is declared once in the generated block.
      const css = buildStudioVariablesCss({ brand: "#654321" });
      expect(css.match(/--sf-brand:/g)).toHaveLength(1);
      expect(css).toContain("--sf-brand: #654321;");
    });
  });

  describe("5. Reference resolution", () => {
    it("converts var(--sf-brand) to the concrete value in generated CSS", () => {
      expect(resolveStudioVariableValue("color: var(--sf-brand)", { brand: "#123456" })).toBe(
        "color: #123456"
      );
      expect(
        resolveStudioVariableValue("1px solid var( --sf-border )", { border: "#d1d5db" })
      ).toBe("1px solid #d1d5db");
      // Non-sf variables are left untouched.
      expect(resolveStudioVariableValue("color: var(--store-accent)")).toBe(
        "color: var(--store-accent)"
      );
    });

    it("negative: unknown variable falls back safely with no undefined in the CSS", () => {
      const css = resolveStudioVariablesInCss(
        ".a { color: var(--sf-does-not-exist); background: var(--sf-missing, #fff); }",
        { brand: "#123456" }
      );
      expect(css).toContain(`color: ${SAFE_VARIABLE_FALLBACK}`);
      expect(css).toContain("background: #fff");
      expect(css).not.toContain("undefined");
      expect(css).not.toContain("null");
      expect(css).not.toContain("var(--sf-does-not-exist");
    });
  });

  describe("6. Theme switching preserves merchant variables", () => {
    it("keeps custom --sf variables and custom names when a new theme is applied", () => {
      const current = {
        themeId: "modern-minimal",
        variables: { brand: "#123456", "brand-soft": "rgba(18, 52, 86, 0.2)" },
        pages: { home: [] },
      };
      const incoming = {
        themeId: "opulence",
        colors: { primary: "#000000" },
        pages: { home: [{ type: "hero" }] },
      };

      const merged = preserveStudioVariablesOnThemeChange(current, incoming);
      expect(merged.themeId).toBe("opulence");
      expect(merged.colors).toEqual({ primary: "#000000" });
      const mergedVariables = merged.variables as Record<string, string>;
      expect(mergedVariables.brand).toBe("#123456");
      expect(mergedVariables["brand-soft"]).toBe("rgba(18, 52, 86, 0.2)");
      expect(buildStudioVariablesCss(merged.variables)).toContain("--sf-brand: #123456;");
    });

    it("mirrors variables into the backend-preserved `global` bucket and reads them back", () => {
      const tokens = applyStudioVariablesToTokens(
        { themeId: "modern-minimal", global: { header: { menu: [] } } },
        { brand: "#123456" }
      );
      expect(tokens.variables).toEqual({ brand: "#123456" });
      const globalTokens = tokens.global as Record<string, unknown>;
      expect(globalTokens.variables).toEqual({ brand: "#123456" });
      expect(globalTokens.header).toEqual({ menu: [] });
      // Reading back from either location yields the same clean overrides.
      expect(getStudioVariablesFromTokens(tokens)).toEqual({ brand: "#123456" });
      expect(
        getStudioVariablesFromTokens({ global: { variables: { brand: "#123456" } } })
      ).toEqual({ brand: "#123456" });
    });

    it("leaves tokens untouched when the merchant has no custom variables", () => {
      const incoming = { themeId: "opulence", pages: { home: [] } };
      expect(preserveStudioVariablesOnThemeChange({ themeId: "x" }, incoming)).toEqual(incoming);
    });
  });

  describe("7. Panel UI", () => {
    it("renders all five groups, the brand field and the generated CSS preview", () => {
      render(<StudioVariablesPanel variables={{}} onChange={vi.fn()} />);

      expect(screen.getByTestId("studio-variables-panel")).toBeTruthy();
      STUDIO_VARIABLE_GROUPS.forEach((group) => {
        expect(screen.getByTestId(`studio-variables-group-${group.id}`)).toBeTruthy();
      });

      const brandInput = screen.getByTestId("studio-var-input-brand") as HTMLInputElement;
      expect(brandInput.value).toBe("#2b6cf6");

      const preview = screen.getByTestId("studio-variables-css-preview");
      expect(preview.textContent).toContain("--sf-brand: #2b6cf6;");
    });

    it("emits exactly one override update when a variable is edited", () => {
      const onChange = vi.fn();
      render(<StudioVariablesPanel variables={{}} onChange={onChange} />);

      fireEvent.change(screen.getByTestId("studio-var-input-brand"), {
        target: { value: "#123456" },
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({ brand: "#123456" });
    });

    it("re-renders the injected CSS when the variable value changes", () => {
      const { rerender } = render(
        <StudioVariablesPanel variables={{ brand: "#123456" }} onChange={vi.fn()} />
      );
      expect(screen.getByTestId("studio-variables-css-preview").textContent).toContain(
        "--sf-brand: #123456;"
      );

      rerender(<StudioVariablesPanel variables={{ brand: "#654321" }} onChange={vi.fn()} />);
      expect(screen.getByTestId("studio-variables-css-preview").textContent).toContain(
        "--sf-brand: #654321;"
      );
    });

    it("copies the generated CSS variables to the clipboard", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });

      render(<StudioVariablesPanel variables={{ brand: "#123456" }} onChange={vi.fn()} />);
      fireEvent.click(screen.getByTestId("studio-variables-copy-css"));

      await vi.waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      const copied = writeText.mock.calls[0]?.[0] as string;
      expect(copied).toContain("--sf-brand: #123456;");
      expect(copied).toContain("--sf-space-md: 16px;");
    });

    it("imports variables from JSON and reports invalid JSON without mutating state", () => {
      const onChange = vi.fn();
      render(<StudioVariablesPanel variables={{}} onChange={onChange} />);

      fireEvent.click(screen.getByTestId("studio-variables-import-toggle"));
      fireEvent.change(screen.getByTestId("studio-variables-import-input"), {
        target: { value: '{"variables":{"brand":"#abcdef","space-lg":"40px"}}' },
      });
      fireEvent.click(screen.getByTestId("studio-variables-import-submit"));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({ brand: "#abcdef", "space-lg": "40px" });

      onChange.mockClear();
      fireEvent.click(screen.getByTestId("studio-variables-import-toggle"));
      fireEvent.change(screen.getByTestId("studio-variables-import-input"), {
        target: { value: "this is not json" },
      });
      fireEvent.click(screen.getByTestId("studio-variables-import-submit"));

      expect(screen.getByTestId("studio-variables-import-error")).toBeTruthy();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("resets one variable back to its default value", () => {
      const onChange = vi.fn();
      render(<StudioVariablesPanel variables={{ brand: "#123456" }} onChange={onChange} />);

      fireEvent.click(screen.getByTestId("studio-var-reset-brand"));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({});
    });
  });

  describe("8. Single undo step", () => {
    it("a variable edit is one history entry and one undo restores the previous CSS", () => {
      const Harness: React.FC = () => {
        const [tokens, setTokens] = React.useState<{ variables: Record<string, string> }>({
          variables: {},
        });
        const { state, set, undo } = useStudioHistory<{
          variables: Record<string, string>;
        }>(tokens, { coalesceMs: 0, onChange: (next) => setTokens(next) });
        return (
          <div>
            <StudioVariablesPanel
              variables={state.variables}
              onChange={(next) => set({ variables: next })}
            />
            <button type="button" data-testid="undo" onClick={() => undo()}>
              undo
            </button>
            <span data-testid="current-brand">{state.variables.brand ?? "default"}</span>
          </div>
        );
      };

      render(<Harness />);

      fireEvent.change(screen.getByTestId("studio-var-input-brand"), {
        target: { value: "#123456" },
      });
      expect(screen.getByTestId("current-brand").textContent).toBe("#123456");
      expect(screen.getByTestId("studio-variables-css-preview").textContent).toContain(
        "--sf-brand: #123456;"
      );

      fireEvent.click(screen.getByTestId("undo"));
      expect(screen.getByTestId("current-brand").textContent).toBe("default");
      expect(screen.getByTestId("studio-variables-css-preview").textContent).toContain(
        `--sf-brand: ${DEFAULT_STUDIO_VARIABLES.brand};`
      );
    });
  });

  describe("9. Page-level style host", () => {
    it("injects a single <style> element carrying every generated variable", () => {
      render(<StudioVariablesStyle variables={{ brand: "#123456" }} />);
      const style = screen.getByTestId("studio-variables-style");
      expect(style.getAttribute("data-studio-variables")).toBe("true");
      expect(style.textContent).toContain("--sf-brand: #123456;");
      expect(style.textContent).toContain("--sf-text: #0f172a;");
      expect(style.textContent).not.toContain("undefined");
    });
  });
});
