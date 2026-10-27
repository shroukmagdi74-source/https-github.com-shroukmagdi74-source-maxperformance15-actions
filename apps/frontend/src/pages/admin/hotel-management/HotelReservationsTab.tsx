import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  hotelApi,
  HotelReservation,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  FOLIO_TYPE_LABELS,
} from "../hotel/shared";
import { HotelModalState } from "./types";

interface HotelReservationsTabProps {
  reservations: HotelReservation[];
  loadAll: () => Promise<void>;
  setModal: (modal: HotelModalState | null) => void;
}

export const HotelReservationsTab: React.FC<HotelReservationsTabProps> = ({
  reservations,
  loadAll,
  setModal,
}) => {
  return (
    <div className="space-y-3">
      {reservations.map((r) => (
        <div
          key={r.id}
          className="border border-border/80 rounded-xl p-3.5 bg-muted/10 hover:bg-muted/20 transition-colors space-y-2.5"
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {r.customerName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {r.property?.name} |{" "}
                <span className="tabular-nums">
                  {new Date(r.checkIn).toLocaleDateString("ar-EG")}
                </span>{" "}
                ←{" "}
                <span className="tabular-nums">
                  {new Date(r.checkOut).toLocaleDateString("ar-EG")}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                <span className="tabular-nums">{r.adults}</span> بالغين،{" "}
                <span className="tabular-nums">{r.children}</span> أطفال |{" "}
                <span className="tabular-nums">{r.rooms?.length || 0}</span> غرف
              </p>
            </div>
            <div className="text-left font-mono shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  RESERVATION_STATUS_COLORS[r.status] || ""
                }`}
              >
                {RESERVATION_STATUS_LABELS[r.status] || r.status}
              </span>
              <p className="font-bold text-sm text-foreground tabular-nums mt-1">
                {r.totalAmount} ج.م
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {r.status === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-primary border-primary/30"
                onClick={async () => {
                  await hotelApi.reservations.updateStatus(r.id, "CONFIRMED");
                  void loadAll();
                }}
              >
                تأكيد الحجز
              </Button>
            )}
            {r.status === "CONFIRMED" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-emerald-600 border-emerald-500/30"
                onClick={async () => {
                  await hotelApi.reservations.updateStatus(r.id, "CHECKED_IN");
                  void loadAll();
                }}
              >
                تسجيل وصول
              </Button>
            )}
            {r.status === "CHECKED_IN" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-muted-foreground"
                onClick={async () => {
                  await hotelApi.reservations.updateStatus(r.id, "CHECKED_OUT");
                  void loadAll();
                }}
              >
                تسجيل مغادرة
              </Button>
            )}
            {(r.status === "PENDING" || r.status === "CONFIRMED") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await hotelApi.reservations.updateStatus(r.id, "CANCELLED");
                  void loadAll();
                }}
              >
                إلغاء
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() =>
                setModal({ type: "folio", data: { reservationId: r.id } })
              }
            >
              + إضافة خدمة
            </Button>
          </div>

          {r.folio?.length > 0 && (
            <div className="border-t border-border/40 pt-2 space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground">
                الخدمات الإضافية:
              </p>
              {r.folio.map((f) => (
                <div
                  key={f.id}
                  className="flex justify-between text-[11px] text-muted-foreground font-mono"
                >
                  <span>
                    {f.description} ({FOLIO_TYPE_LABELS[f.itemType] || f.itemType}) x
                    <span className="tabular-nums">{f.quantity}</span>
                  </span>
                  <span className="font-bold tabular-nums">
                    {f.amount * f.quantity} ج.م
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {reservations.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border/80 rounded-xl">
          <Calendar className="size-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">لا توجد حجوزات مسجلة</p>
        </div>
      )}
    </div>
  );
};
