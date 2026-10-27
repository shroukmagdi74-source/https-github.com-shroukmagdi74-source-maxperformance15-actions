import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  hotelApi,
  HotelRoom,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
} from "../hotel/shared";
import { CELL_CLS, HotelModalState } from "./types";

interface HotelRoomsTabProps {
  rooms: HotelRoom[];
  setModal: (modal: HotelModalState | null) => void;
  handleDelete: (fn: () => Promise<any>) => void;
}

export const HotelRoomsTab: React.FC<HotelRoomsTabProps> = ({
  rooms,
  setModal,
  handleDelete,
}) => {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <table className="w-full text-xs text-right">
        <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground">
          <tr>
            <th className={CELL_CLS}>الغرفة</th>
            <th className={CELL_CLS + " text-center"}>الدور</th>
            <th className={CELL_CLS}>النوع</th>
            <th className={CELL_CLS + " text-center"}>الحالة</th>
            <th className={CELL_CLS}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 font-mono">
          {rooms.map((r) => (
            <tr key={r.id} className="hover:bg-muted/20 transition-colors">
              <td className={CELL_CLS + " font-bold text-foreground tabular-nums"}>
                {r.roomNumber}
              </td>
              <td className={CELL_CLS + " text-center tabular-nums text-muted-foreground"}>
                {r.floor || "-"}
              </td>
              <td className={CELL_CLS + " font-sans text-muted-foreground"}>
                {r.roomType?.name || "-"}
              </td>
              <td className={CELL_CLS + " text-center"}>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] border ${
                    ROOM_STATUS_COLORS[r.status] || ""
                  }`}
                >
                  {ROOM_STATUS_LABELS[r.status] || r.status}
                </span>
              </td>
              <td className={CELL_CLS}>
                <div className="flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModal({ type: "room", data: r })}
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label="تعديل الغرفة"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDelete(() => hotelApi.rooms.delete(r.id))
                    }
                    className="size-6 text-muted-foreground hover:text-destructive"
                    aria-label="حذف الغرفة"
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
