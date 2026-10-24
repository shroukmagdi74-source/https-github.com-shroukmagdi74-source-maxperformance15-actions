import React from "react";

interface CafeNavbarProps {
  isScrolled: boolean;
  cartTotalItems: number;
  onOpenCart: () => void;
  onOpenMobileMenu: () => void;
}

export const CafeNavbar: React.FC<CafeNavbarProps> = ({
  isScrolled,
  cartTotalItems,
  onOpenCart,
  onOpenMobileMenu,
}) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#947771]/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div
          className="text-3xl md:text-5xl tracking-tight cursor-pointer"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Coffee
        </div>

        <div className="hidden md:flex space-x-12 text-sm font-medium tracking-wide">
          <a href="#" className="border-b-[1.5px] border-[#F2ECE6] pb-1">
            Home
          </a>
          <a
            href="#menu"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            Menu
          </a>
          <a
            href="#about"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            About
          </a>
        </div>

        <div className="flex space-x-5 md:space-x-6 items-center">
          <svg
            className="w-5 h-5 cursor-pointer hover:opacity-80 hidden md:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div
            className="relative cursor-pointer hover:scale-110 transition-transform"
            onClick={onOpenCart}
            role="button"
            aria-label="Shopping Cart"
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartTotalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                {cartTotalItems}
              </div>
            )}
          </div>
          <div
            className="md:hidden cursor-pointer p-1"
            onClick={onOpenMobileMenu}
            role="button"
            aria-label="Open Mobile Menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};
