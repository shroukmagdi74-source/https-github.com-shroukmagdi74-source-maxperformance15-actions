import React from "react";
import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday } from "date-fns";

export interface MessageDateSeparatorProps {
  timestamp: string;
}

export const MessageDateSeparator: React.FC<MessageDateSeparatorProps> = ({ timestamp }) => {
  const { t } = useTranslation();

  const getDateSeparatorText = (time: string) => {
    const date = new Date(time);
    if (isToday(date)) {
      return t("whatsapp.window.today");
    }
    if (isYesterday(date)) {
      return t("whatsapp.window.yesterday");
    }
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="mb-space-2 flex justify-center">
      <div className="rounded-full border border-[color:var(--shell-control-border)] bg-[var(--whatsapp-surface)] px-space-3 py-space-1 text-xs text-[color:var(--color-muted-foreground)] shadow-xs">
        {getDateSeparatorText(timestamp)}
      </div>
    </div>
  );
};
