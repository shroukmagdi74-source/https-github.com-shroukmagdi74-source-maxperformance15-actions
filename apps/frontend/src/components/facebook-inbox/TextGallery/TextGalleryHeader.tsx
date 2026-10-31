import React from "react";
import { headingStyle, mutedStyle, successStyle } from "./types";

interface TextGalleryHeaderProps {
  count: number;
  onClose: () => void;
}

export const TextGalleryHeader: React.FC<TextGalleryHeaderProps> = ({
  count,
  onClose,
}) => {
  return (
    <div className="business-gallery-toolbar flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <svg
          className="h-6 w-6"
          style={successStyle}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-xl font-bold" style={headingStyle}>
          حافظة النصوص المحفوظة
        </h3>
        <span className="text-sm tabular-nums font-mono" style={mutedStyle}>
          ({count} نص)
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="business-icon-button"
        style={mutedStyle}
        aria-label="إغلاق الحافظة"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
