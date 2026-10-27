import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { hotelApi, HotelRoomType } from "../hotel/shared";
import { CELL_CLS, HotelModalState } from "./types";

interface HotelRoomTypesTabProps {
  roomTypes: HotelRoomType[];
  setModal: (modal: HotelModalState | null) => void;
  handleDelete: (fn: () => Promise<any>) => void;
}

export const HotelRoomTypesTab: React.FC<HotelRoomTypesTabProps> = ({
  roomTypes,
  setModal,
  handleDelete,
}) => {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <table className="w-full text-xs text-right">
        <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground">
          <tr>
            <th className={CELL_CLS}>الاسم</th>
            <th className={CELL_CLS}>العربية</th>
            <th className={CELL_CLS + " text-center"}>السعة</th>
            <th className={CELL_CLS + " text-center"}>السعر</th>
            <th className={CELL_CLS + " text-center"}>الغرف</th>
            <th className={CELL_CLS}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 font-mono">
          {roomTypes.map((rt) => (
            <tr key={rt.id} className="hover:bg-muted/20 transition-colors">
              <td className={CELL_CLS + " font-sans font-medium text-foreground"}>
                {rt.name}
              </td>
              <td className={CELL_CLS + " font-sans text-muted-foreground"}>
                {rt.nameAr || "-"}
              </td>
              <td className={CELL_CLS + " text-center tabular-nums"}>
                {rt.capacity}
              </td>
              <td className={CELL_CLS + " text-center font-bold text-foreground tabular-nums"}>
                {rt.basePrice} ج.م
              </td>
              <td className={CELL_CLS + " text-center tabular-nums text-muted-foreground"}>
                {rt._count?.rooms || 0}/{rt.totalRooms}
              </td>
              <td className={CELL_CLS}>
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModal({ type: "roomType", data: rt })}
                    className="size-6 text-muted-foreground hover:text-foreground"
                    title="تعديل"
                    aria-label="تعديل نوع الغرفة"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModal({ type: "priceTier", data: rt })}
                    className="h-6 px-1.5 text-[10px] font-mono"
                    title="تسعير حسب النزلاء"
                  >
                    1-4
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDelete(() => hotelApi.roomTypes.delete(rt.id))
                    }
                    className="size-6 text-muted-foreground hover:text-destructive"
                    title="حذف"
                    aria-label="حذف نوع الغرفة"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
