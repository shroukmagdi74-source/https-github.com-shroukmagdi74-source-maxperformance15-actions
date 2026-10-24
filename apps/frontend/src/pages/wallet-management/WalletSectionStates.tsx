import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SectionEmptyStateProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const SectionEmptyState: React.FC<SectionEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-muted/25 px-4 py-8 text-center">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export const SectionLoadingState: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="flex min-h-[16rem] items-center justify-center rounded-[1.5rem] border border-border/60 bg-muted/20">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </div>
    </div>
  );
};

export const SectionErrorNotice: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Alert variant="destructive" className="mb-4 text-right">
      <AlertCircle className="size-4" />
      <AlertTitle>تعذر تحميل هذا القسم</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
