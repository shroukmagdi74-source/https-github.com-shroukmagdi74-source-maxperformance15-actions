import React from "react";
import {
  Copy,
  ExternalLink,
  Eye,
  Globe,
  LockKeyhole,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { CompanyLink } from "./types";

interface CompanyLinkCardProps {
  link: CompanyLink;
  canManage: boolean;
  openModeLabel: (mode?: CompanyLink["openMode"]) => string;
  onOpenLink: (link: CompanyLink) => void;
  onCopyUsername: (username: string) => void;
  onShowPassword: (link: CompanyLink) => void;
  onCopyPassword: (link: CompanyLink) => void;
  onEdit: (link: CompanyLink) => void;
  onDelete: (link: CompanyLink) => void;
}

export const CompanyLinkCard: React.FC<CompanyLinkCardProps> = ({
  link,
  canManage,
  openModeLabel,
  onOpenLink,
  onCopyUsername,
  onShowPassword,
  onCopyPassword,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <article className="group rounded-2xl border border-border/70 bg-background p-4 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{link.name}</h3>
            <Badge variant="outline" className="rounded-full">
              {openModeLabel(link.openMode)}
            </Badge>
            {link.hasPassword ? (
              <Badge
                variant="outline"
                className="rounded-full border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              >
                <LockKeyhole className="ml-1 size-3.5" />
                محمي بكلمة مرور
              </Badge>
            ) : null}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 size-4 shrink-0" />
              <span className="break-all">{link.url}</span>
            </div>
            {link.username ? (
              <div className="flex items-center gap-2">
                <UserRound className="size-4 shrink-0" />
                <span>{link.username}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl"
                onClick={() => onOpenLink(link)}
                aria-label={String(t("companyLinks.open"))}
              >
                <ExternalLink className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("companyLinks.open")}</TooltipContent>
          </Tooltip>

          {link.username ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-xl"
                  onClick={() => onCopyUsername(link.username || "")}
                  aria-label={String(t("companyLinks.copyUsername"))}
                >
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("companyLinks.copyUsername")}</TooltipContent>
            </Tooltip>
          ) : null}

          {canManage && link.hasPassword ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => onShowPassword(link)}
                    aria-label={String(t("companyLinks.showPassword"))}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("companyLinks.showPassword")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => onCopyPassword(link)}
                    aria-label={String(t("companyLinks.copyPassword"))}
                  >
                    <LockKeyhole className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("companyLinks.copyPassword")}</TooltipContent>
              </Tooltip>
            </>
          ) : null}

          {canManage ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl"
                    onClick={() => onEdit(link)}
                    aria-label={String(t("common.edit"))}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.edit")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                    onClick={() => onDelete(link)}
                    aria-label={String(t("common.delete"))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.delete")}</TooltipContent>
              </Tooltip>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
};
