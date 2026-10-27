import React from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { TabId, HotelModalState } from "./types";

interface HotelControlHeaderProps {
  propertiesCount: number;
  tab: TabId;
  setModal: (modal: HotelModalState | null) => void;
}

export const HotelControlHeader: React.FC<HotelControlHeaderProps> = ({
  propertiesCount,
  tab,
  setModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg border border-border/80 bg-card flex items-center justify-center text-foreground shadow-2xs">
          <Building2 className="size-4.5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              نظام إدارة الفنادق
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20 tabular-nums">
              {propertiesCount} فنادق
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            إدارة العقارات الفندقية، أنواع الغرف، الحجوزات، والخدمات الإضافية
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        {tab === "properties" && (
          <Button
            size="sm"
            onClick={() => setModal({ type: "property" })}
            className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform"
          >
            <Plus className="size-3.5" />
            <span>إضافة فندق</span>
          </Button>
        )}
        {tab === "roomTypes" && (
          <Button
            size="sm"
            onClick={() => setModal({ type: "roomType" })}
            className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform"
          >
            <Plus className="size-3.5" />
            <span>إضافة نوع غرفة</span>
          </Button>
        )}
        {tab === "rooms" && (
          <Button
            size="sm"
            onClick={() => setModal({ type: "room" })}
            className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform"
          >
            <Plus className="size-3.5" />
            <span>إضافة غرفة</span>
          </Button>
        )}
        {tab === "reservations" && (
          <Button
            size="sm"
            onClick={() => setModal({ type: "reservation" })}
            className="h-8 text-xs font-medium gap-1.5 shadow-2xs active:scale-[0.98] transition-transform"
          >
            <Plus className="size-3.5" />
            <span>حجز جديد</span>
          </Button>
        )}
      </div>
    </div>
  );
};
