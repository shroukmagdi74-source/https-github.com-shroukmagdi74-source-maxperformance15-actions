import React from "react";

export interface TurboTicketImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const TurboTicketImageLightbox: React.FC<TurboTicketImageLightboxProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
    >
      <img
        src={imageUrl}
        alt="معاينة المرفق"
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
      />
    </div>
  );
};
