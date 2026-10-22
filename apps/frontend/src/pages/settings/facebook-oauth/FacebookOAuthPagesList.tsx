import React from "react";
import { useTranslation } from "react-i18next";
import { Users, FileQuestion } from "lucide-react";
import { FacebookOAuthPageCard } from "./FacebookOAuthPageCard";
import type { AccountGroup } from "./types";

interface FacebookOAuthPagesListProps {
  accountGroups: AccountGroup[];
  selectedPageIds: string[];
  loading: boolean;
  onToggleSelect: (pageId: string) => void;
  onReconnect: (pageId: string) => void;
  onDisconnect: (pageId: string) => void;
  onHardDelete: (pageId: string) => void;
}

export const FacebookOAuthPagesList: React.FC<FacebookOAuthPagesListProps> = ({
  accountGroups,
  selectedPageIds,
  loading,
  onToggleSelect,
  onReconnect,
  onDisconnect,
  onHardDelete,
}) => {
  const { t } = useTranslation();

  const totalPages = accountGroups.reduce((acc, g) => acc + g.items.length, 0);

  if (totalPages === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-8 text-center bg-card/40">
        <FileQuestion className="h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-xs font-medium text-foreground">
          {t("facebookOAuth.noPagesFoundYet", "لا توجد صفحات مرتبطة حالياً")}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground max-w-sm">
          {t(
            "facebookOAuth.noPagesDesc",
            "قم بربط حساب فيسبوك للمزامنة واستقبال الرسائل والتعليقات.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accountGroups.map((group) => (
        <div key={group.key} className="space-y-2">
          {accountGroups.length > 1 && (
            <div className="flex items-center gap-2 px-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="text-xs font-semibold text-foreground">
                {group.label}
              </h4>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                ({group.items.length})
              </span>
            </div>
          )}

          <div className="space-y-2">
            {group.items.map((page) => (
              <FacebookOAuthPageCard
                key={page.id}
                page={page}
                isSelected={selectedPageIds.includes(page.id)}
                loading={loading}
                onToggleSelect={onToggleSelect}
                onReconnect={onReconnect}
                onDisconnect={onDisconnect}
                onHardDelete={onHardDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
