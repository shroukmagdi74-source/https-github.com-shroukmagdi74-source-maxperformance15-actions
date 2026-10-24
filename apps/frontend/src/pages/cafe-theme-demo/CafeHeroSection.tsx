import React from "react";
import { TornPaperDivider } from "../../storefront/components/TornPaperDivider";
import { HERO_IMG } from "./types";

export const CafeHeroSection: React.FC = () => {
  return (
    <section className="bg-[#947771] relative text-[#F2ECE6]">
      <div className="container mx-auto px-6 pt-32 pb-32 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl z-20 text-center md:text-left">
          <h1
            className="text-5xl md:text-7xl leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sweet Moments
            <br />
            Start Here.
          </h1>
          <p
            className="opacity-80 text-[13px] leading-relaxed mb-8 max-w-sm mx-auto md:mx-0"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
            }}
          >
            The art of crafting perfect coffee moments starts from selecting the
            finest beans and transforming them into your daily bliss.
          </p>
          <a
            href="#menu"
            className="px-7 py-3 rounded-full border border-[#F2ECE6]/30 bg-[#745B56] hover:bg-[#5E4743] transition-colors text-xs font-bold tracking-[0.15em] uppercase shadow-lg mx-auto md:mx-0 inline-block"
          >
            EXPLORE MORE
          </a>
        </div>

        <div className="relative mt-16 md:mt-0 z-20 w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="relative inline-block drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500">
            <div className="w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-[10px] border-[#FDFBF7]/90 shadow-2xl relative bg-[#FCFBF8]">
              <img
                src={HERO_IMG}
                className="w-full h-full object-cover transform scale-110"
                alt="Hero Coffee Cup"
              />
            </div>
            <div className="absolute top-10 -right-2 md:-right-6 w-14 h-14 md:w-16 md:h-16 bg-[#F8D2D7] rounded-full flex items-center justify-center shadow-lg transform rotate-12">
              <div className="text-[10px] md:text-xs font-bold text-pink-700 text-center leading-tight">
                CAFE
                <br />
                VIBE
              </div>
            </div>
          </div>
        </div>
      </div>
      <TornPaperDivider
        colorClass="text-[#FDFBF7]"
        className="absolute -bottom-[1px] left-0 right-0 z-30 pointer-events-none"
      />
    </section>
  );
};
