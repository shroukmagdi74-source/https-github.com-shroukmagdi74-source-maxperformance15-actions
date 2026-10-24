import React from "react";

import { CompanyLink } from "./types";
import { CompanyLinkCard } from "./CompanyLinkCard";
import { CompanyLinksEmpty } from "./CompanyLinksStates";

interface CompanyLinksListProps {
  links: CompanyLink[];
  canManage: boolean;
  openModeLabel: (mode?: CompanyLink["openMode"]) => string;
  onOpenLink: (link: CompanyLink) => void;
  onCopyUsername: (username: string) => void;
  onShowPassword: (link: CompanyLink) => void;
  onCopyPassword: (link: CompanyLink) => void;
  onEdit: (link: CompanyLink) => void;
  onDelete: (link: CompanyLink) => void;
}

export const CompanyLinksList: React.FC<CompanyLinksListProps> = ({
  links,
  canManage,
  openModeLabel,
  onOpenLink,
  onCopyUsername,
  onShowPassword,
  onCopyPassword,
  onEdit,
  onDelete,
}) => {
  if (links.length === 0) {
    return <CompanyLinksEmpty />;
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <CompanyLinkCard
          key={link.id}
          link={link}
          canManage={canManage}
          openModeLabel={openModeLabel}
          onOpenLink={onOpenLink}
          onCopyUsername={onCopyUsername}
          onShowPassword={onShowPassword}
          onCopyPassword={onCopyPassword}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
