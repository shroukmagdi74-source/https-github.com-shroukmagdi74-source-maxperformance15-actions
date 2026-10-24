import React from "react";
import { ShieldAlert, Link2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

interface CompanyLinksLoadingProps {
  count?: number;
}

export const CompanyLinksSkeleton: React.FC<CompanyLinksLoadingProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border/50 bg-muted/30 p-4"
        >
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="mt-2 h-3 w-56 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
};

interface CompanyLinksErrorProps {
  error: string;
}

export const CompanyLinksError: React.FC<CompanyLinksErrorProps> = ({ error }) => {
  return (
    <Alert variant="destructive">
      <ShieldAlert className="size-4" />
      <AlertTitle>تعذر تحميل الروابط</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export const CompanyLinksEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        <Link2 className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">لا توجد روابط مضافة</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        لم يتم إضافة أي روابط سريعة للشركة بعد. يمكنك إضافة روابط جديدة للمشاركة مع الفريق.
      </p>
    </div>
  );
};
