import React from "react";

interface CafeToastProps {
  message: string;
}

export const CafeToast: React.FC<CafeToastProps> = ({ message }) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[110] transition-all duration-500 ease-out ${
        message
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium flex items-center gap-3">
        <svg
          className="w-5 h-5 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {message}
      </div>
    </div>
  );
};
