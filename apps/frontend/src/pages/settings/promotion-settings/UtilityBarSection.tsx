import { useTranslation } from "react-i18next";
import { PanelTop } from "lucide-react";
import { PromoSection } from "./PromoSection";
import { StatusPill } from "./StatusPill";

export interface UtilityBarSectionProps {
  hideUtilityBar: boolean;
  onToggleUtilityBar: (value: boolean) => void;
}

export function UtilityBarSection({
  hideUtilityBar,
  onToggleUtilityBar,
}: UtilityBarSectionProps) {
  const { t } = useTranslation();

  return (
    <PromoSection
      icon={PanelTop}
      title={t("promotionSettings.hideTopBarTitle")}
      description={t("promotionSettings.hideTopBarDesc")}
      isOn={hideUtilityBar}
      accentClassName={{
        sectionBorder: "border-amber-200/80",
        iconActive: "bg-amber-50 text-amber-700 ring-amber-200/70",
      }}
      pill={
        <StatusPill
          active={hideUtilityBar}
          activeLabel={t("promotionSettings.pillHidden")}
          inactiveLabel={t("promotionSettings.pillVisible")}
          warn
        />
      }
      switchChecked={hideUtilityBar}
      onSwitchChange={onToggleUtilityBar}
      switchLabel={t("promotionSettings.hideTopBarTitle")}
    />
  );
}
