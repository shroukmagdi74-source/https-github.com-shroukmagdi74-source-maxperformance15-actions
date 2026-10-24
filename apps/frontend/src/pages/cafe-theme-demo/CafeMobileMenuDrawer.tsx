import React from "react";

interface CafeMobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CafeMobileMenuDrawer: React.FC<CafeMobileMenuDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative w-72 max-w-[80vw] bg-[#FDFBF7] h-full shadow-2xl flex flex-col pt-10 px-6 animate-in slide-in-from-left duration-300">
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Close mobile menu"
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
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div
          className="text-4xl mb-12 text-[#947771]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Coffee
        </div>
        <div
          className="flex flex-col space-y-6 text-lg font-medium text-gray-700"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <a
            href="#"
            className="border-b border-gray-100 pb-2 hover:text-[#947771] transition-colors"
            onClick={onClose}
          >
            Home
          </a>
          <a
            href="#menu"
            className="border-b border-gray-100 pb-2 hover:text-[#947771] transition-colors"
            onClick={onClose}
          >
            Signature Menu
          </a>
          <a
            href="#about"
            className="border-b border-gray-100 pb-2 hover:text-[#947771] transition-colors"
            onClick={onClose}
          >
            Our Story
          </a>
          <a
            href="#"
            className="border-b border-gray-100 pb-2 hover:text-[#947771] transition-colors"
            onClick={onClose}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};
