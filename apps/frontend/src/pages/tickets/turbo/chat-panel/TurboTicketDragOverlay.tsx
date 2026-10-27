import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

export interface TurboTicketDragOverlayProps {
  isDragging: boolean;
}

export const TurboTicketDragOverlay: React.FC<TurboTicketDragOverlayProps> = ({
  isDragging,
}) => {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-40 bg-zinc-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center pointer-events-none animate-fadeIn">
      <div className="p-4 rounded-2xl bg-white/10 border-2 border-dashed border-white text-white shadow-xl">
        <PhotoIcon className="h-10 w-10 animate-bounce text-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-base text-white">أفلت الصورة أو لقطة الشاشة هنا</p>
        <p className="text-xs text-zinc-300 mt-1">سيتم إرفاقها بالتذكرة فوراً وتجهيزها للإرسال</p>
      </div>
    </div>
  );
};
