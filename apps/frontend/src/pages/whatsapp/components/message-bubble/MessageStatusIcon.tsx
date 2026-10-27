import React from "react";
import { AlertTriangle, Check, CheckCheck, Clock3 } from "lucide-react";

export interface MessageStatusIconProps {
  status: string;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({ status }) => {
  switch (status) {
    case "SENT":
      return <Check className="size-3.5 text-[color:var(--color-muted-foreground)]" />;
    case "DELIVERED":
      return <CheckCheck className="size-3.5 text-[color:var(--color-muted-foreground)]" />;
    case "READ":
      return <CheckCheck className="size-3.5 text-sky-500" />;
    case "ERROR":
      return <AlertTriangle className="size-3.5 text-rose-500" />;
    case "PENDING":
    default:
      return <Clock3 className="size-3.5 text-[color:var(--color-muted-foreground)]" />;
  }
};
