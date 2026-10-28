import React from "react";
import { Search } from "lucide-react";

interface CompaniesTableEmptyStateProps {
  searchQuery?: string;
}

export const CompaniesTableEmptyState: React.FC<CompaniesTableEmptyStateProps> = ({
  searchQuery,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
        <Search className="size-8" />
      </div>
      <h3 className="mt-4 text-lg font-black text-foreground">
        {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : "لا توجد شركات مطابقة"}
      </h3>
      <p className="mt-1 text-xs font-medium text-muted-foreground/80">
        {searchQuery
          ? "لم نعثر على أي شركة تطابق بحثك. جرّب كلمات أخرى أو راجع الفلاتر."
          : "جرّب تعديل الفلاتر أو أضف شركة جديدة للبدء."}
      </p>
    </div>
  );
};
