import React from "react";
import { HERO_IMG } from "./types";

export const CafeAboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="container mx-auto px-6 pb-32 flex flex-col md:flex-row items-center gap-16 md:gap-24 relative max-w-6xl pt-10"
    >
      <div className="md:w-1/2 flex justify-center relative">
        <div className="w-[280px] h-[280px] sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] rounded-full overflow-hidden border-[16px] border-white shadow-xl relative z-10 transition-transform duration-500 hover:scale-105">
          <img
            src={HERO_IMG}
            alt="Latte Art"
            className="w-full h-full object-cover transform scale-125"
          />
        </div>
        <div className="absolute w-64 h-64 bg-[#FCD8DF] rounded-full -bottom-8 left-10 blur-3xl opacity-60 z-0" />
      </div>

      <div className="md:w-1/2 relative z-10 pl-0 md:pl-8 text-center md:text-left">
        <h2
          className="text-6xl md:text-7xl text-gray-800 mb-8"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Müt Coffee
        </h2>
        <div className="space-y-6">
          <p
            className="text-gray-500 text-[15px] leading-relaxed max-w-md mx-auto md:mx-0 text-justify"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Discover a new dimension of taste where precision meets artistry.
            Our skilled baristas ensure every cup highlights the natural
            complexity of the beans. Carefully extracted, beautifully presented,
            waiting for you to enjoy.
          </p>
        </div>
      </div>
    </section>
  );
};
