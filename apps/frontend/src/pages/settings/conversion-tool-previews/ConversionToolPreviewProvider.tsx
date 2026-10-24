import React from "react";
import { StorefrontThemeProvider } from "../../../storefront/engine/ThemeProvider";
import type { StorefrontThemeInput } from "../../../storefront/engine/themeResolver";
import { LIGHT_PREVIEW_TOKENS } from "./types";

/** مكوّنات المتجر المستوردة تستهلك سياق ثيم المتجر — الغلاف ده إلزامي حول أي معاينة */
export const PreviewTokensMode = React.createContext<"pinned" | "theme">("pinned");

/** بثيم التاجر: المحرك يطبق توكنات ثيمه؛ بدونه: توكنات فاتحة مثبتة */
export const ConversionToolPreviewProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: StorefrontThemeInput;
}> = ({ children, initialTheme }) => (
  <StorefrontThemeProvider initialTheme={initialTheme} scoped>
    <PreviewTokensMode.Provider value={initialTheme ? "theme" : "pinned"}>
      {children}
    </PreviewTokensMode.Provider>
  </StorefrontThemeProvider>
);

export const LightPreviewScope: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const mode = React.useContext(PreviewTokensMode);
  return (
    <div
      style={mode === "pinned" ? LIGHT_PREVIEW_TOKENS : undefined}
      className={`bg-white text-gray-900 ${className}`}
    >
      {children}
    </div>
  );
};
