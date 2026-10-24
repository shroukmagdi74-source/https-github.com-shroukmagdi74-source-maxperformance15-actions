import React from 'react';

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const ChatSidebarEmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface-overlay)] px-5 py-10 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-[color:var(--color-primary)]">
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
        {title}
      </p>
      <p className="mt-1 max-w-[20rem] text-xs leading-5 text-[color:var(--color-muted-foreground)]">
        {description}
      </p>
    </div>
  );
};
