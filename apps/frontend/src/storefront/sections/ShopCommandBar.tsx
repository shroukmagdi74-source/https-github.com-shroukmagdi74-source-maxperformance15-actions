import React from 'react';
import { ShopCommandBarProps } from './shop-command-bar/types';
import { useShopCommandBarController } from './shop-command-bar/useShopCommandBarController';
import {
  GracefulBarVariant,
  ButcherCutConsoleVariant,
  SimpleToolbarVariant,
  OccasionPlannerVariant,
  SoftSortBarVariant,
  ElessiDigitalToolbar,
  ElessiBikeToolbar,
  ElessiOrganicToolbar,
  ElessiBagToolbar,
  ElessiPlantToolbar,
  StandardDeckVariant,
} from './shop-command-bar';

export * from './shop-command-bar';

export const ShopCommandBar: React.FC<ShopCommandBarProps> = ({ section, settings }) => {
  const ctrl = useShopCommandBarController(section, settings);

  if (ctrl.isGracefulBar) {
    return <GracefulBarVariant ctrl={ctrl} />;
  }

  if (ctrl.isButcherCutConsole) {
    return <ButcherCutConsoleVariant ctrl={ctrl} />;
  }

  if (ctrl.simpleToolbar) {
    return <SimpleToolbarVariant ctrl={ctrl} />;
  }

  if (ctrl.isOccasionPlanner) {
    return <OccasionPlannerVariant ctrl={ctrl} />;
  }

  if (ctrl.isSoftSortBar) {
    return <SoftSortBarVariant ctrl={ctrl} />;
  }

  if (ctrl.isElessiDigitalToolbar) {
    return <ElessiDigitalToolbar ctrl={ctrl} />;
  }

  if (ctrl.isElessiBikeToolbar) {
    return <ElessiBikeToolbar ctrl={ctrl} />;
  }

  if (ctrl.isElessiOrganicToolbar) {
    return <ElessiOrganicToolbar ctrl={ctrl} />;
  }

  if (ctrl.isElessiBagToolbar) {
    return <ElessiBagToolbar ctrl={ctrl} />;
  }

  if (ctrl.isElessiPlantToolbar) {
    return <ElessiPlantToolbar ctrl={ctrl} />;
  }

  return <StandardDeckVariant ctrl={ctrl} />;
};

export default ShopCommandBar;
