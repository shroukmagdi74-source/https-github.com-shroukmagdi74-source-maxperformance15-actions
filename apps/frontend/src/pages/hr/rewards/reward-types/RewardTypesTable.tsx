import React from "react";
import { TFunction } from "i18next";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { canUserDeleteReward } from "../rewardRecordUtils";
import { RewardTypeRecord } from "./types";

interface RewardTypesTableProps {
  t: TFunction;
  types: RewardTypeRecord[];
  userRole?: string;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (type: RewardTypeRecord) => void;
  onDeleteClick: (type: RewardTypeRecord) => void;
}

export const RewardTypesTable: React.FC<RewardTypesTableProps> = ({
  t,
  types,
  userRole,
  onToggleStatus,
  onEdit,
  onDeleteClick,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("rewards.table.name")}</TableHead>
          <TableHead>{t("rewards.table.category")}</TableHead>
          <TableHead>{t("rewards.table.value")}</TableHead>
          <TableHead>{t("rewards.table.status")}</TableHead>
          <TableHead>{t("rewards.table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {types.map((type) => (
          <TableRow key={type.id}>
            <TableCell className="font-medium">{type.name}</TableCell>
            <TableCell>
              {t(`rewards.category.${type.category}`) || type.category}
            </TableCell>
            <TableCell className="font-mono tabular-nums">
              {type.calculationMethod === "FIXED_AMOUNT"
                ? `${type.value} ${t("rewards.form.currency")}`
                : `${type.value}%`}
            </TableCell>
            <TableCell>
              <Switch
                checked={type.isActive}
                onCheckedChange={() => onToggleStatus(type.id, type.isActive)}
              />
            </TableCell>
            <TableCell className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(type)}>
                <Edit className="h-4 w-4 text-blue-500" />
              </Button>
              {canUserDeleteReward(userRole) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClick(type)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
