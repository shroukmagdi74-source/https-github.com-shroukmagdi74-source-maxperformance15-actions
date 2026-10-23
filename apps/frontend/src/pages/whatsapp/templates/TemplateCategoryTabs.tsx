import React from "react";
import { Cloud } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateCategoryTabsProps {
  templateCategory: string;
  onCategoryChange: (category: string) => void;
  availableCategoryEntries: [string, string][];
  metaCategoryCounts: Record<string, number>;
  metaSubCategory: string;
  onMetaSubCategoryChange: (sub: string) => void;
  isArabic: boolean;
}

export const TemplateCategoryTabs: React.FC<TemplateCategoryTabsProps> = ({
  templateCategory,
  onCategoryChange,
  availableCategoryEntries,
  metaCategoryCounts,
  metaSubCategory,
  onMetaSubCategoryChange,
  isArabic,
}) => {
  const metaSubCategories = [
    { id: "ALL", label: isArabic ? "الكل" : "All", count: metaCategoryCounts.ALL || 0 },
    { id: "ORDERS", label: isArabic ? "الطلبات" : "Orders", count: metaCategoryCounts.ORDERS || 0 },
    { id: "CUSTOMER", label: isArabic ? "العملاء والولاء" : "Customers & Loyalty", count: metaCategoryCounts.CUSTOMER || 0 },
    { id: "MARKETING", label: isArabic ? "التسويق" : "Marketing", count: metaCategoryCounts.MARKETING || 0 },
    { id: "ABANDONED_CART", label: isArabic ? "سلات متروكة" : "Abandoned Carts", count: metaCategoryCounts.ABANDONED_CART || 0 },
    { id: "PRODUCTS", label: isArabic ? "المنتجات" : "Products", count: metaCategoryCounts.PRODUCTS || 0 },
    { id: "SYSTEM", label: isArabic ? "النظام" : "System", count: metaCategoryCounts.SYSTEM || 0 },
  ];

  return (
    <div className="space-y-3">
      {/* Category filter tabs */}
      <Tabs
        value={templateCategory}
        onValueChange={onCategoryChange}
        className="w-full"
      >
        <TabsList className="flex h-auto flex-wrap justify-start gap-1.5 bg-transparent p-0">
          <TabsTrigger
            value="ALL"
            className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-[color:var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            {isArabic ? "جميع التصنيفات" : "All categories"}
          </TabsTrigger>
          <TabsTrigger
            value="META"
            className="rounded-full px-4 py-2 text-xs sm:text-sm font-medium data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-md dark:data-[state=active]:bg-sky-500"
          >
            <Cloud className="size-3.5 ml-1.5 inline" />
            {isArabic ? "قوالب ميتا" : "Meta Templates"}
            {metaCategoryCounts.ALL > 0 && (
              <span className="mr-1.5 rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-semibold tabular-nums font-mono text-sky-800 dark:text-sky-200">
                {metaCategoryCounts.ALL}
              </span>
            )}
          </TabsTrigger>
          {availableCategoryEntries.map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="rounded-full px-4 py-2 text-xs sm:text-sm data-[state=active]:bg-[color:var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Meta subcategories row */}
      {templateCategory === "META" && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] p-2.5 backdrop-blur-sm dark:border-sky-500/30 dark:bg-sky-500/10">
          <span className="text-xs font-semibold text-sky-800 dark:text-sky-300 ml-2">
            {isArabic ? "أقسام قوالب ميتا:" : "Meta Categories:"}
          </span>
          {metaSubCategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onMetaSubCategoryChange(sub.id)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                metaSubCategory === sub.id
                  ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                  : "border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              }`}
            >
              <span>{sub.label}</span>
              {sub.count > 0 && (
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.2 tabular-nums font-mono ${
                    metaSubCategory === sub.id
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-muted)] text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {sub.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
