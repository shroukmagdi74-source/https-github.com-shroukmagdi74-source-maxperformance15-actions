import React from "react";
import { FooterSettingsSection } from "../../../components/store/FooterSettingsSection";
import { FooterSettings } from "../../../services/footerSettingsService";

interface StoreFooterTabProps {
  footerSettings: Partial<FooterSettings>;
  setFooterSettings: React.Dispatch<
    React.SetStateAction<Partial<FooterSettings>>
  >;
  socialLinks: Record<string, string>;
  onSocialLinksChange: (links: Record<string, string>) => void;
  onSave: () => void;
  onReset: () => void;
  loading: boolean;
}

export const StoreFooterTab: React.FC<StoreFooterTabProps> = ({
  footerSettings,
  setFooterSettings,
  socialLinks,
  onSocialLinksChange,
  onSave,
  onReset,
  loading,
}) => {
  return (
    <FooterSettingsSection
      settings={footerSettings}
      onChange={setFooterSettings}
      socialLinks={socialLinks}
      onSocialLinksChange={onSocialLinksChange}
      onSave={onSave}
      onReset={onReset}
      loading={loading}
    />
  );
};
