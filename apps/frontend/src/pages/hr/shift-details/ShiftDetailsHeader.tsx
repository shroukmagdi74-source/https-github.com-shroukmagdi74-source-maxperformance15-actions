import React from "react";
import { ArrowRight, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Shift } from "./types";

interface ShiftDetailsHeaderProps {
  shift: Shift;
  onBack: () => void;
  onAssignOpen: () => void;
  onEditOpen: () => void;
  onDeleteShift: () => void;
}

export const ShiftDetailsHeader: React.FC<ShiftDetailsHeaderProps> = ({
  shift,
  onBack,
  onAssignOpen,
  onEditOpen,
  onDeleteShift,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: shift.color }}
          />
          <div>
            <h1 className="text-3xl font-bold">{shift.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              تفاصيل المناوبة
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAssignOpen}>
          <UserPlus className="h-4 w-4 ml-2" />
          تعيين موظف
        </Button>
        <Button variant="outline" onClick={onEditOpen}>
          <Edit className="h-4 w-4 ml-2" />
          تعديل
        </Button>
        <Button
          variant="outline"
          onClick={onDeleteShift}
          className="text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 ml-2" />
          حذف
        </Button>
      </div>
    </div>
  );
};
