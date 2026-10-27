import React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  hotelApi,
  HotelReservation,
  HotelService,
  HotelRoomType,
  HotelRoomRate,
  FOLIO_TYPE_LABELS,
} from "../hotel/shared";
import { CELL_CLS, HotelModalState } from "./types";

interface HotelFolioRatesTabProps {
  folioSubTab: "folio" | "services" | "rates";
  reservations: HotelReservation[];
  services: HotelService[];
  filteredRoomTypes: HotelRoomType[];
  roomRates: HotelRoomRate[];
  setFolioSubTab: (subTab: "folio" | "services" | "rates") => void;
  setModal: (modal: HotelModalState | null) => void;
  loadAll: () => Promise<void>;
  setError: (msg: string) => void;
}

export const HotelFolioRatesTab: React.FC<HotelFolioRatesTabProps> = ({
  folioSubTab,
  reservations,
  services,
  filteredRoomTypes,
  roomRates,
  setFolioSubTab,
  setModal,
  loadAll,
  setError,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border/60 pb-2">
        {(["folio", "services", "rates"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFolioSubTab(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              folioSubTab === st
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {st === "folio"
              ? "الخدمات المضافة (Folio)"
              : st === "services"
              ? "كتالوج الخدمات"
              : "الأسعار الموسمية"}
          </button>
        ))}
      </div>

      {folioSubTab === "folio" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              الخدمات المسجلة للحجوزات النشطة
            </span>
            <Button
              size="sm"
              onClick={() => setModal({ type: "folio" })}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>إضافة خدمة لحجز</span>
            </Button>
          </div>
          {reservations
            .filter((r) => r.status === "CHECKED_IN" || r.status === "CONFIRMED")
            .map((r) => (
              <div
                key={r.id}
                className="border border-border/70 rounded-xl p-3 bg-muted/10 space-y-2"
              >
                <p className="font-semibold text-xs text-foreground">
                  {r.customerName} - {r.property?.name}
                </p>
                {r.folio?.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between text-xs text-muted-foreground font-mono"
                  >
                    <span>
                      {f.description}{" "}
                      <span className="text-muted-foreground/60">
                        ({FOLIO_TYPE_LABELS[f.itemType] || f.itemType})
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">
                        {f.amount * f.quantity} ج.م
                      </span>
                      <button
                        className="text-destructive hover:opacity-80 cursor-pointer"
                        onClick={async () => {
                          await hotelApi.folio.remove(r.id, f.id);
                          void loadAll();
                        }}
                        aria-label="إزالة الخدمة"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {folioSubTab === "services" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              كتالوج الخدمات المتاحة بالفندق
            </span>
            <Button
              size="sm"
              onClick={() => setModal({ type: "service" })}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>إضافة خدمة جديدة</span>
            </Button>
          </div>
          <div className="border border-border/60 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground">
                <tr>
                  <th className={CELL_CLS}>الخدمة</th>
                  <th className={CELL_CLS}>بالعربية</th>
                  <th className={CELL_CLS}>النوع</th>
                  <th className={CELL_CLS + " text-center"}>السعر</th>
                  <th className={CELL_CLS + " text-center"}>الحالة</th>
                  <th className={CELL_CLS}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className={CELL_CLS + " font-sans font-medium text-foreground"}>
                      {s.name}
                    </td>
                    <td className={CELL_CLS + " font-sans text-muted-foreground"}>
                      {s.nameAr || "-"}
                    </td>
                    <td className={CELL_CLS + " text-muted-foreground"}>
                      {FOLIO_TYPE_LABELS[s.itemType] || s.itemType}
                    </td>
                    <td className={CELL_CLS + " text-center font-bold text-foreground tabular-nums"}>
                      {s.price} ج.م
                    </td>
                    <td className={CELL_CLS + " text-center"}>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] border ${
                          s.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border/40"
                        }`}
                      >
                        {s.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className={CELL_CLS}>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setModal({ type: "service", data: s })}
                          className="size-6 text-muted-foreground hover:text-foreground"
                          aria-label="تعديل الخدمة"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await hotelApi.services.delete(s.id);
                              void loadAll();
                            } catch (e: any) {
                              setError(e.message || "فشل حذف الخدمة");
                            }
                          }}
                          className="size-6 text-muted-foreground hover:text-destructive"
                          aria-label="حذف الخدمة"
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
        </div>
      )}

      {folioSubTab === "rates" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              تخصيص الأسعار في المواسم والعطلات
            </span>
            <Button
              size="sm"
              onClick={() => setModal({ type: "rate" })}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>إضافة سعر موسمي</span>
            </Button>
          </div>
          <div className="space-y-2.5">
            {filteredRoomTypes.map((rt) => {
              const rtRates = roomRates.filter((r) => r.roomTypeId === rt.id);
              return (
                <div
                  key={rt.id}
                  className="border border-border/70 rounded-xl p-3 bg-muted/10"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">
                      {rt.name}
                    </span>
                    <span className="font-mono font-bold text-primary tabular-nums">
                      {rt.basePrice} ج.م (أساسي)
                    </span>
                  </div>
                  {rtRates.length > 0 ? (
                    <div className="mt-2 space-y-1 text-xs divide-y divide-border/30">
                      {rtRates.map((rr) => (
                        <div
                          key={rr.id}
                          className="flex justify-between items-center pt-1 text-muted-foreground font-mono"
                        >
                          <span>
                            {rr.label || "سعر موسمي"}:{" "}
                            <span className="tabular-nums">
                              {new Date(rr.dateFrom).toLocaleDateString("ar-EG")}
                            </span>{" "}
                            ←{" "}
                            <span className="tabular-nums">
                              {new Date(rr.dateTo).toLocaleDateString("ar-EG")}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-foreground tabular-nums">
                              {rr.price} ج.م
                            </span>
                            <button
                              className="text-destructive hover:opacity-80 cursor-pointer"
                              onClick={async () => {
                                await hotelApi.rates.delete(rr.id);
                                void loadAll();
                              }}
                              aria-label="حذف السعر الموسمي"
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      لا توجد أسعار موسمية مخصصة
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
