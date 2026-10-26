import React from "react";

interface PosCategoriesRibbonProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const PosCategoriesRibbon: React.FC<PosCategoriesRibbonProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="border-b border-border/70 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-muted/20">
      {categories.map((c) => {
        const isSelected = selectedCategory === c;
        return (
          <button
            key={c}
            onClick={() => onSelectCategory(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition active:scale-[0.98] ${
              isSelected
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
};
