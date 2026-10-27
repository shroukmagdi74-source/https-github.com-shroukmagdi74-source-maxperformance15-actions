import React from "react";
import { Building2, Pencil, Trash2, Phone } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { hotelApi, HotelProperty } from "../hotel/shared";
import { HotelModalState } from "./types";

interface HotelPropertiesTabProps {
  properties: HotelProperty[];
  selectedProperty: string;
  setModal: (modal: HotelModalState | null) => void;
  handleDelete: (fn: () => Promise<any>) => void;
}

export const HotelPropertiesTab: React.FC<HotelPropertiesTabProps> = ({
  properties,
  selectedProperty,
  setModal,
  handleDelete,
}) => {
  const filtered = properties.filter(
    (p) => !selectedProperty || p.id === selectedProperty,
  );

  return (
    <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((p) => (
        <div
          key={p.id}
          className="border border-border/80 rounded-xl p-3.5 bg-muted/10 hover:bg-muted/25 transition-colors space-y-2.5"
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
              {p.city && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.city} - {p.address}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal({ type: "property", data: p })}
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label="تعديل الفندق"
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleDelete(() => hotelApi.properties.delete(p.id))
                }
                className="size-7 text-muted-foreground hover:text-destructive"
                aria-label="حذف الفندق"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>

          {p.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
              <Phone className="size-3 text-muted-foreground/70" />
              <span className="tabular-nums">{p.phone}</span>
            </p>
          )}

          <div className="text-[11px] text-muted-foreground font-mono flex items-center justify-between border-t border-border/40 pt-2">
            <span>
              الوصول: {p.checkInTime} | المغادرة: {p.checkOutTime}
            </span>
            <span className="tabular-nums">
              {p.roomTypes?.length || 0} أنواع غرف
            </span>
          </div>
        </div>
      ))}

      {properties.length === 0 && (
        <div className="p-12 text-center col-span-full border border-dashed border-border/80 rounded-xl">
          <Building2 className="size-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">لا توجد فنادق مسجلة بعد</p>
        </div>
      )}
    </div>
  );
};
