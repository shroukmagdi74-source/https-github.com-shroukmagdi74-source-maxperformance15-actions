import React from "react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BusinessPageHero } from "../../components/business/BusinessSurface";
import { Button } from "../../components/ui/button";

interface CompanyLinksHeaderProps {
  canManage: boolean;
  shareToken: string | null;
  shareUrl: string;
  onOpenCreate: () => void;
  onCopyShareLink: (url: string, message: string) => void;
  onGenerateShareLink: () => void;
  onRevokeShareLink: () => void;
}

export const CompanyLinksHeader: React.FC<CompanyLinksHeaderProps> = ({
  canManage,
  shareToken,
  shareUrl,
  onOpenCreate,
  onCopyShareLink,
  onGenerateShareLink,
  onRevokeShareLink,
}) => {
  const { t } = useTranslation();

  return (
    <BusinessPageHero
      title={
        <span className="business-page-title-row">
          <span className="business-page-title-copy">
            {t("companyLinks.title")}
          </span>
          <span className="business-page-title-artwork">
            <Link2 className="size-6" />
          </span>
        </span>
      }
      description="روابط الشركة السريعة وروابط المشاركة الثابتة."
      actions={
        canManage ? (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onOpenCreate}
              className="h-11"
            >
              <Plus className="size-4" />
              {t("companyLinks.addLink")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={
                shareToken
                  ? () => onCopyShareLink(shareUrl, t("companyLinks.shareLinkCopied"))
                  : onGenerateShareLink
              }
            >
              <Link2 className="size-4" />
              {shareToken ? t("companyLinks.copy") : t("companyLinks.createShareLink")}
            </Button>
            {shareToken ? (
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                onClick={onRevokeShareLink}
                aria-label={String(t("companyLinks.revokeShareLinkError"))}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null
      }
    />
  );
};
