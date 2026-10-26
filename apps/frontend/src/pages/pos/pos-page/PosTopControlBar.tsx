import React from "react";
import {
  Search,
  Coffee,
  FileText,
  Maximize,
  Minimize,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

interface PosTopControlBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  t: (key: string) => string;
}

export const PosTopControlBar: React.FC<PosTopControlBarProps> = ({
  searchQuery,
  setSearchQuery,
  searchRef,
  isFullscreen,
  setIsFullscreen,
  t,
}) => {
  const { actualTheme, toggleTheme } = useTheme();
  const isDark = actualTheme === "dark";

  return (
    <div className="border-b border-border/80 bg-card/40 backdrop-blur-xs px-4 py-2.5 flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          ref={searchRef as any}
          type="text"
          placeholder={t("posPage.searchPlaceholder")}
          className="w-full pr-9 pl-12 py-1.5 text-xs bg-muted/40 border border-border/80 text-foreground placeholder-muted-foreground rounded-lg focus:outline-hidden focus:border-primary transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground border border-border/60 px-1 rounded bg-background/80">
          F2
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href="/cafe/recipes"
          className="px-2.5 py-1.5 border border-border/80 bg-background/80 hover:bg-muted text-foreground rounded-lg transition active:scale-[0.98] flex items-center gap-1.5 text-xs font-medium"
          title="معايير الرسيبي وتكلفة المشروبات"
        >
          <Coffee className="size-3.5 text-amber-600" />
          <span className="hidden sm:inline">الرسيبي</span>
        </a>

        <a
          href="/cafe/audits"
          className="px-2.5 py-1.5 border border-border/80 bg-background/80 hover:bg-muted text-foreground rounded-lg transition active:scale-[0.98] flex items-center gap-1.5 text-xs font-medium"
          title="جلسات الجرد الفعلي للمخزن"
        >
          <FileText className="size-3.5 text-blue-600" />
          <span className="hidden sm:inline">الجرد</span>
        </a>

        <button
          onClick={() =>
            setIsFullscreen((f) => {
              if (f) {
                void document.exitFullscreen();
              } else {
                void document.documentElement.requestFullscreen();
              }
              return !f;
            })
          }
          className="p-1.5 border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition active:scale-[0.98]"
          title="ملء الشاشة"
        >
          {isFullscreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition active:scale-[0.98]"
          title={isDark ? t("posPage.toggleLightMode") : t("posPage.toggleDarkMode")}
        >
          {isDark ? (
            <Sun className="size-4 text-amber-500" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
};
