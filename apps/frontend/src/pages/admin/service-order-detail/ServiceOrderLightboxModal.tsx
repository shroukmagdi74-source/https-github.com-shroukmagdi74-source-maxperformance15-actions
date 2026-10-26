import React from "react";

interface ServiceOrderLightboxModalProps {
  selectedImage: string | null;
  onClose: () => void;
}

export const ServiceOrderLightboxModal: React.FC<ServiceOrderLightboxModalProps> = ({
  selectedImage,
  onClose,
}) => {
  if (!selectedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-4xl max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={selectedImage}
          alt="صورة مكبرة"
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-3 left-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
