import React from "react";
import { ShippingSectionV2 } from "../../../components/store/ShippingSectionV2";
import { CheckoutAddressSettingsSection } from "../CheckoutAddressSettingsSection";
import { ShippingModalV2 } from "../../../components/store/ShippingModalV2";
import {
  CanonicalGovernorate,
  ShippingZone,
} from "../../../services/storeSettingsService";
import { ShippingClassOption } from "../../../constants/shippingClasses";
import { StorefrontSettings } from "../../../services/storefrontSettingsService";
import { StoreShippingClassesCard } from "./StoreShippingClassesCard";
import { PromotionSettingsState } from "./types";

interface StoreShippingTabProps {
  shippingZones: ShippingZone[];
  canonicalGovernorates: CanonicalGovernorate[];
  onAddShipping: () => void;
  onEditShipping: (zone: ShippingZone) => void;
  onDeleteShipping: (id: string) => void;
  shippingClasses: ShippingClassOption[];
  promotionSettings: PromotionSettingsState;
  onUpdatePromotionSettings: (data: PromotionSettingsState) => void;
  storefrontSettings: StorefrontSettings;
  setStorefrontSettings: React.Dispatch<React.SetStateAction<StorefrontSettings>>;
  shippingClassMode: "max" | "per_item";
  setShippingClassMode: (mode: "max" | "per_item") => void;
  shippingClassFees: Record<string, number>;
  setShippingClassFees: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  savingShippingClassFees: boolean;
  newShippingClassLabel: string;
  setNewShippingClassLabel: (label: string) => void;
  newShippingClassKey: string;
  setNewShippingClassKey: (key: string) => void;
  handleAddShippingClass: () => void;
  handleUpdateShippingClassLabel: (key: string, label: string) => void;
  handleRemoveShippingClass: (key: string) => void;
  handleSaveShippingClassFees: () => void;
  showShippingModal: boolean;
  onCloseShippingModal: () => void;
  onSaveShipping: () => void;
  shippingForm: Partial<ShippingZone>;
  setShippingForm: React.Dispatch<React.SetStateAction<Partial<ShippingZone>>>;
  isEditingShipping: boolean;
}

export const StoreShippingTab: React.FC<StoreShippingTabProps> = ({
  shippingZones,
  canonicalGovernorates,
  onAddShipping,
  onEditShipping,
  onDeleteShipping,
  shippingClasses,
  promotionSettings,
  onUpdatePromotionSettings,
  storefrontSettings,
  setStorefrontSettings,
  shippingClassMode,
  setShippingClassMode,
  shippingClassFees,
  setShippingClassFees,
  savingShippingClassFees,
  newShippingClassLabel,
  setNewShippingClassLabel,
  newShippingClassKey,
  setNewShippingClassKey,
  handleAddShippingClass,
  handleUpdateShippingClassLabel,
  handleRemoveShippingClass,
  handleSaveShippingClassFees,
  showShippingModal,
  onCloseShippingModal,
  onSaveShipping,
  shippingForm,
  setShippingForm,
  isEditingShipping,
}) => {
  return (
    <div className="space-y-6">
      <ShippingSectionV2
        zones={shippingZones}
        canonicalGovernorates={canonicalGovernorates}
        onAdd={onAddShipping}
        onEdit={onEditShipping}
        onDelete={onDeleteShipping}
        shippingClasses={shippingClasses}
        promotionSettings={promotionSettings}
        onUpdatePromotionSettings={onUpdatePromotionSettings}
      />

      <CheckoutAddressSettingsSection
        settings={storefrontSettings}
        onChange={(patch) =>
          setStorefrontSettings((prev) => ({ ...prev, ...patch }))
        }
      />

      <StoreShippingClassesCard
        shippingClassMode={shippingClassMode}
        setShippingClassMode={setShippingClassMode}
        shippingClasses={shippingClasses}
        shippingClassFees={shippingClassFees}
        setShippingClassFees={setShippingClassFees}
        savingShippingClassFees={savingShippingClassFees}
        newShippingClassLabel={newShippingClassLabel}
        setNewShippingClassLabel={setNewShippingClassLabel}
        newShippingClassKey={newShippingClassKey}
        setNewShippingClassKey={setNewShippingClassKey}
        handleAddShippingClass={handleAddShippingClass}
        handleUpdateShippingClassLabel={handleUpdateShippingClassLabel}
        handleRemoveShippingClass={handleRemoveShippingClass}
        handleSaveShippingClassFees={handleSaveShippingClassFees}
      />

      {showShippingModal && (
        <ShippingModalV2
          key={isEditingShipping ? "edit-zone" : "new-shipping-zone"}
          onClose={onCloseShippingModal}
          onSave={onSaveShipping}
          zone={shippingForm}
          onChange={(nextZone) =>
            setShippingForm((prev) => ({
              ...prev,
              ...nextZone,
            }))
          }
          canonicalGovernorates={canonicalGovernorates}
          isEditing={isEditingShipping}
        />
      )}
    </div>
  );
};
