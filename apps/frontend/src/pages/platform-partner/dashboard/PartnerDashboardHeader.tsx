import React from "react";
import { useTranslation } from "react-i18next";
import { Copy, Link as LinkIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

interface PartnerDashboardHeaderProps {
  partnerCode: string;
  partnerTitle: string;
  referralLink: string;
  copyToClipboard: (text: string, message: string) => void;
}

export const PartnerDashboardHeader: React.FC<PartnerDashboardHeaderProps> = ({
  partnerCode,
  partnerTitle,
  referralLink,
  copyToClipboard,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-xl bg-opacity-80">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {t("platformPartner.dashboard.hello")}{" "}
          <span className="text-blue-600 font-mono">{partnerCode}</span>
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-none">
            {t(`platformPartner.dashboard.ranks.${partnerTitle}`)}
          </Badge>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("platformPartner.dashboard.subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() =>
            copyToClipboard(
              partnerCode,
              t("platformPartner.dashboard.partnerCodeCopied"),
            )
          }
          className="gap-2 cursor-pointer"
        >
          <Copy className="w-4 h-4" /> {partnerCode}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer"
          onClick={() =>
            copyToClipboard(
              referralLink,
              t("platformPartner.dashboard.referralLinkCopied"),
            )
          }
        >
          <LinkIcon className="w-4 h-4" />{" "}
          {t("platformPartner.dashboard.copyLink")}
        </Button>
      </div>
    </div>
  );
};
