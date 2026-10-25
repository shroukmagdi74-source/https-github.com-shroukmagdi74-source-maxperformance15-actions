import React from "react";
import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BenefitsHeaderProps {
  onAddNew: () => void;
}

export const BenefitsHeader: React.FC<BenefitsHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
          <Gift className="h-8 w-8 text-primary" />
          المزايا والتعويضات
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          إدارة المزايا الإضافية وبرامج الرعاية الخاصة بالموظفين
        </p>
      </div>
      <Button
        onClick={onAddNew}
        className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        <Plus className="h-5 w-5 ml-2" />
        إضافة ميزة جديدة
      </Button>
    </div>
  );
};
